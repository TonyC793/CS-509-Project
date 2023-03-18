// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const mysql = require("mysql");

var config = require("./config.json");
var pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
})

function query(conx, sql, params) {
    return new Promise((resolve, reject) => {
        conx.query(sql, params, function(err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

let mySqlErrorHandler = function(error) {
    if (error.code == '') { // <---- Insert in '' the error code, you need to find out
        // Connection timeout, no further action (no throw)
    } else {
        // Oh, a different error, abort then
        throw error;
    }
}

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
 
 
 exports.lambdaHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    response = {
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Methods" : "POST",
            },
    }
    
    console.log(event);
    let actual_body = event.body;
    let info = JSON.parse(actual_body);
    console.log("info:" + JSON.stringify(info));
    
    let ValidateValues = (sku, quantity) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Item WHERE i_sku=?", [sku], (error, rows) => {
                if (error) {
                    return reject(error);
                } else if (rows.length !== 1) {
                    return resolve(false);
                } else {
                    return resolve(true);
                }
            })
        })
    }
    
    let GetMaxQ = (store_id, sku, quantity) => {
        return new Promise((resolve, reject) => {
            let max_q;
            pool.query("SELECT * FROM Item WHERE i_sku=?", [sku], (error, rows) => {
                if (error) {
                    return reject(error);
                } else if (rows.length !== 1) {
                    return resolve(false);
                } else {
                    return resolve(rows[0].i_max_q);
                }
            })
        })
    }
    
    let CheckForExistingInventory = (store_id, sku) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Inventory WHERE inv_store_id=? AND inv_sku=?", [store_id, sku], (error, rows) => {
                if (error) {
                    return reject(error);
                } else if (rows.length === 0) {
                    return resolve(false);
                } else {
                    return resolve(rows[0].inv_qty);
                }
            })
        })
    }
    
    let InitializeInventory = (store_id, sku, quantity, max_q) => {
        return new Promise((resolve, reject) => {
            if (max_q >= quantity) {
                pool.query("INSERT INTO Inventory (inv_store_id, inv_sku, inv_qty) VALUES (?, ?, ?)", [store_id, sku, quantity], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else {
                        return resolve(0);
                    }
                })
            } else {
                pool.query("INSERT INTO Inventory (inv_store_id, inv_sku, inv_qty) VALUES (?, ?, ?)", [store_id, sku, max_q], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else {
                        return resolve(quantity - max_q);
                    }
                })
            }
        })
    }
    
    let UpdateInventory = (store_id, sku, quantity, max_q, onShelf) => {
        return new Promise((resolve, reject) => {        
            if ((onShelf + quantity) <= max_q) {
                pool.query("UPDATE Inventory SET inv_qty=? WHERE inv_store_id=? AND inv_sku=?", [(onShelf + quantity), store_id, sku], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else {
                        return resolve(0);
                    }
                })
            } else {
                pool.query("UPDATE Inventory SET inv_qty=? WHERE inv_store_id=? AND inv_sku=?", [max_q, store_id, sku], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else {
                        return resolve((onShelf + quantity) - max_q);
                    }
                })
            }
        })
    }
    
    let CheckForExistingOverstock = (store_id, sku) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Overstock WHERE o_store_id=? AND o_sku=?", [store_id, sku], (error, rows) => {
                if (error) {
                    return reject(error);
                } else if (rows.length === 0) {
                    return resolve("none");
                } else {
                    return resolve(rows[0].o_qty);
                }
            })
        })
    }
            
    let InitializeOverstock = (store_id, sku, quantity) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO Overstock (o_store_id, o_sku, o_qty) VALUES (?, ?, ?)", [store_id, sku, quantity], (error, rows) => {
                if (error) { 
                    return reject(error); 
                } else {
                    return resolve(true);
                }
            })
        })
    }
    
    let UpdateOverstock = (store_id, sku, quantity, inOverstock) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Overstock SET o_qty=? WHERE o_store_id=? AND o_sku=?", [(inOverstock + quantity), store_id, sku], (error, rows) => {
                if (error) { 
                    return reject(error); 
                } else {
                    return resolve(true);
                }
            })
        })
    }
    
    let ValidateManagerUser = (m_username, m_password) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Store WHERE s_manager_name=? AND s_manager_pw=?", [m_username, m_password], (error, rows) => {
                if (error) { 
                    return reject(error); 
                } else if (rows.length === 0) {
                    return resolve(false);
                } else {
                    return resolve(true);
                }
            })
        })
    }
    
    let body = {};
    
    try {
        let numericInputs = true;
        
        for (var i = 0; i < info.quantity.length; i++) {
            if (isNaN(parseInt(info.quantity[i]))) {
                numericInputs = false;
                break;
            }
        }
        
        let values_valid = true;
        if (numericInputs) {
            for (var i = 0; i < info.sku.length; i++) {
                if (!(await ValidateValues(info.sku[i], info.quantity[i]))) {
                    values_valid = false;
                    break;
                }
            }
        }
        
        
        let userValid = await ValidateManagerUser(info.m_username, info.m_password);
        
        if (!userValid) {
            response.statusCode = 400;
            response.error = "user not authenticated, please log in from home page";
        } else if (!numericInputs) {
            response.statusCode = 400;
            response.error = "non-numeric price input.";
        } else if (!values_valid) {
            response.statusCode = 400;
            response.error = "invalid SKU or quantity";
        } else {
            let entries = [];
            for (var i = 0; i < info.sku.length; i++) {
                let qty_value = parseInt(info.quantity[i]);
                let currentSku = info.sku[i];
                let maxQ = await GetMaxQ(info.store_id, currentSku, qty_value);
                let onShelf = await CheckForExistingInventory(info.store_id, currentSku);
                let overstockQty;
                if (!onShelf) {
                    overstockQty = await InitializeInventory(info.store_id, currentSku, qty_value, maxQ);
                } else {
                    overstockQty = await UpdateInventory(info.store_id, currentSku, qty_value, maxQ, onShelf);
                }
                
                let inOverstock = await CheckForExistingOverstock(info.store_id, currentSku);
                if (inOverstock === "none") {
                    await InitializeOverstock(info.store_id, currentSku, overstockQty);
                } else {
                    await UpdateOverstock(info.store_id, currentSku, overstockQty, inOverstock);
                }
                entries.push({
                    "addedToShelf" : qty_value - overstockQty,
                    "addedToOverstock" : overstockQty
                })
            }
            body["result"] = entries;
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

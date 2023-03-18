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
    
    let GetItemsInOverstock = (store_id) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * from Overstock WHERE o_store_id=?", [store_id], (error, rows) => {
                if (error) { 
                    return reject(error); 
                } else {
                    return resolve(rows);
                }
            })
        })
    }
    
    let GetMatchingInventory = (store_id, sku) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * from Inventory WHERE inv_store_id=? AND inv_sku=?", [store_id, sku], (error, rows) => {
                if (error) { 
                    return reject(error); 
                } else {
                    return resolve(rows[0]);
                }
            })
        })
    }
    
    let SetNewOverstockQty = (store_id, sku, newOQty) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Overstock SET o_qty=? WHERE o_store_id=? AND o_sku=?", [newOQty, store_id, sku], (error, rows) => {
                if (error) { 
                    return reject(error); 
                } else {
                    return resolve(true);
                }
            })
        })
    }
    
    let GetMaxQ = (sku) => {
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
    
    let SetNewInventoryQty = (store_id, sku, newInvQty) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Inventory SET inv_qty=? WHERE inv_store_id=? AND inv_sku=?", [newInvQty, store_id, sku], (error, rows) => {
                if (error) { 
                    return reject(error); 
                } else {
                    return resolve(true);
                }
            })
        })
    }
    
    let body = {};
    
    try {
        let userValid = await ValidateManagerUser(info.m_username, info.m_password);
        
        if (!userValid) {
            response.statusCode = 400;
            response.error = "user not authenticated, please log in from home page";
        } else {
            let overstockItems = await GetItemsInOverstock(info.store_id);
            let updates = [];
            for (const item of overstockItems) {
                let matchingInv = await GetMatchingInventory(info.store_id, item.o_sku);
                let maxQ = await GetMaxQ(item.o_sku);
                let newOverstockQty, newInvQty;
                if (matchingInv.inv_qty < maxQ) {
                    if ((item.o_qty + matchingInv.inv_qty) <= maxQ) {
                        newInvQty = item.o_qty + matchingInv.inv_qty;
                        newOverstockQty = 0;
                    } else {
                        newInvQty = maxQ;
                        newOverstockQty = item.o_qty - (maxQ - matchingInv.inv_qty);
                    }
                    await SetNewInventoryQty(info.store_id, matchingInv.inv_sku, newInvQty);
                    await SetNewOverstockQty(info.store_id, item.o_sku, newOverstockQty);
                    updates.push(matchingInv.inv_sku + "\nNew Shelf Quantity: " + newInvQty + "\nNew Overstock Quantity: " + newOverstockQty);
                } else {
                    updates.push(item.o_sku + " already has full shelf");
                }
            }
            body["result"] = updates;
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

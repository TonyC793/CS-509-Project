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
    
    let GetAllItems = () => {
        return new Promise((resolve, reject) => {
            let max_q;
            pool.query("SELECT * FROM Item", (error, rows) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(rows);
                }
            })
        })
    }
    
    let GetAllInventory = (store_id) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Inventory WHERE inv_store_id=?", [store_id], (error, rows) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(rows);
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
            let missingItems = [];
            let allItems = await GetAllItems();
            let allInventory = await GetAllInventory(info.store_id);
            let found;
            let itemQty;
            for (const item of allItems) {
                found = false;
                for (const inv of allInventory) {
                    if (inv.inv_sku === item.i_sku) {
                        found = true;
                        itemQty = inv.inv_qty;
                    }
                }
                if (found) {
                    if (itemQty === 0) {
                        missingItems.push("Item SKU: " + item.i_sku + " Item Name: " + item.i_name);
                    }
                } else {
                    missingItems.push("Item SKU: " + item.i_sku + " Item Name: " + item.i_name);
                }
            }
            
            body["result"] = missingItems;
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

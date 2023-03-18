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
    
    let CheckItemIsInInventory = (store_id, sku) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Inventory WHERE inv_store_id=? AND inv_sku=?", [store_id, sku], (error, rows) => {
                if (error) { 
                    return reject(error); 
                } else {
                    return resolve(rows.length !== 0);
                }
            })
        })
    }
    
    let GetShelfQuantity = (store_id, sku) => {
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
        let quantity_value = parseFloat(info.quantity);
        let itemInInventory = await CheckItemIsInInventory(info.store_id, info.sku);
        let oldShelfQuantity = await GetShelfQuantity(info.store_id, info.sku);
        let newShelfQuantity = oldShelfQuantity - quantity_value;
        if (isNaN(quantity_value)) {
            response.statusCode = 400;
            response.error = "non-numeric quantity input.";
        } else if (quantity_value < 0) {
            response.statusCode = 400;
            response.error = "cannot buy negative quantity of items";
        } else if (!itemInInventory) {
            response.statusCode = 400;
            response.error = "item not found in store's inventory";
        } else if (newShelfQuantity < 0) {
            response.statusCode = 400;
            response.error = "attempting to buy more than is on shelf";
        } else {
            await SetNewInventoryQty(info.store_id, info.sku, newShelfQuantity)
            body["result"] = "successfully purchased " + quantity_value + " from " + info.store_id;
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

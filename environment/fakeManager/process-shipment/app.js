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
                } else if (rows[0].i_max_q < quantity) {
                    return resolve(false);
                } else {
                    return resolve(true);
                }
            })
        })
    }
    
    let ProcessShipment = (store_id, sku, quantity) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO Inventory (inv_store_id, inv_sku, inv_qty) VALUES (?, ?, ?)", [store_id, sku, quantity], (error, rows) => {
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
        let qty_value = parseInt(info.quantity);
        let values_valid = await ValidateValues(info.sku, info.quantity);
        
        if (isNaN(qty_value)) {
            response.statusCode = 400;
            response.error = "non-numeric price input.";
        } else if (!values_valid) {
            response.statusCode = 400;
            response.error = "invalid SKU or quantity";
        } else {
            body["result"] = await ProcessShipment(info.store_id, info.sku, info.quantity);
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

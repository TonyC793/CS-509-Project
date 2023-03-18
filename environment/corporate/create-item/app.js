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
    
    let AddItemToDB = (sku, item_name, description, price, max_q) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO Item (i_sku, i_name, i_desc, i_price, i_max_q) VALUES (?, ?, ?, ?, ?)", [sku, item_name, description, price, max_q], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else {
                        pool.query("SELECT * FROM Item", (error, rows) => {
                            let newItemList = [];
                            for (const row of rows) {
                                newItemList.push({
                                    "sku" : row.i_sku,
                                    "name" : row.i_name,
                                    "description" : row.i_desc,
                                    "price" : row.i_price,
                                    "max_q" : row.i_max_q
                                });
                            }
                            return resolve(newItemList);
                        })
                    }
                })
        })
    }
    
    let ValidateCorporateUser = (c_username, c_password) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Corporate WHERE c_name=? AND c_pw=?", [c_username, c_password], (error, rows) => {
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
        let price_value = parseFloat(info.price);
        let max_q_value = parseInt(info.max_q);
        let store_name = info.store_name;
        let userValid = await ValidateCorporateUser(info.c_username, info.c_password);
        if (!userValid) {
            response.statusCode = 400;
            response.error = "user not authenticated, please log in from home page";
        } else if (isNaN(price_value)) {
            response.statusCode = 400;
            response.error = "non-numeric price input.";
        } else if (isNaN(max_q_value)) {
            response.statusCode = 400;
            response.error = "non-int max quantity input";
        } else {
            body["result"] = await AddItemToDB(info.sku, info.item_name, info.desc, info.price, info.max_q);
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

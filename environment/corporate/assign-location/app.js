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
    
    let AddItemToAisleAndShelf = (sku, aisle_num, shelf_num) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Item WHERE i_sku=?", [sku], (error, rows) => {
                if (error) {
                    return reject(error);
                } else if (rows.length === 0) {
                    return resolve("The item with SKU " + sku + " is not in the item database and cannot be assigned a location")
                } else {
                    pool.query("INSERT INTO Location (l_sku, l_aisle, l_shelf) VALUES (?, ?, ?)", [sku, aisle_num, shelf_num], (error, rows) => {
                        if (error) { 
                            return reject(error); 
                        } else {
                            return resolve("Successfully added " + sku + " to aisle " + aisle_num + ", shelf " + shelf_num);
                        }
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
        let aisle_value = parseInt(info.aisle);
        let shelf_value = parseInt(info.shelf);
        let userValid = await ValidateCorporateUser(info.c_username, info.c_password);
        if (!userValid) {
            response.statusCode = 400;
            response.error = "user not authenticated, please log in from home page";
        } else if (isNaN(aisle_value)) {
            response.statusCode = 400;
            response.error = "non-int aisle input.";
        } else if (isNaN(shelf_value)) {
            response.statusCode = 400;
            response.error = "non-int shelf input";
        } else {
            body["result"] = await AddItemToAisleAndShelf(info.sku, info.aisle, info.shelf);
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

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

function makeStoreID(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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
    
    let AddStoreToDB = (lat, long, store_name, manager_name, manager_pw) => {
        let store_id = makeStoreID(10);
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO Store (s_store_id, s_latitude, s_longitude, s_name, s_manager_name, s_manager_pw) VALUES (?, ?, ?, ?, ?, ?)", [store_id, lat, long, store_name, manager_name, manager_pw], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else {
                        pool.query("SELECT * FROM Store", (error, rows) => {
                            let newStoreList = [];
                            for (const row of rows) {
                                newStoreList.push({
                                    "store_id" : row.s_store_id,
                                    "lat" : row.s_latitude,
                                    "long" : row.s_longitude,
                                    "store_name" : row.s_name,
                                    "manager_name" : row.s_manager_name,
                                    "manager_pw" : row.s_manager_pw
                                });
                            }
                            return resolve(newStoreList);
                        })
                    }
                })
        })
    }
    
    let body = {};
    
    try {
        let latitude_value = parseFloat(info.latitude);
        let longitude_value = parseFloat(info.longitude);
        let store_name = info.store_name;
        let manager_name = info.manager_name;
        let manager_pw = info.manager_pw;
        let userValid = await ValidateCorporateUser(info.c_username, info.c_password);
        if (!userValid) {
            response.statusCode = 400;
            response.error = "user not authenticated, please log in from home page";
        } else if (isNaN(latitude_value) || isNaN(longitude_value)) {
            response.statusCode = 400;
            response.error = "non-numeric GPS input.";
        } else if ((latitude_value > 90) || (latitude_value < -90)) {
            response.statusCode = 400;
            response.error = "latitude out of range.";
        } else if ((longitude_value > 180) || (longitude_value < -180)) {
            response.statusCode = 400;
            response.error = "longitude out of range.";
        } else {
            body["result"] = await AddStoreToDB(latitude_value, longitude_value, store_name, manager_name, manager_pw);
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

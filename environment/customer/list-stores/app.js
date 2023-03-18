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

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
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
    
    let GetStoresFromDB = (lat, long) => {
        return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM Store", (error, rows) => {
                    let storeList = [];
                    for (const row of rows) {
                        storeList.push({
                            "store_id" : row.s_store_id,
                            "lat" : row.s_latitude,
                            "long" : row.s_longitude,
                            "store_name" : row.s_name,
                            "distanceFromCustomer" : getDistanceFromLatLonInKm(lat, long, row.s_latitude, row.s_longitude)
                        });
                    }
                    return resolve(storeList);
                })
        })
    }
    
    let OrderStoresByDistance = (storeList) => {
        return storeList.sort(function(a, b){return a.distanceFromCustomer - b.distanceFromCustomer});
    }
    
    let body = {};
    
    try {
        let latitude_value = parseFloat(info.latitude);
        let longitude_value = parseFloat(info.longitude);
        if (isNaN(latitude_value) || isNaN(longitude_value)) {
            response.statusCode = 400;
            response.error = "non-numeric GPS input.";
        } else if ((latitude_value > 90) || (latitude_value < -90)) {
            response.statusCode = 400;
            response.error = "latitude out of range.";
        } else if ((longitude_value > 180) || (longitude_value < -180)) {
            response.statusCode = 400;
            response.error = "longitude out of range.";
        } else {
            let unsortedStoreList = await GetStoresFromDB(latitude_value, longitude_value);
            let sortedStoreList = await OrderStoresByDistance(unsortedStoreList);
            body["result"] = sortedStoreList;
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

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
    
    let findItemsByLocation = (aisle, shelf) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Location WHERE l_aisle=? AND l_shelf=?", [aisle, shelf], (error, rows) => {
                if (error) {
                    return reject(error);
                } else {
                    let skuList = [];
                    for (const row of rows) {
                        skuList.push(row.l_sku);
                    }
                    return resolve(skuList); 
                }
            })
        })
    }
    
    let GetItemQuantityFromStore = (store_id, sku) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Inventory WHERE inv_store_id=? AND inv_sku=?", [store_id, sku], (error, rows) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(rows[0].inv_qty);
                }
            })
        })
    }
    
    let GetItemNameFromSKU = (sku) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Item WHERE i_sku=?", [sku], (error, rows) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(rows[0].i_name);
                }
            })
        })
    }
    
    let GetItemDescFromSKU = (sku) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Item WHERE i_sku=?", [sku], (error, rows) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(rows[0].i_desc);
                }
            })
        })
    }
    
    let CheckStoreID = (store_id) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Store WHERE s_store_id=?", [store_id], (error, rows) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(rows.length === 1);
                }
            })
        })
    }
    
    let body = {};
    
    try {
        let aisle_value = parseInt(info.aisle);
        let shelf_value = parseInt(info.shelf);
        let valid_store_id = await CheckStoreID(info.store_id);
        if (isNaN(aisle_value) || isNaN(shelf_value)) {
            response.statusCode = 400;
            response.error = "non-numeric aisle/shelf input.";
        } else if (!valid_store_id) {
            response.statusCode = 400;
            response.error = "store id not in database.";
        } else {
            let itemsAndQuantities = [];
            let skuList = await findItemsByLocation(aisle_value, shelf_value);
            for (const sku of skuList) {
                let itemData = {};
                itemData["name"] = await GetItemNameFromSKU(sku);
                itemData["desc"] = await GetItemDescFromSKU(sku);
                itemData["qty"] = await GetItemQuantityFromStore(info.store_id, sku);
                itemsAndQuantities.push(itemData);
            }
            body["result"] = itemsAndQuantities;
            response.statusCode = 200;
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

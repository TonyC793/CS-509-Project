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
    
    let FindItemBySKU = (sku) => {
        return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM Item WHERE i_sku=?", [sku], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else if (rows.length === 0) {
                        return resolve(false);
                    } else {
                        return resolve(rows[0].i_sku);
                    }
                })
        })
    }
    
    let FindItemByName = (name) => {
        return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM Item WHERE i_name LIKE '%" + name + "%'", (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else if (rows.length === 0) {
                        return resolve(false);
                    } else {
                        return resolve(rows[0].i_sku);
                    }
                })
        })
    }
    
    let FindItemByDesc = (desc) => {
        return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM Item WHERE i_desc LIKE '%" + desc + "%'", (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else if (rows.length === 0) {
                        return resolve(false);
                    } else {
                        return resolve(rows[0].i_sku);
                    }
                })
        })
    }
    
    let CheckInventoriesForItem = (sku) => {
        return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM Inventory WHERE inv_sku=?", [sku], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else if (rows.length === 0) {
                        return resolve(false);
                    } else {
                        return resolve(rows);
                    }
                })
        })
    }
    
    let FindStoreOfInventory = (store_id) => {
        return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM Store WHERE s_store_id=?", [store_id], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    } else if (rows.length === 0) {
                        return resolve(false);
                    } else {
                        return resolve(rows[0]);
                    }
                })
        })
    }
    
    let CalculateStoreDistances = (stores, lat, long) => {
        let storeList = [];
        for (const store of stores) {
            storeList.push({
                "store_id" : store.s_store_id,
                "lat" : store.s_latitude,
                "long" : store.s_longitude,
                "store_name" : store.s_name,
                "qty" : store.qty,
                "distanceFromCustomer" : getDistanceFromLatLonInKm(lat, long, store.s_latitude, store.s_longitude)
            });
        }
        return storeList;
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
            let item_sku;
            if (info.sku !== "") {
                item_sku = await FindItemBySKU(info.sku);
            } else if (info.name !== "") {
                item_sku = await FindItemByName(info.name);
            } else {
                item_sku = await FindItemByDesc(info.desc);
            }
            
            if (!item_sku) {
                response.statusCode = 400;
                response.error = "could not find item.";
            } else {
                let inventories = await CheckInventoriesForItem(item_sku);
                if (!inventories) {
                    response.statusCode = 400;
                    response.error = "item not found in any inventories.";
                } else {
                    let stores = [];
                    let store_id;
                    let nextStore;
                    let itemName = await GetItemNameFromSKU(item_sku);
                    let itemDesc = await GetItemDescFromSKU(item_sku);
                    for (const inv of inventories) {
                        store_id = inv.inv_store_id;
                        nextStore = await FindStoreOfInventory(store_id);
                        let storeWithQty = {
                            "s_store_id" : nextStore.s_store_id,
                            "s_latitude" : nextStore.s_latitude,
                            "s_longitude" : nextStore.s_longitude,
                            "s_name" : nextStore.s_name,
                            "qty" : inv.inv_qty
                        }
                        nextStore["qty"] = inv.inv_qty;
                        stores.push(nextStore);
                    }
                    let storesWithDistances = await CalculateStoreDistances(stores, info.latitude, info.longitude);
                    let storesOrderedByDistances = await OrderStoresByDistance(storesWithDistances);
                    body["result"] = {
                        "itemSKU" : item_sku,
                        "itemName" : itemName,
                        "itemDesc" : itemDesc,
                        "stores" : storesOrderedByDistances
                    }
                    response.statusCode = 200;
                }
            }
        }
    } catch (err) {
        response.statusCode = 400;
        body["error"] = err.toString();
    }
    
    response.body = JSON.stringify(body);
    return response
};

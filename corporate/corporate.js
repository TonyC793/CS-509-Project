var base_url = "https://15qu2mzzpa.execute-api.us-east-1.amazonaws.com/Prod/";

var createStore_url = base_url + "createStore";      // POST: {arg1:5, arg2:7}
var createItem_url = base_url + "createItem";
var assignLocation_url = base_url + "assignLocation";
var removeStore_url = base_url + "removeStore";
var listStores_url = base_url + "listStores";
var generateInventoryReport_url = base_url + "generateInventoryReport";
var generateTotalInventoryReport_url = base_url + "generateTotalInventoryReport";

window.onload = function() {
    console.log(localStorage)
}

function processListStoresResponse(result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);
    var items = JSON.parse(js.body);
    console.log(items);
    var result  = js["result"];
    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("storeList");
        container.innerHTML = "";
        var tbl = document.createElement('table');
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        var tbdy = document.createElement('tbody');
        for (var i = 0; i < items.result.length; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < 7; j++) {
                var td = document.createElement('td');
                if (j % 7 === 0) {
                    td.innerHTML = items.result[i].lat;
                } else if (j % 7 === 1) {
                    td.innerHTML = items.result[i].long;
                } else if (j % 7 === 2) {
                    td.innerHTML = items.result[i].store_name;
                } else if (j % 7 === 3) {
                    td.innerHTML = items.result[i].manager_name;
                } else if (j % 7 === 4) {
                    td.innerHTML = items.result[i].manager_pw;
                } else if (j % 7 === 5) {
                    td.innerHTML = items.result[i].store_id;
                } else {
                    var removeButton = document.createElement("input");
                    removeButton.value = "Remove";
                    removeButton.type = "button";
                    removeButton.setAttribute("onclick", "JavaScript:handleRemoveStoreClick(this, \""+items.result[i].store_id+"\");");
                    td.appendChild(removeButton);
                }
                tr.appendChild(td)
            }
            tbdy.appendChild(tr);
        }
        let thead = document.createElement('thead');
        let latH = document.createElement('td');
        let longH = document.createElement('td');
        let nameH = document.createElement('td');
        let manager_nameH = document.createElement('td');
        let manager_pwH = document.createElement('td');
        let store_id = document.createElement('td');
        latH.innerHTML = "Latitude";
        longH.innerHTML = "Longitude";
        nameH.innerHTML = "Store Name";
        manager_nameH.innerHTML = "Manager Name";
        manager_pwH.innerHTML = "Manager Password";
        store_id.innerHTML = "Store ID";
        thead.appendChild(latH);
        thead.appendChild(longH);
        thead.appendChild(nameH);
        thead.appendChild(manager_nameH);
        thead.appendChild(manager_pwH);
        thead.appendChild(store_id);
        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        container.appendChild(tbl);
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("storeList").innerHTML = "error:" + msg;
    }
}

function handleListStoresClick(e, store_id) {
    
    var data = {};
    data["c_username"] = localStorage.getItem("c_username");
    data["c_password"] = localStorage.getItem("c_password");

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", listStores_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processListStoresResponse(xhr.responseText, xhr.status);
        } else {
            processListStoresResponse("N/A", xhr.status);
        }
    };
}

function processRemoveStoreResponse(result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);
    var items = JSON.parse(js.body);
    console.log(items);
    var result  = js["result"];
    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("storeList");
        container.innerHTML = "";
        var tbl = document.createElement('table');
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        var tbdy = document.createElement('tbody');
        for (var i = 0; i < items.result.length; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < 7; j++) {
                var td = document.createElement('td');
                if (j % 7 === 0) {
                    td.innerHTML = items.result[i].lat;
                } else if (j % 7 === 1) {
                    td.innerHTML = items.result[i].long;
                } else if (j % 7 === 2) {
                    td.innerHTML = items.result[i].store_name;
                } else if (j % 7 === 3) {
                    td.innerHTML = items.result[i].manager_name;
                } else if (j % 7 === 4) {
                    td.innerHTML = items.result[i].manager_pw;
                } else if (j % 7 === 5) {
                    td.innerHTML = items.result[i].store_id;
                } else {
                    var removeButton = document.createElement("input");
                    removeButton.value = "Remove";
                    removeButton.type = "button";
                    removeButton.setAttribute("onclick", "JavaScript:handleRemoveStoreClick(this, \""+items.result[i].store_id+"\");");
                    td.appendChild(removeButton);
                }
                tr.appendChild(td)
            }
            tbdy.appendChild(tr);
        }
        let thead = document.createElement('thead');
        let latH = document.createElement('td');
        let longH = document.createElement('td');
        let nameH = document.createElement('td');
        let manager_nameH = document.createElement('td');
        let manager_pwH = document.createElement('td');
        let store_id = document.createElement('td');
        latH.innerHTML = "Latitude";
        longH.innerHTML = "Longitude";
        nameH.innerHTML = "Store Name";
        manager_nameH.innerHTML = "Manager Name";
        manager_pwH.innerHTML = "Manager Password";
        store_id.innerHTML = "Store ID";
        thead.appendChild(latH);
        thead.appendChild(longH);
        thead.appendChild(nameH);
        thead.appendChild(manager_nameH);
        thead.appendChild(manager_pwH);
        thead.appendChild(store_id);
        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        container.appendChild(tbl);
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("storeList").innerHTML = "error:" + msg;
    }
}

function handleRemoveStoreClick(e, store_id) {
    
    var data = {};
    data["c_username"] = localStorage.getItem("c_username");
    data["c_password"] = localStorage.getItem("c_password");
    data["store_id"] = store_id;

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", removeStore_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processRemoveStoreResponse(xhr.responseText, xhr.status);
        } else {
            processRemoveStoreResponse("N/A", xhr.status);
        }
    };
}
    
function processCreateStoreResponse(arg1, arg2, store_name, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);
    var items = JSON.parse(js.body);
    console.log(items);
    var result  = js["result"];
    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("storeList");
        container.innerHTML = "";
        var tbl = document.createElement('table');
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        var tbdy = document.createElement('tbody');
        for (var i = 0; i < items.result.length; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < 7; j++) {
                var td = document.createElement('td');
                if (j % 7 === 0) {
                    td.innerHTML = items.result[i].lat;
                } else if (j % 7 === 1) {
                    td.innerHTML = items.result[i].long;
                } else if (j % 7 === 2) {
                    td.innerHTML = items.result[i].store_name;
                } else if (j % 7 === 3) {
                    td.innerHTML = items.result[i].manager_name;
                } else if (j % 7 === 4) {
                    td.innerHTML = items.result[i].manager_pw;
                } else if (j % 7 === 5) {
                    td.innerHTML = items.result[i].store_id;
                } else {
                    var removeButton = document.createElement("input");
                    removeButton.value = "Remove";
                    removeButton.type = "button";
                    removeButton.setAttribute("onclick", "JavaScript:handleRemoveStoreClick(this, \""+items.result[i].store_id+"\");");
                    td.appendChild(removeButton);
                }
                tr.appendChild(td)
            }
            tbdy.appendChild(tr);
        }
        let thead = document.createElement('thead');
        let latH = document.createElement('td');
        let longH = document.createElement('td');
        let nameH = document.createElement('td');
        let manager_nameH = document.createElement('td');
        let manager_pwH = document.createElement('td');
        let store_id = document.createElement('td');
        latH.innerHTML = "Latitude";
        longH.innerHTML = "Longitude";
        nameH.innerHTML = "Store Name";
        manager_nameH.innerHTML = "Manager Name";
        manager_pwH.innerHTML = "Manager Password";
        store_id.innerHTML = "Store ID";
        thead.appendChild(latH);
        thead.appendChild(longH);
        thead.appendChild(nameH);
        thead.appendChild(manager_nameH);
        thead.appendChild(manager_pwH);
        thead.appendChild(store_id);
        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        container.appendChild(tbl);
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("storeList").innerHTML = "error:" + msg;
    }
}

function handleCreateStoreClick(e) {
    var form = document.createStoreForm;
    var latitude = form.lat.value;
    var longitude = form.long.value;
    var store_name = form.s_name.value;
    var manager_name = form.s_manager_name.value;
    var manager_pw = form.s_manager_pw.value;

    var data = {};
    data["c_username"] = localStorage.getItem("c_username");
    data["c_password"] = localStorage.getItem("c_password");
    data["latitude"] = latitude;
    data["longitude"] = longitude;
    data["store_name"] = store_name;
    data["manager_name"] = manager_name;
    data["manager_pw"] = manager_pw;

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", createStore_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processCreateStoreResponse(latitude, longitude, store_name, xhr.responseText, xhr.status);
        } else {
            processCreateStoreResponse(latitude, longitude, store_name, "N/A", xhr.status);
        }
    };
}

function processCreateItemResponse(sku, item_name, desc, price, max_q, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);
    var items = JSON.parse(js.body);
    console.log(items);
    var result  = js["result"];
    // Update computation result
    if (js.statusCode == 200) {
        document.getElementById("itemList").innerHTML = "";
        var title = document.createElement("h3");
        title.innerHTML = "Existing Items:";
        items.result.forEach(function(item) {
            var li = document.createElement("li");
            var text = document.createTextNode(item.sku + " " + item.name + " " + item.description + " " + item.price + " " + item.max_q);
            li.appendChild(text);
            document.getElementById("itemList").appendChild(li);
        });
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("itemList").innerHTML = "error:" + msg;
    }
}

function handleCreateItemClick(e) {
    var form = document.createItemForm;
    var sku = form.sku.value;
    var item_name = form.itemName.value;
    var description = form.description.value;
    var price = form.price.value;
    var max_q = form.maxQ.value;

    var data = {};
    data["c_username"] = localStorage.getItem("c_username");
    data["c_password"] = localStorage.getItem("c_password");
    data["sku"] = sku;
    data["item_name"] = item_name;
    data["desc"] = description;
    data["price"] = price;
    data["max_q"] = max_q;
    nest = {};
    
    var js = JSON.stringify(data);
    nest["body"] = js

    console.log(data)
    console.log(nest)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", createItem_url, true);
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processCreateItemResponse(sku, item_name, description, price, max_q, xhr.responseText, xhr.status);
        } else {
            processCreateItemResponse(sku, item_name, description, price, max_q, "N/A", xhr.status);
        }
    };
}

function processAssignLocationResponse(sku, aisle, shelf, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    var js = JSON.parse(result);

    var result  = js["result"];

    // Update computation result
    if (js.statusCode == 200) {
        console.log(JSON.parse(js.body));
        document.getElementById("assign-location-response").innerText = JSON.parse(js.body).result;
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("assign-location-response").innerHTML = "error:" + msg;
    }
}

function handleAssignLocationClick(e) {
    var form = document.assignLocationForm;
    var sku = form.sku.value;
    var aisle = form.aisle.value;
    var shelf = form.shelf.value;

    var data = {};
    data["c_username"] = localStorage.getItem("c_username");
    data["c_password"] = localStorage.getItem("c_password");
    data["sku"] = sku;
    data["aisle"] = aisle;
    data["shelf"] = shelf;
    nest = {};
    
    var js = JSON.stringify(data);
    nest["body"] = js

    console.log(data)
    console.log(nest)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", assignLocation_url, true);
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processAssignLocationResponse(sku, aisle, shelf, xhr.responseText, xhr.status);
        } else {
            processAssignLocationResponse(sku, aisle, shelf, "N/A", xhr.status);
        }
    };
}

function processGenerateInventoryReportResponse(store_id, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);

    var result  = js["result"];
    var data = JSON.parse(js.body);
    console.log(data);

    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("generateReportResponse");
        var tbl = document.createElement('table');
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        var tbdy = document.createElement('tbody');
        for (var i = 0; i < data.result.report.length; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < 3; j++) {
                var td = document.createElement('td');
                if (j % 3 === 0) {
                    td.innerHTML = data.result.report[i].inv_sku;
                } else if (j % 3 === 1) {
                    td.innerHTML = data.result.report[i].inv_qty;
                } else {
                    td.innerHTML = data.result.report[i].price;
                }
                tr.appendChild(td)
            }
            tbdy.appendChild(tr);
        }
        let thead = document.createElement('thead');
        let skuH = document.createElement('td');
        let qtyH = document.createElement('td');
        let priceH = document.createElement('td');
        skuH.innerHTML = "SKU";
        qtyH.innerHTML = "Quantity";
        priceH.innerHTML = "Price";
        thead.appendChild(skuH);
        thead.appendChild(qtyH);
        thead.appendChild(priceH);
        let tfoot = document.createElement('tfoot');
        let spacer = document.createElement('td');
        let sumLabel = document.createElement('td');
        let total = document.createElement('td');
        sumLabel.innerHTML = "Total";
        total.innerHTML = data.result.total;
        tfoot.appendChild(spacer);
        tfoot.appendChild(sumLabel);
        tfoot.appendChild(total);
        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        tbl.appendChild(tfoot);
        container.appendChild(tbl);
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("generateReportResponse").innerHTML = "error:" + msg;
    }
}

function handleGenerateInventoryReportClick(e) {
    var form = document.generateInventoryReportForm;
    var store_id = form.store.value;

    var data = {};
    data["store_id"] = store_id;
    data["c_username"] = localStorage.getItem("c_username");
    data["c_password"] = localStorage.getItem("c_password");

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", generateInventoryReport_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processGenerateInventoryReportResponse(store_id, xhr.responseText, xhr.status);
        } else {
            processGenerateInventoryReportResponse(store_id, "N/A", xhr.status);
        }
    };
}

function processGenerateTotalInventoryReportResponse(store_id, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);

    var result  = js["result"];
    var data = JSON.parse(js.body);
    console.log(data);

    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("generateTotalReportResponse");
        var list = document.createElement('table');
        for (var s = 0; s < data.result.storeInfos.length; s++) {
            var tbl = document.createElement('table');
            tbl.style.width = '100%';
            tbl.setAttribute('border', '1');
            var tbdy = document.createElement('tbody');
            for (var i = 0; i < data.result.reports[s].length; i++) {
                var tr = document.createElement('tr');
                for (var j = 0; j < 3; j++) {
                    var td = document.createElement('td');
                    if (j % 3 === 0) {
                        td.innerHTML = data.result.reports[s][i].inv_sku;
                    } else if (j % 3 === 1) {
                        td.innerHTML = data.result.reports[s][i].inv_qty;
                    } else {
                        td.innerHTML = data.result.reports[s][i].price;
                    }
                    tr.appendChild(td)
                }
                tbdy.appendChild(tr);
            }
            let th = document.createElement('thead');
            let storeNameH = document.createElement('td');
            let storeIDH = document.createElement('td');
            storeNameH.innerHTML = data.result.storeInfos[s].storeName;
            storeIDH.innerHTML = data.result.storeInfos[s].storeID;
            th.appendChild(storeNameH);
            th.appendChild(storeIDH);
            let thead = document.createElement('thead');
            let skuH = document.createElement('td');
            let qtyH = document.createElement('td');
            let priceH = document.createElement('td');
            skuH.innerHTML = "SKU";
            qtyH.innerHTML = "Quantity";
            priceH.innerHTML = "Price";
            thead.appendChild(skuH);
            thead.appendChild(qtyH);
            thead.appendChild(priceH);
            let tfoot = document.createElement('tfoot');
            let spacer = document.createElement('td');
            let sumLabel = document.createElement('td');
            let total = document.createElement('td');
            sumLabel.innerHTML = "Total";
            total.innerHTML = data.result.totals[s];
            tfoot.appendChild(spacer);
            tfoot.appendChild(sumLabel);
            tfoot.appendChild(total);
            tbl.appendChild(th);
            tbl.appendChild(thead);
            tbl.appendChild(tbdy);
            tbl.appendChild(tfoot);
            list.appendChild(tbl);
        }
        
        let totalTable = document.createElement('tbl');
        let tfoot = document.createElement('tfoot');
        let spacer = document.createElement('td');
        let sumLabel = document.createElement('td');
        let total = document.createElement('td');
        sumLabel.innerHTML = "Final Total: " + data.result.finalTotal;  
        total.innerHTML = data.result.finalTotal;
        tfoot.appendChild(sumLabel);
        list.appendChild(tfoot);
        container.appendChild(list);
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("generateTotalReportResponse").innerHTML = "error:" + msg;
    }
}

function handleGenerateTotalInventoryReportClick(e) {
    var form = document.generateInventoryReportForm;
    var store_id = form.store.value;

    var data = {};
    data["c_username"] = localStorage.getItem("c_username");
    data["c_password"] = localStorage.getItem("c_password");

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", generateTotalInventoryReport_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processGenerateTotalInventoryReportResponse(store_id, xhr.responseText, xhr.status);
        } else {
            processGenerateTotalInventoryReportResponse(store_id, "N/A", xhr.status);
        }
    };
}
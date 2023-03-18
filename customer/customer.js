var base_url = "https://ld2qzjy1j8.execute-api.us-east-1.amazonaws.com/Prod/";

var listStores_url = base_url + "listStores";
var findItem_url = base_url + "findItem";
var listItems_url = base_url + "listItems";
var buyItem_url = base_url + "buyItem";

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
            for (var j = 0; j < 5; j++) {
                var td = document.createElement('td');
                if (j % 5 === 0) {
                    td.innerHTML = items.result[i].store_id;
                } else if (j % 5 === 1) {
                    td.innerHTML = items.result[i].store_name;
                } else if (j % 5 === 2) {
                    td.innerHTML = items.result[i].lat;
                } else if (j % 5 === 3) {
                    td.innerHTML = items.result[i].long;
                } else {
                    td.innerHTML = items.result[i].distanceFromCustomer;
                }
                tr.appendChild(td)
            }
            tbdy.appendChild(tr);
        }
        let thead = document.createElement('thead');
        let latH = document.createElement('td');
        let longH = document.createElement('td');
        let nameH = document.createElement('td');
        let distanceH = document.createElement('td');
        let store_id = document.createElement('td');
        store_id.innerHTML = "Store ID";
        nameH.innerHTML = "Store Name";
        latH.innerHTML = "Latitude";
        longH.innerHTML = "Longitude";
        distanceH.innerHTML = "Distance From You (km)";
        thead.appendChild(store_id);
        thead.appendChild(nameH);
        thead.appendChild(latH);
        thead.appendChild(longH);
        thead.appendChild(distanceH);
        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        container.appendChild(tbl);
    } else {
        var msg = js["error"];   // only exists if error...
        window.alert("error:" + msg);
    }
}

function handleListStoresClick(e) {
    var form = document.listStoresForm;
    var latitude = form.lat.value;
    var longitude = form.long.value;

    var data = {};
    data["latitude"] = latitude;
    data["longitude"] = longitude;

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

function processFindItemResponse(result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);
    var items = JSON.parse(js.body);
    console.log(items);
    var result  = js["result"];
    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("availabilityList");
        container.innerHTML = "Were you looking for:"
        var itemTbl = document.createElement('table');
        itemTbl.style.width = '100%';
        itemTbl.setAttribute('border', '1');
        var th = document.createElement('thead');
        var itemH = document.createElement('td');
        var descH = document.createElement('td');
        var skuH = document.createElement('td');
        itemH.innerHTML = "Name";
        descH.innerHTML = "Description";
        skuH.innerHTML = "SKU";
        th.appendChild(itemH);
        th.appendChild(descH);
        th.appendChild(skuH);
        var itemRow = document.createElement('tr');
        var itemC = document.createElement('td');
        var descC = document.createElement('td');
        var skuC = document.createElement('td');
        itemC.innerHTML = items.result.itemName;
        descC.innerHTML = items.result.itemDesc;
        skuC.innerHTML = items.result.itemSKU;
        itemRow.appendChild(itemC);
        itemRow.appendChild(descC);
        itemRow.appendChild(skuC);
        itemTbl.appendChild(th);
        itemTbl.appendChild(itemRow);
        container.appendChild(itemTbl);
        var tbl = document.createElement('table');
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        var tbdy = document.createElement('tbody');
        console.log(items.result);
        for (var i = 0; i < items.result.stores.length; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < 7; j++) {
                var td = document.createElement('td');
                if (j % 7 === 0) {
                    td.innerHTML = items.result.stores[i].qty;
                } else if (j % 7 === 1) {
                    td.innerHTML = items.result.stores[i].store_id;
                } else if (j % 7 === 2) {
                    td.innerHTML = items.result.stores[i].store_name;
                } else if (j % 7 === 3) {
                    td.innerHTML = items.result.stores[i].lat;
                } else if (j % 7 === 4) {
                    td.innerHTML = items.result.stores[i].long;
                } else if (j % 7 === 5) {
                    td.innerHTML = items.result.stores[i].distanceFromCustomer;
                } else {
                    var buyForm = document.createElement('form');
                    //buyForm.id = items.result.stores[i].store_id;
                    var quantityInput = document.createElement("input");
                    quantityInput.id = items.result.stores[i].store_id;
                    quantityInput.setAttribute("type", "number");
                    quantityInput.value = 0;
                    var buyButton = document.createElement("input");
                    buyButton.value = "Buy";
                    buyButton.type = "button";
                    buyButton.setAttribute("onclick", "JavaScript:handleBuyItemClick(this, \""+items.result.stores[i].store_id+"\", \""+items.result.itemSKU+"\");");
                    buyForm.appendChild(quantityInput);
                    buyForm.appendChild(buyButton);
                    td.appendChild(buyForm);
                }
                tr.appendChild(td)
            }
            tbdy.appendChild(tr);
        }
        let thead = document.createElement('thead');
        let latH = document.createElement('td');
        let longH = document.createElement('td');
        let nameH = document.createElement('td');
        let distanceH = document.createElement('td');
        let store_id = document.createElement('td');
        let qtyH = document.createElement('td');
        let buyH = document.createElement('td');
        qtyH.innerHTML = "Quantity";
        store_id.innerHTML = "Store ID";
        nameH.innerHTML = "Store Name";
        latH.innerHTML = "Latitude";
        longH.innerHTML = "Longitude";
        distanceH.innerHTML = "Distance From You (km)";
        buyH.innerHTML = "Buy Item";
        thead.appendChild(qtyH);
        thead.appendChild(store_id);
        thead.appendChild(nameH);
        thead.appendChild(latH);
        thead.appendChild(longH);
        thead.appendChild(distanceH);
        thead.appendChild(buyH);
        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        container.appendChild(tbl);
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("availabilityList").innerHTML = "error:" + msg;
    }
}

function handleFindItemClick(e) {
    var form = document.findItemForm;
    var sku = form.sku.value;
    var itemName = form.itemName.value;
    var desc = form.desc.value;
    var latitude = form.lat.value;
    var longitude = form.long.value;

    var data = {};
    data["sku"] = sku;
    data["name"] = itemName;
    data["desc"] = desc;
    data["latitude"] = latitude;
    data["longitude"] = longitude;

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", findItem_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processFindItemResponse(xhr.responseText, xhr.status);
        } else {
            processFindItemResponse("N/A", xhr.status);
        }
    };
}

function processBuyItemResponse(store_id, sku, purchaseQty, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);
    var items = JSON.parse(js.body);
    console.log(items);
    var result  = js["result"];
    // Update computation result
    if (js.statusCode == 200) {
        window.alert("Successfully purchased " + purchaseQty + " of " + sku + " from " + store_id);
    } else {
        var msg = js["error"];   // only exists if error...
        window.alert("error:" + msg);
    }
}

function handleBuyItemClick(e, store_id, sku) {
    var purchaseQty = document.getElementById(store_id).value;

    var data = {};
    data["sku"] = sku;
    data["store_id"] = store_id;
    data["quantity"] = purchaseQty;

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", buyItem_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processBuyItemResponse(store_id, sku, purchaseQty, xhr.responseText, xhr.status);
        } else {
            processBuyItemResponse(store_id, sku, purchaseQty, "N/A", xhr.status);
        }
    };
}

function processListItemsResponse(result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);
    var items = JSON.parse(js.body);
    console.log(items);
    var result  = js["result"];
    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("itemList");
        container.innerHTML = "";
        var tbl = document.createElement('table');
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        var tbdy = document.createElement('tbody');
        console.log(items.result);
        for (var i = 0; i < items.result.length; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < 3; j++) {
                var td = document.createElement('td');
                if (j % 3 === 0) {
                    td.innerHTML = items.result[i].name;
                } else if (j % 3 === 1) {
                    td.innerHTML = items.result[i].desc;
                } else {
                    td.innerHTML = items.result[i].qty;
                }
                tr.appendChild(td)
            }
            tbdy.appendChild(tr);
        }
        let thead = document.createElement('thead');
        let nameH = document.createElement('td');
        let descH = document.createElement('td');
        let qtyH = document.createElement('td');
        qtyH.innerHTML = "Quantity";
        nameH.innerHTML = "Item Name";
        descH.innerHTML = "Item Description";
        thead.appendChild(nameH);
        thead.appendChild(descH);
        thead.appendChild(qtyH);
        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        container.appendChild(tbl);
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("itemList").innerHTML = "error:" + msg;
    }
}

function handleListItemsClick(e) {
    var form = document.listShelfForm;
    var store_id = form.store_id.value;
    var aisle = form.aisle.value;
    var shelf = form.shelf.value;

    var data = {};
    data["store_id"] = store_id;
    data["aisle"] = aisle;
    data["shelf"] = shelf;

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", listItems_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processListItemsResponse(xhr.responseText, xhr.status);
        } else {
            processListItemsResponse("N/A", xhr.status);
        }
    };
}

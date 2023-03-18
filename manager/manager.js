var base_url = "https://xegnypka07.execute-api.us-east-1.amazonaws.com/Prod/";

var processShipment_url = base_url + "processShipment";      // POST: {arg1:5, arg2:7}
var generateInventoryReport_url = base_url + "managerGenerateInventoryReport";      // POST: {arg1:5, arg2:7}
var generateOverstockReport_url = base_url + "generateOverstockReport"; 
var fillShelves_url = base_url + "fillShelves"; 
var showMissingItems_url = base_url + "showMissingItems"; 
 
function processProcessShipmentResponse(store_id, sku, qty, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);
    
    var result  = js["result"];
    var data = JSON.parse(js.body);
    console.log(js.statusCode);
    // Update computation result
    if (js.statusCode == 200) {
        document.getElementById("processResponse").innerHTML = "";
        for (const r of data.result) {
            document.getElementById("processResponse").innerHTML += r.addedToShelf + " added to inventory; " + r.addedToOverstock + " added to overstock<br><br>";
        }
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("processResponse").innerHTML = "error:" + msg;
    }
}

function handleProcessShipmentClick(e) {
    var form = document.processShipmentForm;
    var sku = [];
    var qty = [];
    var store_id = localStorage.getItem("store_id");
    var shipment = document.getElementById("container").children;
    console.log(shipment);
    let nextSku;
    let nextQty;
    for (var i = 0; i < shipment.length - 1; i++) {
        if (i % 3 == 0) {
            nextSku = shipment[i].value;
            sku.push(nextSku);
        }
        if (i % 3 == 1) {
            nextQty = shipment[i].value;
            qty.push(nextQty);
        }
    }
    var data = {};
    data["m_username"] = localStorage.getItem("m_username");
    data["m_password"] = localStorage.getItem("m_password");
    data["store_id"] = store_id;
    data["sku"] = sku;
    data["quantity"] = qty;

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", processShipment_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processProcessShipmentResponse(store_id, sku, qty, xhr.responseText, xhr.status);
        } else {
            processProcessShipmentResponse(store_id, sku, qty, "N/A", xhr.status);
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
        container.innerHTML = "";
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
    var store_id = localStorage.getItem("store_id");

    var data = {};
    data["store_id"] = store_id;
    data["m_username"] = localStorage.getItem("m_username");
    data["m_password"] = localStorage.getItem("m_password");

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

function processGenerateOverstockReportResponse(store_id, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);

    var result  = js["result"];
    var data = JSON.parse(js.body);
    console.log(data);

    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("generateOverstockReportResponse");
        container.innerHTML = "";
        var tbl = document.createElement('table');
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        var tbdy = document.createElement('tbody');
        for (var i = 0; i < data.result.report.length; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < 3; j++) {
                var td = document.createElement('td');
                if (j % 3 === 0) {
                    td.innerHTML = data.result.report[i].o_sku;
                } else if (j % 3 === 1) {
                    td.innerHTML = data.result.report[i].o_qty;
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
        document.getElementById("generateOverstockReportResponse").innerHTML = "error:" + msg;
    }
}

function handleGenerateOverstockReportClick(e) {
    var store_id = localStorage.getItem("store_id");

    var data = {};
    data["store_id"] = store_id;
    data["m_username"] = localStorage.getItem("m_username");
    data["m_password"] = localStorage.getItem("m_password");

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", generateOverstockReport_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processGenerateOverstockReportResponse(store_id, xhr.responseText, xhr.status);
        } else {
            processGenerateOverstockReportResponse(store_id, "N/A", xhr.status);
        }
    };
}

function processFillShelvesResponse(store_id, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);

    var result  = js["result"];
    var data = JSON.parse(js.body);
    console.log(data);

    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("fillShelvesResponse");
        container.innerHTML = "";
        var newList = document.createElement("ul");
        for (var i = 0; i < data.result.length; i++) {
            var update = document.createElement("li");
            update.innerHTML = data.result[i];
            newList.append(update);
        }
        container.appendChild(newList);
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("fillShelvesResponse").innerHTML = "error:" + msg;
    }
}

function handleFillShelvesClick(e) {
    var store_id = localStorage.getItem("store_id");

    var data = {};
    data["store_id"] = store_id;
    data["m_username"] = localStorage.getItem("m_username");
    data["m_password"] = localStorage.getItem("m_password");

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", fillShelves_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processFillShelvesResponse(store_id, xhr.responseText, xhr.status);
        } else {
            processFillShelvesResponse(store_id, "N/A", xhr.status);
        }
    };
}

function processShowMissingItemsResponse(store_id, result, status) {
    // Can grab any DIV or SPAN HTML element and can then manipulate its
    // contents dynamically via javascript
    console.log(result);
    var js = JSON.parse(result);

    var result  = js["result"];
    var data = JSON.parse(js.body);
    console.log(data);

    // Update computation result
    if (js.statusCode == 200) {
        let container = document.getElementById("showMissingItemsResponse");
        container.innerHTML = "";
        var newList = document.createElement("ul");
        for (var i = 0; i < data.result.length; i++) {
            var update = document.createElement("li");
            update.innerHTML = data.result[i];
            newList.append(update);
        }
        container.appendChild(newList);
        if (data.result.length === 0) {
            container.innerHTML = "There are no missing items in the inventory";
        }
    } else {
        var msg = js["error"];   // only exists if error...
        document.getElementById("showMissingItemsResponse").innerHTML = "error:" + msg;
    }
}

function handleShowMissingItemsClick(e) {
    var store_id = localStorage.getItem("store_id");

    var data = {};
    data["store_id"] = store_id;
    data["m_username"] = localStorage.getItem("m_username");
    data["m_password"] = localStorage.getItem("m_password");

    var js = JSON.stringify(data);
    nest = {};
    nest["body"] = js
    console.log(data)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", showMissingItems_url, true);

    // send the collected data as JSON
    let newjs = JSON.stringify(nest);
    console.log(newjs);
    // send the collected data as JSON
    xhr.send(newjs);

    // This will process results and update HTML as appropriate. 
    xhr.onloadend = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            processShowMissingItemsResponse(store_id, xhr.responseText, xhr.status);
        } else {
            processShowMissingItemsResponse(store_id, "N/A", xhr.status);
        }
    };
}

function addFields(){
    // Generate a dynamic number of inputs
    var number = document.getElementById("numItems").value;
    // Get the element where the inputs will be added to
    var container = document.getElementById("container");
    // Remove every children it had before
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    for (i=0;i<number;i++){
        // Append a node with a random text
        container.appendChild(document.createTextNode("SKU: "));
        // Create an <input> element, set its type and name attributes
        var input = document.createElement("input");
        input.type = "text";
        input.name = "sku" + i;
        input.value = "";
        input.setAttribute("value", "");
        container.appendChild(input);
        container.appendChild(document.createTextNode("QTY: "));
        // Create an <input> element, set its type and name attributes
        var input = document.createElement("input");
        input.type = "text";
        input.name = "qty" + i;
        input.setAttribute("value", "");
        container.appendChild(input);
        // Append a line break 
        container.appendChild(document.createElement("br"));
    }
    document.getElementById("processButton").style = "visibility='inline-block;'";
}

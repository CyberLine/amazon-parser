function getClassElement(node, name) {
    if (node == null)
        return null;

    if (node.className === name) return node;
    for (var i = 0; i < node.childNodes.length; i++) {
        var element = getClassElement(node.childNodes[i], name);
        if (element) return element;
    }
    return null;
}

function getClassElements(node, name) {
    if (node == null)
        return null;

    if (node.className === name) return [node];
    var elements = [];
    for (var i = 0; i < node.childNodes.length; i++) {
        elements = elements.concat(getClassElements(node.childNodes[i], name));
    }
    return elements;
}

function findOrders(doc, year, page) {
    var orderLevels = doc.getElementsByClassName("order-info");
    var orderBars = doc.getElementsByClassName("a-box-group a-spacing-base");

    orders[year].pages[page].done = true;

    if (orderLevels.length !== orderBars.length) {
        console.log("Syntax Error " + year + "/" + page);
        return;
    }

    for (var i = 0; i < orderLevels.length; i++) {
        var order = {"price": "0,00", "date": "?", "link": "", "names": [], "prices": [], "products": 0, "recip": ""};

        var virtualOrder = getClassElement(orderLevels[i], "a-column a-span3");
        if (virtualOrder) {
            var price_tag = virtualOrder.getElementsByClassName('a-color-secondary value');
            if (price_tag.length > 0 && price_tag[0].innerHTML.trim().includes('Audible') === false) {
                order.price = price_tag[0].innerHTML.replace(/EUR/, "").replace(/Summe/, "").replace(/.*coins/i, "0,00").trim();
            } else {
                order.price = "0,00";
            }
        }

        var priceElement = getClassElement(orderLevels[i], "a-column a-span2");
        if (!virtualOrder && priceElement) {
            var price_tag = priceElement.getElementsByClassName('a-color-secondary value');
            if (price_tag.length > 0) {
                order.price = price_tag[0].innerHTML.replace(/EUR/, "").replace(/Summe/, "").replace(/.*coins/i, "0,00").trim();
            } else {
                order.price = "0,00";
            }
        } else {
            var price_tag = priceElement.getElementsByClassName('a-color-secondary value');
            if (price_tag.length > 0) {
                order.price = price_tag[0].innerHTML.replace(/EUR/, '').replace(/Summe/, '').replace(/.*coins/i, '0,00').trim();
            } else {
                order.price = '0,00';
            }
        }

        var recipElement = getClassElement(orderLevels[i], "a-column a-span6 recipient a-span-last");
        if (recipElement) {
            var recip_tag = recipElement.getElementsByClassName('trigger-text');
            if (recip_tag.length > 0) {
                order.recip = recipElement.getElementsByClassName('trigger-text')[0].innerHTML.trim();
            } else {
                order.recip = "?";
            }
        } else {
            console.log("No recipient found " + year + "/" + page);
        }

        var dateElement = getClassElement(orderLevels[i], "a-color-secondary value");
        if (dateElement) {
            order.date = dateElement.innerHTML.trim();
        } else {
            console.log("No date found " + year + "/" + page);
        }

        var linkElement = orderLevels[i].getElementsByTagName('a')[1];
        if (linkElement) {
            order.link = linkElement.href;
        } else {
            console.log("No link found " + year + "/" + page);
        }

        var nameElements = getClassElements(orderBars[i], "a-fixed-left-grid-col a-col-right");
        if (nameElements.length > 0) {
            var names = [];
            var prices = [];

            for (var j = 0; j < nameElements.length; j++) {
                var a_tags = nameElements[j].getElementsByTagName('A');
                if (a_tags.length > 0) {
                    names.push(a_tags[0].innerHTML.trim());
                } else {
                    names.push(nameElements[j].getElementsByTagName('DIV')[0].innerHTML.trim());
                }

                var a_price = getClassElement(nameElements[j], 'a-size-small a-color-price');
                if (a_price) {
                    prices.push(a_price.textContent.trim());
                }
            }
            order.names = names;
            order.prices = prices;
            order.products = names.length;
        } else {
            console.log("No names found " + year + "/" + page);
        }

        orders[year].pages[page].entries.push(order);
    }
}

function findShipments(doc, year, page) {
    var orderElements = doc.getElementsByClassName('a-box-group a-spacing-base');
    for (var i = 0; i < orderElements.length; i++) {

        var orderNumber = "";
        var orderPrice = "";
        var orderDate = "";

        var orderInfo = orderElements[i].getElementsByClassName('order-info');
        if (orderInfo.length === 1) {

            var colRight = orderInfo[0].getElementsByClassName('a-col-right');
            if (colRight.length === 1) {
                var orderNrElements = colRight[0].getElementsByClassName('a-color-secondary value');
                if (orderNrElements.length > 0) {
                    orderNumber = orderNrElements[0].textContent.trim();
                } else {
                    console.log('No order number found ' + year + '/' + page);
                }
            } else {
                console.log('No order number found ' + year + '/' + page);
            }

            var virtualOrder = getClassElement(orderElements[i], "a-column a-span3");
            if (virtualOrder) {
                var price_tag = virtualOrder.getElementsByClassName('a-color-secondary value');
                if (price_tag.length > 0) {
                    orderPrice = price_tag[0].innerHTML.replace(/EUR/, '').replace(/Summe/, '').replace(/.*coins/i, '0,00').trim();
                } else {
                    orderPrice = '0,00';
                }
            }

            var priceElement = getClassElement(orderElements[i], 'a-column a-span2');
            if (!virtualOrder && priceElement) {
                var price_tag = priceElement.getElementsByClassName('a-color-secondary value');
                if (price_tag.length > 0) {
                    orderPrice = price_tag[0].innerHTML.replace(/EUR/, '').replace(/Summe/, '').replace(/.*coins/i, '0,00').trim();
                } else {
                    orderPrice = '0,00';
                }
            } else {
                var price_tag = priceElement.getElementsByClassName('a-color-secondary value');
                if (price_tag.length > 0) {
                    orderPrice = price_tag[0].innerHTML.replace(/EUR/, '').replace(/Summe/, '').replace(/.*coins/i, '0,00').trim();
                } else {
                    orderPrice = '0,00';
                }
            }

            var dateElement = getClassElement(orderElements[i], 'a-color-secondary value');
            if (dateElement) {
                orderDate = dateElement.innerHTML.trim();
            } else {
                console.log('No date found ' + year + '/' + page);
            }
        }

        var shipmentElements = orderElements[i].getElementsByClassName('a-box shipment');
        for (var s = 0; s < shipmentElements.length; s++) {
            var shipment = {
                'orderNumber': orderNumber,
                'orderPrice': orderPrice,
                'orderDate': orderDate,
                'date': '?',
                'names': [],
                'prices': [],
                'price': 0,
                'products': 0
            };

            var topRowElement = getClassElement(shipmentElements[s], 'a-row shipment-top-row')
            var dateElement = getClassElement(topRowElement, 'a-size-medium a-color-base a-text-bold');
            if (dateElement) {
                shipment.date = dateElement.innerHTML.trim();
            } else {
                console.log('No shipment date found ' + year + '/' + page);
            }

            var nameElements = getClassElements(shipmentElements[s], 'a-fixed-left-grid-col a-col-right');
            if (nameElements.length > 0) {
                var names = [];
                var prices = [];
                var totalCent = 0;
                var totalCount = 0;
                var priceNotFound = false;

                for (var j = 0; j < nameElements.length; j++) {
                    var a_tags = nameElements[j].getElementsByTagName('A');
                    if (a_tags.length > 0) {
                        names.push(nameElements[j].getElementsByTagName('A')[0].innerHTML.trim());
                    } else {
                        names.push(nameElements[j].getElementsByTagName('DIV')[0].innerHTML.trim());
                    }

                    var qty = getClassElement(nameElements[j].parentElement, 'item-view-qty');
                    if (qty) {
                        qty = parseInt(qty.textContent.trim());
                        if (isNaN(qty)) {
                            qty = 1;
                        }
                    } else {
                        qty = 1;
                    }

                    var a_price = getClassElement(nameElements[j], 'a-size-small a-color-price');
                    if (a_price) {
                        var priceStr = a_price.textContent.trim();
                        prices.push(priceStr);
                        var price = priceStr.replace(/EUR/, "").replace(/Summe/, "").replace(/.*coins/i, "0,00").trim().replace(/\./, "").split(",");
                        var centPrice = parseInt(price[0]) * 100 + parseInt(price[1]);
                        if (isNaN(centPrice))
                            priceNotFound = true;
                        else
                            totalCent += centPrice * qty;
                    }

                    totalCount += qty;
                }
                shipment.names = names;
                shipment.prices = prices;
                shipment.products = totalCount;

                if (shipmentElements.length == 1) {
                    shipment.price = orderPrice;
                } else {
                    shipment.price = getEuroString(totalCent / 100);
                    if (priceNotFound)
                        shipment.price = '*' + shipment.price;
                }
            } else {
                console.log('No item names in shipment found ' + year + '/' + page);
            }
            shipments.push(shipment);
        }
    }
}

function printState() {
    var s = "";
    for (var i = 0; i < orders.length; i++) {
        s += orders[i].year + ":";
        if (orders[i].pages.length == 0) {
            s += " waiting...";
        }
        for (var j = 0; j < orders[i].pages.length; j++) {
            s += " " + (orders[i].pages[j].done ? "X" : ".");
        }
        s += "\n";
    }

    document.body.innerHTML = "<pre>" + s + "</pre>";
}

function getEuroString(x) {
    var eurocent = (x.toFixed(2) + "").split(".");
    var euro = eurocent[0];
    var euroTsd = "";

    for (var i = 0; i < euro.length - 1; i++) {
        euroTsd += euro.charAt(i);
        if (((euro.length - i) % 3) === 1) {
            euroTsd += ".";
        }
    }
    euroTsd += euro.charAt(euro.length - 1);

    return euroTsd + "," + eurocent[1];
}

function getOverviewLine(data) {
    if (data.products) {
        var prices = "<td align=\"right\">" + getEuroString(data.cent / 100 / data.products) + "</td>" +
            "<td align=\"right\">" + getEuroString(data.cent / 100 / data.month) + "</td>";
    } else {
        var prices = "<td align=\"right\">0,00</td>" +
            "<td align=\"right\">0,00</td>";
    }

    return "<tr>" +
        "<td align=\"right\">" + data.name + "</td>" +
        "<td align=\"right\">" + getEuroString(data.cent / 100) + "</td>" +
        "<td align=\"right\">" + data.orders + "</td>" +
        "<td align=\"right\">" + data.products + "</td>" +
        prices +
        "</tr>";
}

function getOrderLine(data) {
    var nameList = "<ul style=\"margin:0; padding:0 0 0 2em\">";
    for (var i = 0; i < data.names.length; i++) {
        nameList += '<li>' + data.names[i] + ' | ' + data.prices[i] + '</li>';
    }
    nameList += "</ul>";

    return "<tr>" +
        "<td align=\"center\" valign=\"top\"><a href=\"" + data.link + "\">Link</a></td>" +
        "<td align=\"right\" valign=\"top\">" + data.date + "</td>" +
        "<td align=\"center\" valign=\"top\">" + data.products + "</td>" +
        "<td align=\"right\" valign=\"top\">" + data.price + "</td>" +
        "<td align=\"left\" valign=\"top\">" + data.recip + "</td>" +
        "<td align=\"left\" valign=\"top\">" + nameList + "</td>" +
        "</tr>";
}

function getShipmentLine(shipment) {
    var nameList = "";
    for (var i = 0; i < shipment.names.length; i++) {
        nameList += shipment.names[i] + ' | ' + shipment.prices[i] + ' # ';
    }

    return "<tr>" +
        "<td align=\"center\" valign=\"top\">" + shipment.orderNumber + "</td>" +
        "<td align=\"right\" valign=\"top\">" + shipment.orderDate + "</td>" +
        "<td align=\"center\" valign=\"top\">" + shipment.orderPrice + "</td>" +
        "<td align=\"right\" valign=\"top\">" + shipment.date + "</td>" +
        "<td align=\"left\" valign=\"top\">" + shipment.products + "</td>" +
        "<td align=\"left\" valign=\"top\">" + shipment.price + "</td>" +
        "<td align=\"left\" valign=\"top\">" + nameList + "</td>" +
        "</tr>";
}


function printOrders() {
    var now = new Date();
    var thisYear = "" + (1900 + now.getYear());
    var thisYearMonthCount = now.getMonth() + 1;

    var allOrders = [];
    var years = [];
    var overall = {"name": "Insg.", "cent": 0, "orders": 0, "products": 0, "month": 0};

    for (var i = 0; i < orders.length; i++) {
        var yearStr = orders[i].year.substr(5);
        var year = {
            "name": yearStr,
            "cent": 0,
            "orders": 0,
            "products": 0,
            "month": (yearStr === thisYear ? thisYearMonthCount : 12)
        };

        for (var j = 0; j < orders[i].pages.length; j++) {
            for (var k = 0; k < orders[i].pages[j].entries.length; k++) {
                var entry = orders[i].pages[j].entries[k];

                var price = entry.price.replace(/\./, "").split(",");
                var cent = parseInt(price[0]) * 100 + parseInt(price[1]);

                year.cent += cent;
                year.products += entry.products;
                year.orders++;

                allOrders.push(entry);
            }
        }

        overall.cent += year.cent;
        overall.products += year.products;
        overall.orders += year.orders;
        overall.month += year.month;

        years.push(year);
    }

    var text = "<h2>Uebersicht</h2>";

    text += "<table cellspacing=\"0\" cellpadding=\"4\" border=\"1\"><tr>" +
        "<th>Jahr</th>" +
        "<th>Euro</th>" +
        "<th>Bestell.</th>" +
        "<th>Produkte</th>" +
        "<th>Euro/Prod.</th>" +
        "<th>Euro/Monat</th>" +
        "</tr>";

    text += getOverviewLine(overall);
    for (var i = 0; i < years.length; i++) {
        text += getOverviewLine(years[i]);
    }
    text += "</table>";

    text += "<h2>Einzel-Bestellungen</h2>";

    text += "<table cellspacing=\"0\" cellpadding=\"4\" border=\"1\"><tr>" +
        "<th>Link</th>" +
        "<th>Datum</th>" +
        "<th>Produkte</th>" +
        "<th>Preis</th>" +
        "<th>Versandadresse</th>" +
        "<th>Produktbeschreibungen</th>" +
        "</tr>";

    for (var i = 0; i < allOrders.length; i++) {
        text += getOrderLine(allOrders[i]);
    }
    text += "</table>";

    text += "<h2>Lieferungen</h2>";

    text += "<table cellspacing=\"0\" cellpadding=\"4\" border=\"1\"><tr>" +
        "<th>Bestellnummer</th>" +
        "<th>Bestelldatum</th>" +
        "<th>Bestellsumme</th>" +
        "<th>Lieferdatum</th>" +
        "<th>Anzahl Produkte</th>" +
        "<th>Summe / Abbuchung</th>" +
        "<th>Produkte | Preis</th>" +
        "</tr>";

    for (var i = 0; i < shipments.length; i++) {
        text += getShipmentLine(shipments[i]);
    }
    text += "</table>";

    document.body.innerHTML = text;
}

function loadOrders(event) {
    if (event.currentTarget.onlyOnce) {
        return;
    }
    event.currentTarget.onlyOnce = true;

    findOrders(event.currentTarget.document, event.currentTarget.yearIndex, event.currentTarget.pageIndex);
    findShipments(event.currentTarget.document, event.currentTarget.yearIndex, event.currentTarget.pageIndex);

    event.currentTarget.close();
}

function loadYear(event) {
    if (event.currentTarget.onlyOnce) {
        return;
    }
    event.currentTarget.onlyOnce = true;

    var doc = event.currentTarget.document;
    var as = doc.getElementsByTagName("a");
    var maxIndex = 0;
    for (var i = 0; i < as.length; i++) {
        if (as[i].href.match(/startIndex=(\d+)/)) {
            maxIndex = Math.max(maxIndex, parseInt(RegExp.$1));
        }
    }

    var year = event.currentTarget.yearIndex;

    for (var i = 0; i <= maxIndex; i += 10) {
        orders[year].pages.push({"done": false, "entries": []});
    }

    findOrders(doc, year, 0);
    findShipments(doc, year, 0);

    var pageUri = "https://www.amazon.de/gp/css/order-history/gp/css/order-history/ref=oss_pagination?ie=UTF8&orderFilter=" +
        orders[year].year + "&search=&startIndex=";

    var pageIndex = 1;
    for (var i = 10; i <= maxIndex; i += 10) {
        var pageTab = window.open(pageUri + i);
        pageTab.yearIndex = year;
        pageTab.pageIndex = pageIndex;
        pageTab.addEventListener("load", loadOrders, true);

        pageIndex++;
    }

    event.currentTarget.close();
}

function loadYearCount(event) {
    if (event.currentTarget.onlyOnce) {
        return;
    }
    event.currentTarget.onlyOnce = true;

    var doc = event.currentTarget.document;
    var form = doc.getElementsByClassName('time-period-chooser a-spacing-none')[0];
    var filter = doc.getElementsByName('orderFilter')[0];

    for (var i = 0; i < filter.options.length; i++) {
        var regex = /year-(\d\d\d\d)/;
        if (regex.exec(filter.options[i].value)) {
            var year = filter.options[i].value;
            if (yearToLoad === false || yearToLoad === year) {
                orders.push({"year": filter.options[i].value, "pages": []});
            }
        }
    }

    var yearUri = "https://www.amazon.de/gp/css/order-history?";
    for (var i = 0; i < form.elements.length; i++) {
        var element = form.elements[i];
        if (element === filter) {
            continue;
        }

        yearUri += encodeURIComponent(element.name) + "=" + encodeURIComponent(element.value) + "&";
    }
    yearUri += "orderFilter=";

    for (var i = 0; i < orders.length; i++) {
        var yearTab = window.open(yearUri + orders[i].year);
        yearTab.yearIndex = i;
        yearTab.addEventListener("load", loadYear, true);
    }

    waitInterval = setInterval(waitForFinish, 1000);

    event.currentTarget.close();
}

function waitForFinish() {
    printState();

    for (var i = 0; i < orders.length; i++) {
        if (orders[i].pages.length === 0) {
            return;
        }
        for (var j = 0; j < orders[i].pages.length; j++) {
            if (!orders[i].pages[j].done) {
                return;
            }
        }
    }

    clearInterval(waitInterval);
    printOrders();
}

var orders = [];
var shipments = [];
var waitInterval;
var yearToLoad = false;

var mainTab = window.open("https://www.amazon.de/gp/css/order-history/ref=ya_orders_css");
mainTab.addEventListener("load", loadYearCount, true);

function getClassElement( node, name )
{
    if( node.className == name ) return node;
    for( var i = 0; i < node.childNodes.length; i++ )
    {
        var element = getClassElement( node.childNodes[ i ], name );
        if( element ) return element;
    }
    return null;
}

function getClassElements( node, name )
{
    if( node.className == name ) return [ node ];
    var elements = [];
    for( var i = 0; i < node.childNodes.length; i++ )
    {
        elements = elements.concat( getClassElements( node.childNodes[ i ], name ) );
    }
    return elements;
}

function getTagElement( node, name )
{
    if( node.nodeName == name ) return node;
    for( var i = 0; i < node.childNodes.length; i++ )
    {
        var child = getTagElement( node.childNodes[ i ], name );
        if( child ) return child;
    }
    return null;
}

function findOrders( doc, year, page )
{
    var orderLevels = doc.getElementsByClassName( "order-info" );
    var orderBars = doc.getElementsByClassName( "a-box-group a-spacing-base" );

    orders[ year ].pages[ page ].done = true;

    if( orderLevels.length != orderBars.length )
    {
        console.log( "Syntax Error " + year + "/" + page );
        return;
    }

    for( var i = 0; i < orderLevels.length; i++ )
    {
        var order = { "price" : "0,00", "date" : "?", "link" : "", "names" : [], "products" : 0 };

        var priceElement = getClassElement( orderLevels[ i ], "a-column a-span2" );
        if( priceElement )
        {
            // sometimes there is no price listed next to the item anymore, so we have to check that and insert 0,00 if it's missing
            var price_tag = priceElement.getElementsByClassName('a-color-secondary value');
            if (price_tag.length > 0) {
                order.price = priceElement.getElementsByClassName('a-color-secondary value')[0].innerHTML.replace(/EUR/,"").replace(/Summe/,"").trim();
            }
            else {
                order.price = "0,00";
            }
        }
        else
        {
            console.log( "No price found " + year + "/" + page );
        }

        var dateElement = getClassElement( orderLevels[ i ], "a-color-secondary value" );
        if( dateElement )
        {
            order.date = dateElement.innerHTML.trim();
        }
        else
        {
            console.log( "No date found " + year + "/" + page );
        }

        var linkElement = orderLevels[ i ].getElementsByTagName('a')[1];
        if( linkElement )
        {
            order.link = linkElement.href;
        }
        else
        {
            console.log( "No link found " + year + "/" + page );
        }

        var nameElements = getClassElements( orderBars[ i ], "a-fixed-left-grid-col a-col-right" );
        if( nameElements.length > 0 )
        {
            var names = [];
            for( var j = 0; j < nameElements.length; j++ )
            {
                // sometimes there is no link to the item, then we have to fetch the name of the item from the div tag
                var a_tags = nameElements[ j ].getElementsByTagName('A');
                if (a_tags.length > 0) {
                    names.push( nameElements[ j ].getElementsByTagName('A')[0].innerHTML.trim() );
                }
                else {
                    names.push( nameElements[ j ].getElementsByTagName('DIV')[0].innerHTML.trim() );
                }
            }
            order.names = names;
            order.products = names.length;
        }
        else
        {
            console.log( "No names found " + year + "/" + page );
        }

        orders[ year ].pages[ page ].entries.push( order );
    }
}

function printState()
{
    var s = "";
    for( var i = 0; i < orders.length; i++ )
    {
        s += orders[ i ].year + ":";
        if( orders[ i ].pages.length == 0 )
        {
            s += " waiting...";
        }
        for( var j = 0; j < orders[ i ].pages.length; j++ )
        {
            s += " " + ( orders[ i ].pages[ j ].done ? "X" : "." );
        }
        s += "\n";
    }

    document.body.innerHTML = "<pre>" + s + "</pre>";
}

function getEuroString( x )
{
    var eurocent = ( x.toFixed( 2 ) + "" ).split( "." );
    var euro = eurocent[ 0 ];
    var euroTsd = "";

    for( var i = 0; i < euro.length - 1; i++ )
    {
        euroTsd += euro.charAt( i );
        if( ( ( euro.length - i ) % 3 ) == 1 )
        {
            euroTsd += ".";
        }
    }
    euroTsd += euro.charAt( euro.length - 1 );

    return euroTsd + "," + eurocent[ 1 ];
}

function getOverviewLine( data )
{
    return "<tr>" +
        "<td align=\"right\">" + data.name + "</td>" +
        "<td align=\"right\">" + getEuroString( data.cent / 100 ) + "</td>" +
        "<td align=\"right\">" + data.orders + "</td>" +
        "<td align=\"right\">" + data.products + "</td>" +
        "<td align=\"right\">" + getEuroString( data.cent / 100 / data.products ) + "</td>" +
        "<td align=\"right\">" + getEuroString( data.cent / 100 / data.month ) + "</td>" +
        "</tr>";
}

function getOrderLine( data )
{
    var nameList = "<ul style=\"margin:0; padding:0 0 0 2em\">";
    for( var i = 0; i < data.names.length; i++ )
    {
        nameList += "<li>" + data.names[ i ] + "</li>";
    }
    nameList += "</ul>";

    return "<tr>" +
        "<td align=\"center\" valign=\"top\"><a href=\"" + data.link + "\">Link</a></td>" +
        "<td align=\"right\" valign=\"top\">" + data.date + "</td>" +
        "<td align=\"center\" valign=\"top\">" + data.products + "</td>" +
        "<td align=\"right\" valign=\"top\">" + data.price + "</td>" +
        "<td align=\"left\" valign=\"top\">" + nameList + "</td>" +
        "</tr>";
}

function printOrders()
{
    var now = new Date();
    var thisYear = "" + ( 1900 + now.getYear() );
    var thisYearMonthCount = now.getMonth() + 1;

    var allOrders = [];
    var years = [];
    var overall = { "name" : "Insg.", "cent" : 0, "orders" : 0, "products" : 0, "month" : 0 };

    for( var i = 0; i < orders.length; i++ )
    {
        var yearStr = orders[ i ].year.substr( 5 );
        var year = { "name" : yearStr, "cent" : 0, "orders" : 0, "products" : 0, "month" : ( yearStr == thisYear ? thisYearMonthCount : 12 ) };

        for( var j = 0; j < orders[ i ].pages.length; j++ )
        {
            for( var k = 0; k < orders[ i ].pages[ j ].entries.length; k++ )
            {
                var entry = orders[ i ].pages[ j ].entries[ k ];

                var price = entry.price.replace(/\./,"").split( "," );
                var cent = parseInt( price[ 0 ] ) * 100 + parseInt( price[ 1 ] );

                year.cent += cent;
                year.products += entry.products;
                year.orders++;

                allOrders.push( entry );
            }
        }

        overall.cent += year.cent;
        overall.products += year.products;
        overall.orders += year.orders;
        overall.month += year.month;

        years.push( year );
    }

    var text = "<h2>Übersicht</h2>";

    text += "<table cellspacing=\"0\" cellpadding=\"4\" border=\"1\"><tr>" +
        "<th>Jahr</th>" +
        "<th>Euro</th>" +
        "<th>Bestell.</th>" +
        "<th>Produkte</th>" +
        "<th>Euro/Prod.</th>" +
        "<th>Euro/Monat</th>" +
        "</tr>";

    text += getOverviewLine( overall );
    for( var i = 0; i < years.length; i++ )
    {
        text += getOverviewLine( years[ i ] );
    }
    text += "</table>";

    text += "<h2>Einzel-Bestellungen</h2>";

    text += "<table cellspacing=\"0\" cellpadding=\"4\" border=\"1\"><tr>" +
        "<th>Link</th>" +
        "<th>Datum</th>" +
        "<th>Produkte</th>" +
        "<th>Preis</th>" +
        "<th>Produktbeschreibungen</th>" +
        "</tr>";

    for( var i = 0; i < allOrders.length; i++ )
    {
        text += getOrderLine( allOrders[ i ] );
    }
    text += "</table>";

    document.body.innerHTML = text;
}

function loadOrders( event )
{
    if( event.currentTarget.onlyOnce )
    {
        return;
    }
    event.currentTarget.onlyOnce = true;

    findOrders( event.currentTarget.document, event.currentTarget.yearIndex, event.currentTarget.pageIndex );

    event.currentTarget.close();
}

function loadYear( event )
{
    if( event.currentTarget.onlyOnce )
    {
        return;
    }
    event.currentTarget.onlyOnce = true;

    var doc = event.currentTarget.document;
    var as = doc.getElementsByTagName( "a" );
    var maxIndex = 0;
    for( var i = 0; i < as.length; i++ )
    {
        if( as[ i ].href.match( /startIndex=(\d+)/ ) )
        {
            maxIndex = Math.max( maxIndex, parseInt( RegExp.$1 ) );
        }
    }

    var year = event.currentTarget.yearIndex;

    for( var i = 0; i <= maxIndex; i += 10 )
    {
        orders[ year ].pages.push( { "done" : false, "entries" : [] } );
    }

    findOrders( doc, year, 0 );

    var pageUri = "https://www.amazon.de/gp/css/order-history/gp/css/order-history/ref=oss_pagination?ie=UTF8&orderFilter=" +
        orders[ year ].year + "&search=&startIndex=";

    var pageIndex = 1;
    for( var i = 10; i <= maxIndex; i += 10 )
    {
        var pageTab = window.open( pageUri + i );
        pageTab.yearIndex = year;
        pageTab.pageIndex = pageIndex;
        pageTab.addEventListener( "load", loadOrders, true );

        pageIndex++;
    }

    event.currentTarget.close();
}

function loadYearCount( event )
{
    if( event.currentTarget.onlyOnce )
    {
        return;
    }
    event.currentTarget.onlyOnce = true;

    var doc = event.currentTarget.document;
    var form = doc.getElementsByClassName('time-period-chooser a-spacing-none')[0];
    var filter = doc.getElementsByName('orderFilter')[0];

    for( var i = 0; i < filter.options.length; i++ )
    {
        var regex = /year-(\d\d\d\d)/;
        if( regex.exec( filter.options[ i ].value ) )
        {
            orders.push( { "year" : filter.options[ i ].value, "pages" : [] } );
        }
    }

    //orders.splice( 0, orders.length - 2 );

    var yearUri = "https://www.amazon.de/gp/css/order-history?";
    for( var i = 0; i < form.elements.length; i++ )
    {
        var element = form.elements[ i ];
        if( element == filter )
        {
            continue;
        }

        yearUri += encodeURIComponent( element.name ) + "=" + encodeURIComponent( element.value ) + "&";
    }
    yearUri += "orderFilter=";
    //alert( yearUri );

    for( var i = 0; i < orders.length; i++ )
    {
        var yearTab = window.open( yearUri + orders[ i ].year );
        yearTab.yearIndex = i;
        yearTab.addEventListener( "load", loadYear, true );
    }

    waitInterval = setInterval( waitForFinish, 1000 );

    event.currentTarget.close();
}

function waitForFinish()
{
    printState();

    for( var i = 0; i < orders.length; i++ )
    {
        if( orders[ i ].pages.length == 0 )
        {
            return;
        }
        for( var j = 0; j < orders[ i ].pages.length; j++ )
        {
            if( !orders[ i ].pages[ j ].done )
            {
                return;
            }
        }
    }

    clearInterval( waitInterval );
    printOrders();
}

var orders = [];
var waitInterval;

var mainTab = window.open("https://www.amazon.de/gp/css/order-history/ref=ya_orders_css");
mainTab.addEventListener( "load", loadYearCount, true );

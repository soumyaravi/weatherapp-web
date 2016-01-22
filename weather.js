var matched, browser;

jQuery.uaMatch = function(ua) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
        /(webkit)[ \/]([\w.]+)/.exec(ua) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
        /(msie) ([\w.]+)/.exec(ua) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

    return {
        browser: match[1] || "",
        version: match[2] || "0"
    };
};

matched = jQuery.uaMatch(navigator.userAgent);
browser = {};

if (matched.browser) {
    browser[matched.browser] = true;
    browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if (browser.chrome) {
    browser.webkit = true;
} else if (browser.webkit) {
    browser.safari = true;
}

jQuery.browser = browser;


function clearForm() {
    $("div#data-info").hide();
    $("div#right").empty();
}
$().ready(function() {
    $("div#data-info").hide();
    $("#search").validate({
        errorClass: 'jqInvalid',
        rules: {
            street: "required",
            city: "required",
            states: {
                selectcheck: true
            }
        },
        messages: {
            street: "Please enter street address",
            city: "Please enter a city"
        },

        submitHandler: function(form) {
            var formData = {
                'street': $('input[name=street]').val(),
                'city': $('input[name=city]').val(),
                'states': $('select option:selected').val(),
                'degree': $("input:radio[name=degree]:checked").val()
            };
            $.ajax({
                type: "GET",
                url: "http://webtech12-env.elasticbeanstalk.com/",
                data: formData, // serializes the form's elements.
                dataType: 'json', // what type of data do we expect back from the server
                encode: true,
                success: function(data) {
                    if(data==null)
                        alert("No results found");
                    else{
                    $("div#right").empty();
                    $.fn.nowtab(data);
                    $.fn.nexttab(data);
                    $.fn.daytab(data);
                    $.fn.modaltab(data);
                    $.fn.mapLoad(data);
                    $("#data-info").show();
                    }
                },
                error: function() {
                    alert('No results found');
                }
            });
        }

    });
});
$.fn.mapLoad = function(data) {
    $(window).resize(function() {
        var canvasheight = $('#cimg').css('height');
        var ht = $('#tabl1').css('height');
        console.log(canvasheight);
        $('#right').css("height", canvasheight);
        $('#right').css("height", "+=" + ht);
        var canvaswidth = $('#left').css('width');
        $('#right').css("width", canvaswidth);
    });

    var canvasheight = $('#right').css('height');
    var canvaswidth = $('#right').css('width');
    $('#right').css("height", canvasheight);
    $('#right').css("width", canvaswidth);

    var lat1 = data.latitude;
    var long1 = data.longitude;
        try{
    var map = new OpenLayers.Map('right');
    // Create OSM overlays
    var mapnik = new OpenLayers.Layer.OSM();

    var layer_cloud = new OpenLayers.Layer.XYZ(
        "clouds",
        "http://${s}.tile.openweathermap.org/map/clouds/${z}/${x}/${y}.png", {
            isBaseLayer: false,
            opacity: 0.7,
            sphericalMercator: true
        }
    );

    var layer_precipitation = new OpenLayers.Layer.XYZ(
        "precipitation",
        "http://${s}.tile.openweathermap.org/map/precipitation/${z}/${x}/${y}.png", {
            isBaseLayer: false,
            opacity: 0.7,
            sphericalMercator: true
        }
    );
    map.addLayers([mapnik, layer_precipitation, layer_cloud]);
    map.addControl(new OpenLayers.Control.LayerSwitcher());

    var lonlat = new OpenLayers.LonLat(long1, lat1).transform(
        new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
        map.getProjectionObject() // to Spherical Mercator Projection
    );
    map.setCenter(lonlat, 8);

    var markers = new OpenLayers.Layer.Markers("Markers");
    map.addLayer(markers);
    markers.addMarker(new OpenLayers.Marker(lonlat));
    }
    catch(err){
        var img="<div style='background-color:white; font-size:20px; text-align:center; vertical align:middle;height:"+canvasheight+";width:"+canvaswidth+";'>Map not available</div>";
        $("#map").html(img);
    }
}
var fbsum, fbimg, fbtemp, fbdeg;
$.fn.nowtab = function(data) {
    $("span.city1").html($('input[name=city]').val());
    $("span#state1").html($('select option:selected').val());
    $("span.summary").html(data.currently.summary);
    var pnow = data.currently.precipIntensity;
    var chance = data.currently.precipProbability;
    var humnow = data.currently.humidity;
    var visnow = data.currently.visibility;
    var rise = data.daily.data[0].sunriseTime;
    var setnow = data.daily.data[0].sunsetTime;
    if ($("input:radio[name=degree]:checked").val() == "Fahrenheit") {
        var deg = 'F';
        var sp = 'mph'
        var vis = 'mi';
    } else {
        var deg = 'C';
        var sp = 'm/s'
        var vis = 'km';
        pnow = pnow / 25.4;
    }
    if (pnow < 0.002)
        pnow = 'None';
    else if (pnow >= 0.002 && pnow < 0.017)
        pnow = 'Very Light';
    else if (pnow >= 0.017 && pnow < 0.1)
        pnow = 'Light';
    else if (pnow >= 0.1 && pnow < 0.4)
        pnow = 'Moderate';
    else
        pnow = 'Heavy';
    $("#pnow").html(pnow);
    $("#dew").html(data.currently.dewPoint + '&deg ' + deg);
    $("#windnow").html(data.currently.windSpeed + ' ' + sp);
    $("#visnow").html(data.currently.visibility + ' ' + vis);
    if (chance != "" || chance == 0)
        $("#chance").html(Math.round(chance) * 100 + "%");
    if (humnow != "")
        $("#humnow").html(Math.round(humnow) * 100 + "%");
    $(".deg").html("&deg; " + deg);
    var tnow = data.currently.temperature;
    $("span#tempnow").html(Math.round(tnow));
    var lownow = data.daily.data[0].temperatureMin;
    var highnow = data.daily.data[0].temperatureMax;
    $("span#nowlow").html('L: ' + Math.round(lownow) + '&deg');
    $("span#nowhigh").html('H: ' + Math.round(highnow) + '&deg');
    var toff = data.offset;
    var off = moment().utcOffset();
    toff = (toff) * 60 - off;
    rise = moment(rise * 1000 + (toff * 60000)).format('hh:mm');
    setnow = moment(setnow * 1000 + (toff * 60000)).format('hh:mm');

    $("#risenow").html(rise + ' AM');
    $("#setnow").html(setnow + ' PM');
    var icon = data.currently.icon;
    var image;
    if (icon == "clear-day")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/clear.png';
    else if (icon == "clear-night")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/clear_night.png';
    else if (icon == "rain")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/rain.png';
    else if (icon == "snow")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/snow.png';
    else if (icon == "sleet")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/sleet.png';
    else if (icon == "wind")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/wind.png';
    else if (icon == "fog")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/fog.png';
    else if (icon == "cloudy")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/cloudy.png';
    else if (icon == "partly-cloudy-day")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/cloud_day.png';
    else if (icon == "partly-cloudy-night")
        image = 'http://cs-server.usc.edu:45678/hw/hw8/images/cloud_night.png';

    $("p#currimg").html('<img src=' + image + ' id="wimg">');
    fbsum = data.currently.summary;
    fbimg = image;
    fbtemp = Math.round(tnow);
    fbdeg = deg;
}

function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    if (response.status === 'connected') {
        postToFb();
    } else if (response.status === 'not_authorized') {
        alert("Not Posted");
    } else {
        login();
    }
}

function login() {
    FB.login(function(response) {
        if (response.authResponse) {
            postToFb();
        } else {
            alert("Not Posted");
        }
    });
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        console.log(response.authResponse);
        statusChangeCallback(response);
    });
}
window.fbAsyncInit = function() {
    FB.init({
        appId: '427083867496315',
        xfbml: true,
        version: 'v2.5'
    });
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function postToFb() {

    FB.ui({
        method: 'feed',
        name: 'Current Weather in ' + $("input[name=city]").val() + ', ' + $("select option:selected").val(),
        link: 'https://forecast.io/',
        picture: fbimg,
        description: fbsum + ', ' + fbtemp + '&deg;' + fbdeg,
        caption: 'WEATHER INFORMATION FROM FORECAST.IO',
    }, function(response) {
        if (response == null)
            alert('Not Posted');
        else
            alert('Posted Successfully');
    });
}
$.fn.nexttab = function(data) {
    var image = ['http://cs-server.usc.edu:45678/hw/hw8/images/clear.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/clear_night.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/rain.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/snow.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/sleet.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/wind.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/fog.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/cloudy.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/cloud_day.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/cloud_night.png'];
    var tmz = data.timezone;
    var toff = data.offset;
    var off = moment().utcOffset();
    toff = (toff) * 60 - off;
    var time24;

    for (var i = 1; i <= 24; i++) {
        time24 = data.hourly.data[i].time;
        time24 = moment(time24 * 1000 + (toff * 60000)).format('hh:mm A');
        var cloud = data.hourly.data[i].cloudCover;
        var temp1 = Math.round(data.hourly.data[i].temperature);
        cloud *= 100;
        var wind, hum, vis, pr;
        wind = data.hourly.data[i].windSpeed;
        hum = data.hourly.data[i].humidity;
        vis = data.hourly.data[i].visibility;
        pr = data.hourly.data[i].pressure;
        hum *= 100;
        hum = Math.round(hum);
        cloud = Math.round(cloud);
        var icon = data.hourly.data[i].icon;
        switch (icon) {
            case 'clear-day':
                icon = image[0];
                break;
            case 'clear-night':
                icon = image[1];
                break;
            case 'rain':
                icon = image[2];
                break;
            case 'snow':
                icon = image[3];
                break;
            case 'sleet':
                icon = image[4];
                break;
            case 'wind':
                icon = image[5];
                break;
            case 'fog':
                icon = image[6];
                break;
            case 'cloudy':
                icon = image[7];
                break;
            case 'partly-cloudy-day':
                icon = image[8];
                break;
            case 'partly-cloudy-night':
                icon = image[9];
                break;
        }
        if ($("input:radio[name=degree]:checked").val() == 'Fahrenheit') {
            wind = wind + ' mph';
            vis = vis + ' mi';
            pr = pr + ' mb';
        } else {
            wind = wind + ' m/s';
            vis = vis + ' km';
            pr = pr + ' hPa';
        }
        hum = hum + " %";
        cloud = cloud + " %";
        $("#img2-" + i).html("<img src='" + icon + "' width='50px'>");
        $("#wind2-" + i).html(wind);
        $("#time" + i).html(time24);
        $("#pr2-" + i).html(pr);
        $("#vis2-" + i).html(vis);
        $("#hum2-" + i).html(hum);
        $("#temp2-" + i).html(temp1);
        $("#cloud2-" + i).html(cloud);
    }
}
$.fn.daytab = function(data) {
    var image = ['http://cs-server.usc.edu:45678/hw/hw8/images/clear.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/clear_night.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/rain.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/snow.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/sleet.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/wind.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/fog.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/cloudy.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/cloud_day.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/cloud_night.png'];
    var days = ['blue', 'red', 'orange', 'green', 'purple', 'pink', 'magenta'];
    var iconweek = new Array(7);
    var toff = data.offset;
    var off = moment().utcOffset();
    toff = (toff) * 60 - off;
    var t3day, t3date;
    for (var i = 1; i <= 7; i++) {
        time24 = data.daily.data[i].time;
        time24 = moment(time24 * 1000 + (toff * 60000)).format('dddd');

        var icon = data.daily.data[i].icon;
        switch (icon) {
            case 'clear-day':
                iconweek[i] = image[0];
                break;
            case 'clear-night':
                iconweek[i] = image[1];
                break;
            case 'rain':
                iconweek[i] = image[2];
                break;
            case 'snow':
                iconweek[i] = image[3];
                break;
            case 'sleet':
                iconweek[i] = image[4];
                break;
            case 'wind':
                iconweek[i] = image[5];
                break;
            case 'fog':
                iconweek[i] = image[6];
                break;
            case 'cloudy':
                iconweek[i] = image[7];
                break;
            case 'partly-cloudy-day':
                iconweek[i] = image[8];
                break;
            case 'partly-cloudy-night':
                iconweek[i] = image[9];
                break;
        }
        var min = data.daily.data[i].temperatureMin;
        min = Math.round(min);
        var max = data.daily.data[i].temperatureMax;
        max = Math.round(max);
        $("span#min" + i).html(min + '&deg;');
        $("span#max" + i).html(max + '&deg;');
        $("span#day" + i).html(time24);
        time24 = data.daily.data[i].time;
        t3day = moment(time24 * 1000 + (toff * 60000)).format('MMM');
        t3date = moment(time24 * 1000 + (toff * 60000)).format('DD');
        $("span#dt" + i).html(t3day);
        $("span#dtb" + i).html(t3date);
        $("span#img3-" + i).html("<img src='" + iconweek[i] + "' width='50px'>");
    }
}
$.fn.modaltab = function(data) {
    var image = ['http://cs-server.usc.edu:45678/hw/hw8/images/clear.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/clear_night.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/rain.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/snow.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/sleet.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/wind.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/fog.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/cloudy.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/cloud_day.png', 'http://cs-server.usc.edu:45678/hw/hw8/images/cloud_night.png'];
    var iconweek = new Array(7);
    for (var i = 1; i <= 7; i++) {
        var icon = data.daily.data[i].icon;
        switch (icon) {
            case 'clear-day':
                iconweek[i] = image[0];
                break;
            case 'clear-night':
                iconweek[i] = image[1];
                break;
            case 'rain':
                iconweek[i] = image[2];
                break;
            case 'snow':
                iconweek[i] = image[3];
                break;
            case 'sleet':
                iconweek[i] = image[4];
                break;
            case 'wind':
                iconweek[i] = image[5];
                break;
            case 'fog':
                iconweek[i] = image[6];
                break;
            case 'cloudy':
                iconweek[i] = image[7];
                break;
            case 'partly-cloudy-day':
                iconweek[i] = image[8];
                break;
            case 'partly-cloudy-night':
                iconweek[i] = image[9];
                break;
        }
        var time24 = data.daily.data[i].time;
        var toff = data.offset;
        var off = moment().utcOffset();
        toff = (toff) * 60 - off;
        time24 = moment(time24 * 1000 + (toff * 60000)).format('dddd');
        $("span#moday-day" + i).html(time24 + ":");
        var rise = data.daily.data[i].sunriseTime;
        var setnow = data.daily.data[i].sunsetTime;
        rise = moment(rise * 1000 + (toff * 60000)).format('hh:mm A');
        setnow = moment(setnow * 1000 + (toff * 60000)).format('hh:mm A');
        $("h6#rise" + i).html(rise);
        $("h6#sunset" + i).html(setnow);
        var humid = data.daily.data[i].humidity;
        var visib = data.daily.data[i].visibility;
        var wind = data.daily.data[i].windSpeed;
        var pr = data.daily.data[i].pressure;
        humid *= 100;
        humid = Math.round(humid);

        var t3day, t3date;
        time24 = data.daily.data[i].time;
        t3day = moment(time24 * 1000 + (toff * 60000)).format('MMM');
        t3date = moment(time24 * 1000 + (toff * 60000)).format('DD');
        $("span#mday" + i).html(t3day);
        $("span#mdate" + i).html(t3date);
        $("div#modal-img-" + i).html('<img src="' + iconweek[i] + '" width="150px;">');
        var summary = data.daily.data[i].summary;
        $("span#sumday" + i).html(summary);
        if ($("input:radio[name=degree]:checked").val() == "Fahrenheit") {
            wind += 'mph'
            visib += 'mi';
            pr += 'mb';
        } else {
            wind += 'm/s'
            visib += 'km';
            pr += 'hPa';
        }
        if (visib == 'undefinedkm' || visib == 'undefinedmi')
            visib = 'N.A.';
        $("h6#wind" + i).html(wind);
        $("h6#humid" + i).html(humid + "%");
        $("h6#visib" + i).html(visib);
        $("h6#press" + i).html(pr);
    }
}
jQuery.validator.addMethod('selectcheck', function(value) {
    return (value != 'default');
}, "Please select a state");
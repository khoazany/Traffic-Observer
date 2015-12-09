var currentView = "dashboard";

if(localStorage.getItem('currentView')) {
    currentView = localStorage.getItem('currentView');
}

var mode = "day";

// Get last mode used from local storage
if(localStorage.getItem('mode')) {
    mode = localStorage.getItem('mode');
}

if(!localStorage.getItem('email')) {
    localStorage.setItem('email','khoa.zany@gmail.com');
}

if(!localStorage.getItem('isAutoRefresh')) {
    localStorage.setItem('isAutoRefresh',false);
}

var mapMode = 'cluster';

var fromDate = '';
var fromTime = '';

var rawData;

/*
if(localStorage.getItem('fromDate')) {
    from = localStorage.getItem('fromDate') + ' ' + localStorage.getItem('fromTime');
}
*/

var toDate = '';
var toTime = '';

/*
if(localStorage.getItem('toDate')) {
    from = localStorage.getItem('toDate') + ' ' + localStorage.getItem('toTime');
}
*/

// Change the URL of the channel HERE
var channel1 = "http://api.thingspeak.com/channels/63279";
var channel2 = "http://api.thingspeak.com/channels/64795";

// HARDCODE AVERAGE CONSUMPTION
AVERAGE_CONSUMPTION_DAY = 740000.6111111;
AVERAGE_CONSUMPTION_HOUR = 30000.8587963;
AVERAGE_CONSUMPTION_MINUTE = 5000.514313272;

// Field numbers on ThingSpeak
var fields = [1,2]

// Pre-initiate values
var outputs,pulledData1,pulledData2,heatmapInstance,
heatmapData,autoRefreshInterval,map,map2,markers,geojsonLayer,heat,mapLayers,map2Layers,
breakInterval,legend,legend2,tempProcessedData,tempProcessedData2;

var factorCount = 0, comparedFactorCount = 0;

var factors = [
{
    "title": "Accident Severity",
    "name": "Accident_Severity",
    "type": "multi-select",
    "values": [
    {
        "key": "Heavy",
        "value": "1"
    },
    {
        "key": "Medium",
        "value": "2"
    },
    {
        "key": "Weak",
        "value": "3"
    }
    ]
},
{
    "title": "Number of Vehicles",
    "name": "Number_of_Vehicles",
    "type": "range",
    "min": "1",
    "max": "67"
},
{
    "title": "Number of Casualties",
    "name": "Number_of_Casualties",
    "type": "range",
    "min": 1,
    "max": 93
},
{
    "title": "Day of Week",
    "name": "Day_of_Week",
    "type": "multi-select",
    "values": [
    {
        "key": "Sunday",
        "value": "1"
    },
    {
        "key": "Monday",
        "value": "2"
    },
    {
        "key": "Tuesday",
        "value": "3"
    },
    {
        "key": "Wednesday",
        "value": "4"
    },
    {
        "key": "Thursday",
        "value": "4"
    },
    {
        "key": "Friday",
        "value": "5"
    },
    {
        "key": "Saturday",
        "value": "6"
    }
    ]
},
{
    "title": "Road Type",
    "name": "Road_Type",
    "type": "range",
    "min": 1,
    "max": 9
},
{
    "title": "Speed limit",
    "name": "Speed_limit",
    "type": "multi-select",
    "values": [
    {
        "key": "20",
        "value": "20"
    },
    {
        "key": "30",
        "value": "30"
    },
    {
        "key": "40",
        "value": "40"
    },
    {
        "key": "50",
        "value": "50"
    },
    {
        "key": "60",
        "value": "60"
    },
    {
        "key": "70",
        "value": "70"
    }
    ]
},
{
    "title": "Pedestrian crossing- number of physical facilities",
    "name": "Pedestrian_Crossing-Physical_Facilities",
    "type": "range",
    "min": 0,
    "max": 8
},
];

var factorsMap = {};
for (var i = 0; i < factors.length; i++) {
    factorsMap[factors[i].name] = factors[i].title;
}
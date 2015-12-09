function renderMap (mapVar,processedData,layersGroup) {
    // Get map type
    //mapMode = $('#map-type').val();
    var isCluster = ($('#cluster-check:checked').length > 0);
    console.log(isCluster);
    var isCholo = ($('#cholopleth-check:checked').length > 0);
    console.log(isCholo);
    var isHeat = ($('#heatmap-check:checked').length > 0);
    console.log(isHeat);

    // Clear the old layers
    console.log(layersGroup);
    layersGroup.clearLayers();

    if(legend) {
        mapVar.removeControl(legend);
    }

    if(isCluster) {
        markers = new L.MarkerClusterGroup();

        if(!processedData) {
            showErrorMessage("Data is still being loaded....");
        } else {
            processedData.forEach(function (data) {
                markers.addLayer(L.marker([data['Latitude'],data['Longitude']]));
                //markerArray.push(tempMarker);
            });

        /*
        var heatLayerArray = [];

        for (var i = 0; i < results.length; i++) {
            heatLayerArray.push([results[i].iBeacon.x,results[i].iBeacon.y,100]);
        }

        console.log(heatLayerArray);

        var heat = L.heatLayer(heatLayerArray, {radius: 5}).addTo(map);
        */

        //mapVar.addLayer(markers);
            layersGroup.addLayer(markers);
        }
        //var group = new L.featureGroup(markerArray);
        //mapVar.fitBounds(group.getBounds());
    }

    if(isCholo) {
        tempProcessedData = processedData;

        geojsonLayer = new L.GeoJSON.AJAX("shapefiles/joined_area_filter.geojson",
            {style: style});     
        //{});
        geojsonLayer.setStyle(style);

        console.log(geojsonLayer);
        //geojsonLayer.addTo(mapVar);

        //serie = new geostats(data); 
        //serie.getEqInterval(4);
        //console.log(serie.ranges);
        //console.log(serie.bounds);
        
        layersGroup.addLayer(geojsonLayer);

        legend = L.control({position: 'topright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 100, 200, 500, 1000, 2000, 5000, 20000],
            labels = [];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                '<i style="background:' + getColor(undefined,grades[i] + 1,false) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(mapVar);
    }

    if(isHeat) {
        var heatLayerArray = [];
        processedData.forEach(function (data) {
            heatLayerArray.push([data['Latitude'],data['Longitude'],100]);
        });

        heat = L.heatLayer(heatLayerArray, {radius: 5});

        //mapVar.addLayer(heat);
        layersGroup.addLayer(heat);
    }

    mapVar.addLayer(layersGroup);
}

function renderMap2 (mapVar,processedData,layersGroup) {
    // Get map type
    //mapMode = $('#map-type').val();
    var isCluster = ($('#cluster-check:checked').length > 0);
    console.log(isCluster);
    var isCholo = ($('#cholopleth-check:checked').length > 0);
    console.log(isCholo);
    var isHeat = ($('#heatmap-check:checked').length > 0);
    console.log(isHeat);

    // Clear the old layers
    console.log(layersGroup);
    layersGroup.clearLayers();

    if(legend2) {
        mapVar.removeControl(legend2);
    }

    if(isCluster) {
        markers = new L.MarkerClusterGroup();

        if(!processedData) {
            showErrorMessage("Data is still being loaded....");
        } else {
            processedData.forEach(function (data) {
                markers.addLayer(L.marker([data['Latitude'],data['Longitude']]));
                //markerArray.push(tempMarker);
            });

        /*
        var heatLayerArray = [];

        for (var i = 0; i < results.length; i++) {
            heatLayerArray.push([results[i].iBeacon.x,results[i].iBeacon.y,100]);
        }

        console.log(heatLayerArray);

        var heat = L.heatLayer(heatLayerArray, {radius: 5}).addTo(map);
        */

        //mapVar.addLayer(markers);
            layersGroup.addLayer(markers);
        }
        //var group = new L.featureGroup(markerArray);
        //mapVar.fitBounds(group.getBounds());
    }

    if(isCholo) {
        tempProcessedData2 = processedData;

        geojsonLayer = new L.GeoJSON.AJAX("shapefiles/joined_area_filter.geojson",
            {style: style2});     
        //{});
        geojsonLayer.setStyle(style);

        console.log(geojsonLayer);
        //geojsonLayer.addTo(mapVar);

        //serie = new geostats(data); 
        //serie.getEqInterval(4);
        //console.log(serie.ranges);
        //console.log(serie.bounds);
        
        layersGroup.addLayer(geojsonLayer);

        legend2 = L.control({position: 'topright'});

        legend2.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 100, 200, 500, 1000, 2000, 5000, 20000],
            labels = [];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                '<i style="background:' + getColor(undefined,grades[i] + 1,true) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend2.addTo(mapVar);
    }

    if(isHeat) {
        var heatLayerArray = [];
        processedData.forEach(function (data) {
            heatLayerArray.push([data['Latitude'],data['Longitude'],100]);
        });

        heat = L.heatLayer(heatLayerArray, {radius: 5});

        //mapVar.addLayer(heat);
        layersGroup.addLayer(heat);
    }

    mapVar.addLayer(layersGroup);
}

function getColor(area,d,isCompared) {
    var usedData;

    if(!isCompared) {
        usedData = tempProcessedData;
    } else {
        usedData = tempProcessedData2;
    }

    if(!d) {
        d = usedData.reduce(function(sum, a) {
            if(a['Lsoa11Nm'] == area) {
                return sum + 1;
            } else {
                return sum;
            }
        },0);
    }

    console.log(d);

    return d > 20000 ? '#800026' :
    d > 5000  ? '#BD0026' :
    d > 2000  ? '#E31A1C' :
    d > 1000  ? '#FC4E2A' :
    d > 500  ? '#FD8D3C' :
    d > 200   ? '#FEB24C' :
    d > 100   ? '#FED976' :
    '#FFEDA0';
}

function style(feature) {

    return {
        fillColor: getColor(feature.properties['Area'],false),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function style2(feature) {

    return {
        fillColor: getColor(feature.properties['Area'],true),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}
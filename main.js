$(document).ready(function () {
    /*
    prepareHeatmapAndAlert();
    reactToNewView(currentView);

    $('#is-auto-refresh').change(function () {
        if($(this).prop('checked')) {
            localStorage.setItem('isAutoRefresh',true);
        } else {
            localStorage.setItem('isAutoRefresh',false);
        }
        activateOrStopAutoRefresh();
    });
*/

reactToNewView(currentView);

});

function showErrorMessage (message) {
    $('#alert-container').html('');

    $('<div class="alert alert-danger fixedTopElement system-message">' +
      '<button class="close" data-dismiss="alert"' +
      'type="button">&times;</button>' + message + 
      '</div>').hide().prependTo('#alert-container')
    .slideDown('fast')
    .delay(40000)
    .slideUp(function() {
        $(this).remove(); 
    });
}

function showSuccessMessage (message,containerId) {
    if(!containerId) {
        containerId = '#alert-container'
    }
    $(containerId).html('');

    $('<div class="alert alert-success fixedTopElement system-message">' +
      '<button class="close" data-dismiss="alert"' +
      'type="button">&times;</button>' + message + 
      '</div>').hide().prependTo(containerId)
    .slideDown('fast')
    .delay(40000)
    .slideUp(function() {
        $(this).remove(); 
    });
}

function changeView (newView) {
    currentView = newView;
    localStorage.setItem('currentView',currentView);

    reactToNewView(newView);
}

function reactToNewView (view) {
    /* Remove old alert */
    $('#alert-container').html('');

    /* Change active on sidebar */
    $('a.active').removeClass('active');
    $('#' + view).addClass('active');

    /* Change template */
    $('.content').hide();
    $('#' + view + '-content').show();

    /* Activate or stop auto refresh data */
    //activateOrStopAutoRefresh();

    if(view == 'dashboard') {
        if(!map) {
            map = L.map('map').setView([51.505, -0.09], 10);

            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 15
            }).addTo(map);

            mapLayers = new L.LayerGroup();
        }

        if(!map2) {
            map2 = L.map('map2').setView([51.505, -0.09], 10);

            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 15
            }).addTo(map2);

            map2Layers = new L.LayerGroup();
        }

        // Generate the filters
        generateFilters('filter-key-container');
        generateFilters('compared-key-container');

        // Change filter event
        $(document).on('change','.filter-key',function () {
            var self = this;
            if($(self).val() != '') {
                factors.forEach(function (factor) {
                    if($(self).val() == factor.name) {
                        if(factor.type == 'multi-select') {
                            var factorHtml = '<select data-type="' + factor.type + '" id="filter-value-' + $(self).data('id') + 
                            '" class="select-chosen" data-placeholder="Choose values.." multiple>' +
                            '<option></option>';
                            for (var i = 0; i < factor.values.length; i++) {
                             factorHtml += '<option value="' + factor.values[i].value + '">' +
                             factor.values[i].key + '</option>';
                         }
                         factorHtml += '</select>';

                         $('.filter-value[data-id=' + $(self).data('id') + ']').html(factorHtml);
                         $('#filter-value-' + $(self).data('id')).chosen({width: "100%"});

                     } else if (factor.type == 'range') {
                        var factorHtml = '<input data-type="' + factor.type + '" id="filter-value-' + 
                        $(self).data('id') + '" type="text" class="form-control input-slider" ' + 
                        'data-slider-min="' + factor.min + '" data-slider-max="' + factor.max + '" ' +
                        'data-slider-step="1" data-slider-value="[' + factor.min + ',' + factor.max + ']" ' +
                        'data-slider-orientation="horizontal" data-slider-tooltip="show">';

                        $('.filter-value[data-id=' + $(self).data('id') + ']').html(factorHtml);
                        $('#filter-value-' + $(self).data('id')).slider();
                    }
                }
            });
        }
    });

    $(document).on('change','.compared-key',function () {
        var self = this;
        if($(self).val() != '') {
            factors.forEach(function (factor) {
                if($(self).val() == factor.name) {
                    if(factor.type == 'multi-select') {
                        var factorHtml = '<select data-type="' + factor.type + '" id="compared-value-' + $(self).data('id') + 
                        '" class="select-chosen" data-placeholder="Choose values.." multiple>' +
                        '<option></option>';
                        for (var i = 0; i < factor.values.length; i++) {
                            factorHtml += '<option value="' + factor.values[i].value + '">' +
                            factor.values[i].key + '</option>';
                        }
                        factorHtml += '</select>';

                        $('.compared-value[data-id=' + $(self).data('id') + ']').html(factorHtml);
                        $('#compared-value-' + $(self).data('id')).chosen({width: "100%"});

                    } else if (factor.type == 'range') {
                        var factorHtml = '<input data-type="' + factor.type + '" id="compared-value-' + 
                        $(self).data('id') + '" type="text" class="form-control input-slider" ' + 
                        'data-slider-min="' + factor.min + '" data-slider-max="' + factor.max + '" ' +
                        'data-slider-step="1" data-slider-value="[' + factor.min + ',' + factor.max + ']" ' +
                        'data-slider-orientation="horizontal" data-slider-tooltip="show">';

                        $('.compared-value[data-id=' + $(self).data('id') + ']').html(factorHtml);
                        $('#compared-value-' + $(self).data('id')).slider();
                    }
                }
            });
        }
    });
    
    /*
    $('#byDayViewType').change(function () {
        if($(this).val() == 'timeseries') {
            $('#col-md-hour').removeClass('col-md-12');
            $('#col-md-hour').addClass('col-md-6');
            $('#col-md-day').removeClass('col-md-12');
            $('#col-md-day').addClass('col-md-6');
        } else {
            $('#col-md-hour').removeClass('col-md-6');
            $('#col-md-hour').addClass('col-md-12');
            $('#col-md-day').removeClass('col-md-6');
            $('#col-md-day').addClass('col-md-12');
        }
    })
    */

        // Read the data csv
        readCsv('csv/joint-final.csv',function (rows) {
            console.log(rows[0]);
            rawData = rows;
            //renderMap(map,rawData);
            //renderMap(map2,rawData);
        });
    }
}

function getResults (newFilterList) {
    $('#dashboard-visualization').show();

    var filterList = [], comparedList = [],map1ProcessedData = [],map2ProcessedData = [],
    databyHour = [],databyDay = [],comparedByHour,comparedByDay,bubbleChartData = [];

    if(!newFilterList) {
        for (var i = 0; i < factorCount; i++) {
            var factorValueSelector = $('#filter-value-' + (i+1));
            var values = factorValueSelector.val();

            if(values) {
                if(factorValueSelector.data('type') == 'multi-select') {
                    filterList.push({
                        name: $('.filter-key[data-id=' + (i+1) + ']').val(),
                        type: factorValueSelector.data('type'),
                        values: values
                    });
                } else if(factorValueSelector.data('type') == 'range') {
                    filterList.push({
                        name: $('.filter-key[data-id=' + (i+1) + ']').val(),
                        type: factorValueSelector.data('type'),
                        min: parseInt(values.substring(0,values.indexOf(","))),
                        max: parseInt(values.substring(values.indexOf(",")+1,values.length))
                    });
                }
            }
        }
    } else {
        filterList = newFilterList;
    }

    for (var i = 0; i < comparedFactorCount; i++) {
        var factorValueSelector = $('#compared-value-' + (i+1));
        var values = factorValueSelector.val();

        if(values) {
            if(factorValueSelector.data('type') == 'multi-select') {
                comparedList.push({
                    name: $('.compared-key[data-id=' + (i+1) + ']').val(),
                    type: factorValueSelector.data('type'),
                    values: values
                });
            } else if(factorValueSelector.data('type') == 'range') {
                comparedList.push({
                    name: $('.compared-key[data-id=' + (i+1) + ']').val(),
                    type: factorValueSelector.data('type'),
                    min: parseInt(values.substring(0,values.indexOf(","))),
                    max: parseInt(values.substring(values.indexOf(",")+1,values.length))
                });
            }
        }
    }

    console.log(filterList);
    console.log(comparedList);

    // initiate data for hour time series
    for (var i = 0; i <= 23; i++) {
        databyHour.push({
            date: i + ':00',
            value: 0
        });   
    }

    rawData.forEach(function (d) {
        var passed = true;

        filterList.some(function (filter) {
            if ((filter.type == 'multi-select' && $.inArray(d[filter.name], filter.values)) ||
                (filter.type == 'range' && filter.min <= parseInt(d[filter.name]) &&
                    filter.max >= parseInt(d[filter.name]))) {
            } else {
                passed = false;
                return true;
            }
        });

        if(passed) {
            map1ProcessedData.push(d);

            databyHour.some(function (hourData) {
                if(d.Time.substring(0,d.Time.indexOf(":")) + ':00' == hourData.date) {
                    hourData.value += 1;
                    return true;
                }
            });

            var dayExisted = false;
            databyDay.some(function (dayData) {
                if(d.Date == dayData.date) {
                    dayData.value += 1;
                    dayExisted = true;
                    return true;
                }
            });

            if(!dayExisted) {
                databyDay.push({
                    date: d.Date,
                    value: 1
                });
            }

            var factorsExisted = false;
            bubbleChartData.some(function (bubbleData) {
                for (var i = 0; i < bubbleData.factors.length; i++) {
                    if(bubbleData.factors[i].value != d[bubbleData.factors[i].name]) {
                        return true;
                    }
                }

                bubbleData.value += 1; 
                factorsExisted = true;               
            });

            if(!factorsExisted) {
                var newData = {
                    factors: [],
                    value: 1
                };

                var displayName = '';

                filterList.forEach(function (filter) {
                    newData.factors.push({
                        name: filter.name,
                        value: d[filter.name]
                    });

                    displayName += factorsMap[filter.name] + '-' + d[filter.name] + ' '
                });

                newData.displayName = displayName;

                bubbleChartData.push(newData);
            }
        }
    });

    var top10BubbleData = bubbleChartData.sort(function(a, b) { return a.value < b.value? 1 : -1; })
                .slice(0, Math.min(bubbleChartData.length,10));

    setTimeout(function () {
        renderMap(map,map1ProcessedData,mapLayers);

        console.log(top10BubbleData);
        generateBubbleChart(top10BubbleData);
    },0);

    if(comparedList.length > 0) {
        // show chart for compared data in this case
        comparedByDay = [];
        comparedByHour = [];

        // initiate data for hour time series
        for (var i = 0; i <= 23; i++) {
            comparedByHour.push({
                date: i + ':00',
                value: 0
            });   
        }

        rawData.forEach(function (d) {
            var passed = true;

            comparedList.some(function (filter) {
                if ((filter.type == 'multi-select' && $.inArray(d[filter.name], filter.values)) ||
                    (filter.type == 'range' && filter.min <= parseInt(d[filter.name]) &&
                        filter.max >= parseInt(d[filter.name]))) {
                } else {
                    passed = false;
                    return true;
                }
            });

            if(passed) {
                map2ProcessedData.push(d);

                comparedByHour.some(function (hourData) {
                    if(d.Time.substring(0,d.Time.indexOf(":")) + ':00' == hourData.date) {
                        hourData.value += 1;
                        return true;
                    }
                });

                var dayExisted = false;
                comparedByDay.some(function (dayData) {
                    if(d.Date == dayData.date) {
                        dayData.value += 1;
                        dayExisted = true;
                        return true;
                    }
                });

                if(!dayExisted) {
                    comparedByDay.push({
                        date: d.Date,
                        value: 1
                    });
                }
            }
        });

        console.log(databyDay);

        setTimeout(function () {
            renderMap2(map2,map2ProcessedData,map2Layers);
        },0);
    }

    setTimeout(function () {
        generateTimeSeries("hour","#svg-series-hour",databyHour,comparedByHour);

        if($('#byDayViewType').val() == 'timeseries') {
            generateTimeSeries("day","#svg-series-day",databyDay,comparedByDay);       
        } else if ($('#byDayViewType').val() == 'calendar') {
            console.log(databyDay);
            generateCalendarView("#original-calendar-block","#svg-series-day",databyDay);
            generateCalendarView("#compared-calendar-block","#svg-series-day",comparedByDay);       
        }
    },0)
}

function readCsv(path,callback) {
    d3.csv(path)
    //.row(function(d) { return {key: d.key, value: +d.value}; })
    .get(function(error, rows) {
        if(error) {
            showErrorMessage(error);
        } else {
            console.log(rows.length);
            callback(rows);
        }
    });
}

function generateFilters (containerId) {
    var selectorHtml = '';
    if(containerId == 'filter-key-container') {
        factorCount += 1;
        $('#filter-value-container').append('<div class="filter-value" data-id="' + factorCount + '">');
        selectorHtml = '<select class="form-control filter-key" data-id="' + factorCount + '">' +
        '<option value="">Choose a factor...</option>';
    } else {
        comparedFactorCount += 1;
        $('#compared-value-container').append('<div class="compared-value" data-id="' + comparedFactorCount + '">');
        selectorHtml = '<select class="form-control compared-key" data-id="' + comparedFactorCount + '">' +
        '<option value="">Choose a factor...</option>';
    }
    for (var i = 0; i < factors.length; i++) {
        selectorHtml += '<option value="' + factors[i].name + '">' + factors[i].title + '</option>';
    }
    selectorHtml += '</select>';

    $('#' + containerId).append(selectorHtml);
}


function changeMode (newMode) {
    mode = newMode;
    localStorage.setItem('mode',mode);
}

function changeFrom (newFromDate,newFromTime) {
    fromDate = newFromDate;
    fromTime = newFromTime;
    localStorage.setItem('newFromDate',newFromDate);
    localStorage.setItem('newFromTime',newFromTime);
}

function changeTo (newToDate,newToTime) {
    toDate = newToDate;
    toTime = newToTime;
    localStorage.setItem('newFromDate',newToDate);
    localStorage.setItem('newToTime',newToTime);
}

function viewChart () {
    changeFrom($('#dateFrom').val(),$('#timeFrom').val());
    changeTo($('#dateTo').val(),$('#timeTo').val());
    execute(false);
}
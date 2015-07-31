/* 
 * Copyright 2015 W.B.S.S GmbH Zurich.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not 
 * use this file except in compliance with the License. You may obtain a copy 
 * of the License at 
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0 
 *   
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT 
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the 
 * License for the specific language governing permissions and limitations 
 * under the License.
 * 
 */

'use strict';

// create module
var dash = angular.module('Dashboard', ["ngAnimate"]);

//controller business logic
dash.controller('DashboardController', function AppCtrl($scope, $http, $location, $timeout) {

	var clientMQ = null;
	var context = "";
	if ($location.absUrl().indexOf("/mycoffee/") > -1) {
		context = "/mycoffee";
	}
	var initChartDone = false;
	var timelineChart = null;
	var productChart = null;
	var machineChart = null;
	var timelineChartType = "";
	var metricsChartType = "PRODUCT";
	var statistic = {};
	var timelineDataHours = [];
	var timelineDataDays = [];
	var timelineDataWeeks = [];
	var timelineDataMonths = [];
	var timelineColumnsHours = null;
	var timelineColumnsDays = null;
	var timelineColumnsWeeks = null;
	var timelineColumnsMonths = null;
	var tlXFormatter = null;
	var totalQuantity = 0;
	
    $scope.error = "";
    $scope.info = "";
    $scope.timeRangeSelected;
    $scope.noData = true;
    $scope.tlBtnHourDisabled = false;
    $scope.tlBtnDayDisabled = false;
    $scope.tlBtnWeekDisabled = false;
    $scope.tlBtnMonthDisabled = false;
    $scope.tlBtnHourActive = false;
    $scope.tlBtnDayActive = false;
    $scope.tlBtnWeekActive = false;
    $scope.tlBtnMonthActive = false;
    $scope.metricsProductActive = true;
    $scope.update = false;
    $scope.loading = false;
    
    function init() {
    	$scope.timeRangeSelected = $scope.timeRanges[0];
       	connectMQ();
       	getClients();
    }
    
	$scope.timeRanges = [{name: 'Heute', days: 1},
	                   {name: 'Letzten 7 Tage', days: 7},
	                   {name: 'Letzten 30 Tage', days: 30},
	                   {name: 'Letzten 90 Tage', days: 90},
	                   {name: 'Letzten 365 Tage', days: 365}];    
    
    function getClients() {
        $http({
            method: 'GET',
            url: context + '/api/clients'
        }).
            success(function (data) {
            	// attach this data to the scope
                $scope.clients = data;

                // clear the error messages
                $scope.error = '';

                $scope.getStatistic();
            }).
            error(function (data, status) {
                if (status === 404) {
                    $scope.error = 'No clients';
                } else {
                    $scope.error = 'Error: ' + status;
                }
            });
    };
	
    $scope.getStatistic = function() {
    	
    	$scope.loading = true;
    	
    	// get date range
    	var dateTo = new Date();
    	var dateFrom = new Date();
    	dateFrom.setDate(dateTo.getDate() - ($scope.timeRangeSelected.days - 1));
    	var dateToStr = adjustTwoDigits(String(dateTo.getDate())) + adjustTwoDigits(String(dateTo.getMonth() + 1)) + String(dateTo.getFullYear());
    	var dateFromStr = adjustTwoDigits(String(dateFrom.getDate())) + adjustTwoDigits(String(dateFrom.getMonth() + 1)) + String(dateFrom.getFullYear());
    	var statisticType = "";
    	
    	// set statistic type (group criteria)
    	if (Number($scope.timeRangeSelected.days) <= 7) {
    		statisticType = "hour";
    	} else {
    		statisticType = "day";
    	}
    	
    	// enable/disable chart types
        $scope.tlBtnHourDisabled = false;
        $scope.tlBtnDayDisabled = false;
        $scope.tlBtnWeekDisabled = false;
        $scope.tlBtnMonthDisabled = false;
    	if (Number($scope.timeRangeSelected.days) > 7) {
    		$scope.tlBtnHourDisabled = true;
    	}
    	if (Number($scope.timeRangeSelected.days) > 90) {
    		$scope.tlBtnDayDisabled = true;
    	}
    	
        $http({
            method: 'GET',
            url: context + '/api/statistic/' + statisticType + "/" + dateFromStr + "/" + dateToStr
        }).
            success(function (data) {
            	
            	$scope.loading = false;
                // attach this data to the scope
                statistic = data;

                // resets
            	timelineColumnsHours = null;
            	timelineColumnsDays = null;
            	timelineColumnsWeeks = null;
            	timelineColumnsMonths = null;
                
            	if (statistic.timeData[0] == null) {
            		$scope.noData = true;
            		$scope.tlBtnHourDisabled = true;
                    $scope.tlBtnDayDisabled = true;
                    $scope.tlBtnWeekDisabled = true;
                    $scope.tlBtnMonthDisabled = true;
            		return;
            		
            	} else {
            		$scope.noData = false;
            	}	
            	
            	if (statisticType === "hour") {
	                timelineDataHours = statistic.timeData;
	                timelineDataHours = fillUpTimlineHours()
	                aggregateTimelineDataHours();
	                
            	} else {
            		timelineDataDays = statistic.timeData;
	                timelineDataDays = fillUpTimlineDays();
	                $scope.drawTimlineChartType("DAY");
            	}  
            	
            	aggregateTimelineDataWeeks();
            	aggregateTimelineDataMonths();
            	setTotalQuantity();
                
            	// draw timeline chart
            	if (statisticType === "hour") {
            		$scope.drawTimlineChartType("HOUR");
            	} else {
            		if (Number($scope.timeRangeSelected.days) > 90) {
            			$scope.drawTimlineChartType("WEEK");
            		} else {
            			$scope.drawTimlineChartType("DAY");
            		}
            	}

            	// draw bar chart
            	$scope.drawMetricsChart(metricsChartType);
            	
            	initChartDone = true;
            	
                // clear the error messages
                $scope.error = '';
                
            }).
            error(function (data, status) {
            	$scope.loading = false;
                if (status === 404) {
                    $scope.error = 'No statistic';
                } else {
                    $scope.error = 'Error: ' + status;
                }
            });
    };
    
    $scope.drawTimlineChartType = function(type) {
    	
    	setTimelineChartType(type);
    	$scope.drawTimlineChart("init");
    }
    
    $scope.drawTimlineChart = function(mode) {
    	
    	var columns = [], format = "";
    	
    	if ($scope.timelineChartType === 'HOUR') {
    		if (timelineColumnsHours === null)
    			timelineColumnsHours = getTimelineColumnsHours();
    		columns = timelineColumnsHours;
    		format = "%d.%m %Hh";
    		
    	} else if ($scope.timelineChartType === 'DAY') {
    		if (timelineColumnsDays === null)
    			timelineColumnsDays = getTimelineColumns("DAY");
    		columns = timelineColumnsDays;
    		format = "%d.%m.%Y";
    		
    	} else if ($scope.timelineChartType === 'WEEK') {
    		if (timelineColumnsWeeks === null)
    			timelineColumnsWeeks = getTimelineColumns("WEEK");
    		columns = timelineColumnsWeeks;
    		format = "%W/%Y";
    		
    	} else {
    		if (timelineColumnsMonths === null)
    			timelineColumnsMonths = getTimelineColumns("MONTH");
    		columns = timelineColumnsMonths;
    		format = "%m.%Y";
    	}	
    	
		tlXFormatter = d3.time.format(format);

    	if (mode === "init") {
    		initTimelineChart(columns);
    	}
	}

    function adjustTwoDigits(numberStr) {
    	if (numberStr.length === 1)
    		return "0" + numberStr;
    	else
    		return numberStr;
    }
    
    function initTimelineChart(columns) {
    	
    	if (initChartDone) {
    		timelineChart.load({
    			columns: columns
    		});
    		
    	} else {	
	    	timelineChart = c3.generate({
	    		grid: {
	    	        y: {
	    	            show: true
	    	        }
	    	    },
	    	    data: {
	    	    	x: 'x',
	    	        columns: columns,
	    	        types: {
	    	        	Verbrauch: 'area'
	    	        }
	    	    },
	    	    axis: {
	    	    	x: {
	    	            type: 'timeseries',
	    	            tick: {
	    	                format: function (x) { // x comes in as a time string.
	    	                    return tlXFormatter(x);
	    	                }
	    	            }
	    	        },
		    	    y: {
		    	        tick: {
		    	        	format: function (y) {
		    	            	return Math.round(y);},
		    	          outer: false,
		    	          count: 4
		    	        }
		    	      }
		    	    },
	    	    color: {
	    	    	  pattern: ['#058dc7']
	    	    	},
	    	    point: {
	    	    	  r: 5
	    	    	}    	    	
	    	});    	
    	}	
    }
    
    function fillUpTimlineDays() {
    	
    	var data = [];
    	
    	for (var i = 0; i < timelineDataDays.length; i++) {
    		data[data.length] = timelineDataDays[i];
    		fillUpDays(i, data);
    	}
    	
    	return data;
    }
    
    function fillUpDays(i , data) {
    	
    	if (i === timelineDataDays.length - 1)
    		return; // last element
    	
    	var n = 0;
    	var date1 = new Date(timelineDataDays[i].year, timelineDataDays[i].month - 1, timelineDataDays[i].day);
    	var date2 = new Date(timelineDataDays[i + 1].year, timelineDataDays[i + 1].month - 1, timelineDataDays[i + 1].day);
    	var days = date1 - date2;
    	var dateNew = null, obj = null;
    	
    	if (days > 1) {
    		for (n = 1; n < days; n++) {
       			dateNew = new Date(date1 + 1);
       			obj = {};
       			obj.year = dateNew.getFullYear();
       			obj.month = dateNew.getMonth() + 1;
       			obj.day = dateNew.getDate();
       			obj.quantity = 0;
        		data[data.length] = obj;    			
    		}
    	}
    }
    

    function fillUpTimlineHours() {
    	
    	var data = [];
    	
    	for (var i = 0; i < timelineDataHours.length; i++) {
    		data[data.length] = timelineDataHours[i];
    		fillUpHours(i, data);
    	}
    	
    	return data;
    }
    
    function fillUpHours(i , data) {
    	
    	if (i === timelineDataHours.length - 1)
    		return; // last element
    	
    	var n = 0;
    	var date1 = new Date(timelineDataHours[i].year, timelineDataHours[i].month - 1, timelineDataHours[i].day, timelineDataHours[i].hour);
    	var date2 = new Date(timelineDataHours[i + 1].year, timelineDataHours[i + 1].month - 1, timelineDataHours[i + 1].day, timelineDataHours[i + 1].hour);
    	var hours = Math.abs(date1 - date2) / 36e5;
    	var dateNew = null, obj = null;
    	
    	if (hours > 1) {
    		for (n = 1; n < hours; n++) {
       			dateNew = new Date(date1.setTime(date1.getTime() + (60*60*1000)));
       			obj = {};
       			obj.year = dateNew.getFullYear();
       			obj.month = dateNew.getMonth() + 1;
       			obj.day = dateNew.getDate();
       			obj.hour = dateNew.getHours();
       			obj.quantity = 0;
        		data[data.length] = obj;    			
    		}
    	}
    }
    
    function aggregateTimelineDataHours() {
    	
    	var i = 0, dateCurrent = null, lastDate = null, quantity = 0, obj = null;

    	timelineDataDays = [];
    	
    	for (i = 0; i < timelineDataHours.length; i++) {
    		dateCurrent = new Date(timelineDataHours[i].year, timelineDataHours[i].month - 1, timelineDataHours[i].day);
    		if (areDatesEqual(dateCurrent, lastDate) || i === 0) {
    			quantity = quantity + timelineDataHours[i].quantity;
    		} else {
       			obj = {};
       			obj.year = lastDate.getFullYear();
       			obj.month = lastDate.getMonth() + 1;
       			obj.day = lastDate.getDate();
       			obj.quantity = quantity;
       			timelineDataDays[timelineDataDays.length] = obj;
       			
    			quantity = timelineDataHours[i].quantity;
    		}
    		lastDate = dateCurrent;
    	}	
   
    	// add last
		obj = {};
		obj.year = lastDate.getFullYear();
		obj.month = lastDate.getMonth() + 1;
		obj.day = lastDate.getDate();
		obj.quantity = quantity;
		timelineDataDays[timelineDataDays.length] = obj;    			
    }

    function aggregateTimelineDataWeeks() {
    	
    	var i = 0, dateCurrent = null, lastDate = null, quantity = 0, obj = null;

    	timelineDataWeeks = [];
    	
    	for (i = 0; i < timelineDataDays.length; i++) {
    		dateCurrent = new Date(timelineDataDays[i].year, timelineDataDays[i].month - 1, timelineDataDays[i].day);
    		if (areWeeksEqual(dateCurrent, lastDate) || i === 0) {
    			quantity = quantity + timelineDataDays[i].quantity;
    		} else {
       			obj = {};
       			obj.year = lastDate.getFullYear();
       			obj.month = lastDate.getMonth() + 1;
       			obj.day = lastDate.getDate();
       			obj.quantity = quantity;
       			timelineDataWeeks[timelineDataWeeks.length] = obj;
       			
    			quantity = timelineDataDays[i].quantity;
    		}
    		lastDate = dateCurrent;
    	}	
   
    	// add last
		obj = {};
		obj.year = lastDate.getFullYear();
		obj.month = lastDate.getMonth() + 1;
		obj.day = lastDate.getDate();
		obj.quantity = quantity;
		timelineDataWeeks[timelineDataWeeks.length] = obj;    			
    }

    function aggregateTimelineDataMonths() {
    	
    	var i = 0, dateCurrent = null, lastDate = null, quantity = 0, obj = null;

    	timelineDataMonths = [];
    	
    	for (i = 0; i < timelineDataDays.length; i++) {
    		dateCurrent = new Date(timelineDataDays[i].year, timelineDataDays[i].month - 1, timelineDataDays[i].day);
    		if (areMonthsEqual(dateCurrent, lastDate) || i === 0) {
    			quantity = quantity + timelineDataDays[i].quantity;
    		} else {
       			obj = {};
       			obj.year = lastDate.getFullYear();
       			obj.month = lastDate.getMonth() + 1;
       			obj.day = lastDate.getDate();
       			obj.quantity = quantity;
       			timelineDataMonths[timelineDataMonths.length] = obj;
       			
    			quantity = timelineDataDays[i].quantity;
    		}
    		lastDate = dateCurrent;
    	}	
   
    	// add last
		obj = {};
		obj.year = lastDate.getFullYear();
		obj.month = lastDate.getMonth() + 1;
		obj.day = lastDate.getDate();
		obj.quantity = quantity;
		timelineDataMonths[timelineDataMonths.length] = obj;    			
    }
    
    function areDatesEqual(date1, date2) {
    	return !(date1 > date2 || date2 > date1);
    }

    function areWeeksEqual(date1, date2) {
    	
    	if (date1 === null || date2 === null)
    		return false;

    	if (date1 === null && date2 === null)
    		return true;

    	if (date1.getWeek() === date2.getWeek() && date1.getWeekYear() === date2.getWeekYear())
    		return true;
    	else
    		return false;
    }

    function areMonthsEqual(date1, date2) {
    	
    	if (date1 === null || date2 === null)
    		return false;

    	if (date1 === null && date2 === null)
    		return true;

    	if (date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear())
    		return true;
    	else
    		return false;
    }
    
    function getTimelineColumnsHours() {
    	
    	var data = [[]];
    	var timeColumn = [];
    	var dataColumn = [];
    	timeColumn[0] = "x";
    	dataColumn[0] = "Verbrauch";
    	
    	for (var i = 0; i < timelineDataHours.length; i++) {
    		timeColumn[timeColumn.length] = new Date(timelineDataHours[i].year, timelineDataHours[i].month - 1, timelineDataHours[i].day, timelineDataHours[i].hour);
    		dataColumn[dataColumn.length] = timelineDataHours[i].quantity;
    	}	
   
    	data[0] = timeColumn;
    	data[1] = dataColumn;
    	
    	return data;
    }

    function getTimelineColumns(type) {
    	
    	var data = [[]];
    	var timeColumn = [];
    	var dataColumn = [];
    	timeColumn[0] = "x";
    	dataColumn[0] = "Verbrauch";
    	var i = 0;
    	var timelineArr = [];
    	
    	if (type === "DAY") {
    		timelineArr = timelineDataDays;
    	} else if (type === "WEEK") {
    		timelineArr = timelineDataWeeks;
    	} else if (type === "MONTH") {
    		timelineArr = timelineDataMonths;
    	}
    	
    	for (i = 0; i < timelineArr.length; i++) {
    		timeColumn[timeColumn.length] = new Date(timelineArr[i].year, timelineArr[i].month - 1, timelineArr[i].day);;
    		dataColumn[dataColumn.length] = timelineArr[i].quantity;
    	}	
   
    	data[0] = timeColumn;
    	data[1] = dataColumn;
    	
    	return data;
    }
    
    function fillUpData(timeData, i, dataColumn, timeColumn) {
    	
    	if (i === timeData.length - 1)
    		return; // last element
    	
    	var n = 0;
    	var date1 = new Date(timeData[i].year, timeData[i].month - 1, timeData[i].day, timeData[i].hour);
    	var date2 = new Date(timeData[i + 1].year, timeData[i + 1].month - 1, timeData[i + 1].day, timeData[i + 1].hour);
    	var hours = Math.abs(date1 - date2) / 36e5;
    	var dateNew = null, rowData = [];
    	
    	if (hours > 1) {
    		for (n = 1; n < hours; n++) {
       			dateNew = date1.setTime(date1.getTime() + (60*60*1000));
        		timeColumn[timeColumn.length] = new Date(dateNew);    			
    			dataColumn[dataColumn.length] = 0;
    		}
    	}
    	
    }
    
    function setTimelineChartType(type) {
    	
    	$scope.timelineChartType = type;

        $scope.tlBtnHourActive = false;
        $scope.tlBtnDayActive = false;
        $scope.tlBtnWeekActive = false;
        $scope.tlBtnMonthActive = false;
    	
    	if (type === "HOUR") {
    		$scope.tlBtnHourActive = true;
    	} else if (type === "DAY") {
    		$scope.tlBtnDayActive = true;
    	} else if (type === "WEEK") {
    		$scope.tlBtnWeekActive = true;
    	} else if (type === "MONTH") {
    		$scope.tlBtnMonthActive = true;
    	}
    }
 
    $scope.drawMetricsChart = function(type) {
    	
    	metricsChartType = type;
    	
    	var data = getBarColumns(type);
    	
    	if (type === "PRODUCT") {
    		$scope.metricsProductActive = true;
    	} else {
    		$scope.metricsProductActive = false;
    	}
    	
    	if (initChartDone) {
    		productChart.load({
    			  columns: [data[1]],
    			  categories: data[0]
    		});
    		// load again to update y width the right way (workaround)
    		/*
    		productChart.load({
  			  columns: [data[1]],
  			  categories: data[0]
    		});
    		*/
    	} else {
	    	productChart = c3.generate({
	    		bindto: '#metricsChart',
	    		padding: {
	    			left: 90
	    		},
	    	    data: {
	    	        columns: [
	    	            data[1]
	    	        ],
	    	        type: 'bar',
	    	        labels: {
	    	            format: function (value) {
	    	            	return Math.round(value/totalQuantity * 1000)/10 + " %";
	    	            }
	    	        }
	    	    },
	    	    legend: {
	    	    	  show: false
	    	    	},
	    	    axis: {
	    	        x: {
	    	            type: 'category',
	    	            categories: data[0]
	    	        },
	    	        
	    	        rotated: true,
	    	        
	    	        y: {
	    	            show: false
	    	        }
	    	    },
	    	    color: {
	    	    	  pattern: ['#058dc7']
	    	    	},
	    	    bar: {
	    	        width: 15
	    	    },
	    	    tooltip: {
	    	        format: {
	    	            value: function (value) {
	    	                return value + " (" + Math.round(value/totalQuantity * 1000)/10 + " %)";
	    	            }
	    	        }
	    	    }
	    	});
    	}	
    }
    
    function getBarColumns(type) {
    	
    	var data = [[]];
    	var categoryColumn = [];
    	var dataColumn = [];
    	dataColumn[0] = "Verbrauch";
    	var dataArr = [];
    	var i = 0;

    	if (type === "PRODUCT") {
    		dataArr = statistic.productData;
    	} else {
    		dataArr = statistic.machineData;
    	}
    	
    	// sort
    	dataArr.sort(function(a, b) {
    	    if (a.name < b.name )
    	        return -1;
    	    if ( a.name > b.name )
    	        return 1;
    	    return 0;
    	});    	
    	
    	for (i = 0; i < dataArr.length; i++) {
        	if (type === "PRODUCT") {
        		categoryColumn[categoryColumn.length] = dataArr[i].name;
        	} else {
        		categoryColumn[categoryColumn.length] = "Schaerer " + getMachineTypeFromId(dataArr[i].name) + " " + dataArr[i].name;
        	}
    		dataColumn[dataColumn.length] = dataArr[i].quantity;
    	}
    	
    	data[0] = categoryColumn;
    	data[1] = dataColumn;
    	
    	return data;
    }

    function getMachineTypeFromId(id) {
    	
    	console.log(id);
    	console.log($scope.clients);
    	var type = "", i = 0;
    	
    	for (i = 0; i < $scope.clients.length; i++) {
    		if ($scope.clients[i].client === id) {
    			return $scope.clients[i].type;
    		}
    	}
    	
    	return type;
    }
    
    function setTotalQuantity() {
    	
    	var total = 0, i = 0;

    	for (i = 0; i < statistic.productData.length; i++) {
    		total = total + statistic.productData[i].quantity;
    	}
    	
    	totalQuantity = total;
    }
    
    function connectMQ() {
    	
    	$scope.error = "";
    	$scope.info = "Connecting...";
    	
    	// Create a client instance
    	clientMQ = new Paho.MQTT.Client($location.host(), 8000, "browser"); //Date.now()

    	// set callback handlers
    	clientMQ.onConnectionLost = onConnectionLost;
    	clientMQ.onConnectFailure = onConnectFailure;
    	clientMQ.onMessageArrived = onMessageArrived;

    	// connect the client
    	clientMQ.connect({mqttVersion: 3, userName: 'admin', password: 'admin', timeout: 15, 
    						onSuccess: onConnect, onFailure: onConnectFailure});    	
    }
    
	// called when the client connects
	function onConnect() {
		
		var subscribeOptions = {};
		
		// Create dummy event to update scope
        $timeout(function() {
        	$scope.connectedToMQ = true;
        }, 0); // wait...		
		
		// Once a connection has been made, make a subscription and send
		// a message.
		console.log("onConnect");
		$scope.info = "Connected.";
		
		// subscribe to mycoffee
		subscribeOptions.onSuccess = onSubscribeSuccess;
		subscribeOptions.onFailure = onSubscribeFailure;
		clientMQ.subscribe("myCoffee/#", subscribeOptions);
		
	}

	function onSubscribeSuccess(responseObject) {
		$scope.subscribed = true;
		console.log("onSubscribeSuccess: " + responseObject.grantedQos);
		// Create dummy event to update scope
        $timeout(function() {
        	$scope.info = "Connected. Subscribed to 'myCoffee/#'.";
        }, 0); // wait...		
	}
	
	function onSubscribeFailure(responseObject) {
		$scope.subscribed = false;
		console.log("onSubscribeFailure");
		if (responseObject.errorCode !== 0) {
			$scope.error = "onSubscribeFailure:" + responseObject.errorMessage;
		}
	}
	
	function onConnectFailure(responseObject) {
		$scope.connectedToMQ = false;
		console.log("onConnectFailure:");
		if (responseObject.errorCode !== 0) {
			$scope.error = "onConnectFailure:" + responseObject.errorMessage;
		}
	}

	// called when the client loses its connection
	function onConnectionLost(responseObject) {
		$scope.connectedToMQ = false;
		$scope.clientSelected = null;
		$scope.productSelected = null;
		console.log("onConnectionLost:");
		if (responseObject.errorCode !== 0) {
			$scope.error = "onConnectionLost:" + responseObject.errorMessage;
		}
	}

	// called when a message arrives
	function onMessageArrived(message) {
		console.log("onMessageArrived:" + message.payloadString);
		// do not update statistic on banner messages
		if (message.payloadString.indexOf("images") === -1) {
	        $timeout(function() {
				$scope.getStatistic();
				flashUpdate();
	        }, 700); // wait for server processing
		}	
	}

	function flashUpdate() {
		$scope.update = true;
        $timeout(function() {
        	$scope.update = false;
        }, 700); // wait...		
	}
    
    init();
    
});
    

//This script is released to the public domain and may be used, modified and
//distributed without restrictions. Attribution not necessary but appreciated.
//Source: http://weeknumber.net/how-to/javascript 

//Returns the ISO week of the date.
Date.prototype.getWeek = function() {
	var date = new Date(this.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
	                     - 3 + (week1.getDay() + 6) % 7) / 7);
}

//Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function() {
	var date = new Date(this.getTime());
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	return date.getFullYear();
}
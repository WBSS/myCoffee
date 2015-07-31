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
var sim = angular.module('Simulator', ["ngAnimate"]);

//controller business logic
sim.controller('SimulatorController', function AppCtrl($scope, $http, $location, $timeout) {

	var clientMQ = null;

	var context = "";
	if ($location.absUrl().indexOf("/mycoffee/") > -1) {
		context = "/mycoffee";
	}

	$scope.products = [{name: 'Cappuccino', quantity: 0},
	                   {name: 'Coffee', quantity: 0},
	                   {name: 'Espresso', quantity: 0},
	                   {name: 'Latte', quantity: 0},
	                   {name: 'Macciato', quantity: 0},
	                   {name: 'Milk', quantity: 0},
	                   {name: 'Milkfoam', quantity: 0}];
	$scope.productSelected = null;
    $scope.clients = [];
    $scope.clientSelected = null;
    $scope.connectedToMQ = false;
    $scope.isPreparing = false;
    $scope.error = "";
    $scope.info = "Disconnected.";
    $scope.bannerUrl = "";
    $scope.bannerUrlPreload = "";
    $scope.hasBanner = false;

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

                getEvaDts();
            }).
            error(function (data, status) {
                if (status === 404) {
                    $scope.error = 'No clients';
                } else {
                    $scope.error = 'Error: ' + status;
                }
            });
    };
   
    function getProductsMaxQuantity() {
        $http({
            method: 'GET',
            url: context + '/api/products/maxQuantity/clients/' + $scope.clientSelected.client
        }).
            success(function (data) {
                // attach this data to the scope
                setProductsMaxQuantity(data);

                // clear the error messages
                $scope.error = '';

            }).
            error(function (data, status) {
                if (status === 404) {
                    $scope.error = 'No products';
                } else {
                    $scope.error = 'Error: ' + status;
                }
            });
    };

    function getEvaDts() {
        $http({
            method: 'GET',
            url: context + '/resources/data/evaDtsPrime.txt'
        }).
            success(function (data) {
            	// attach this data to the scope
                $scope.evaDts = data;

                // clear the error messages
                $scope.error = '';

            }).
            error(function (data, status) {
                if (status === 404) {
                    $scope.error = 'No evaDts file';
                } else {
                    $scope.error = 'Error: ' + status;
                }
            });
    };
    
    function setProductsMaxQuantity(products) {
    	var i = 0, product = null;
    	
    	for (i = 0; i < $scope.products.length; i++) {
    		product = findProductInArray($scope.products[i].name, products);
    		if (product !== null) {
    			$scope.products[i].quantity = product.quantity;
    		} else {
    			$scope.products[i].quantity = 0;
    		}	
    	}
    }
    
    function findProductInArray(productName, productArr) {
    	for (var i = 0; i < productArr.length; i++) {
    		if (productArr[i].name === productName)
    			return productArr[i];
    	}
    	
    	return null;
    }
    
    $scope.connectMQ = function() {
    	
    	$scope.error = "";
    	$scope.info = "Connecting...";
  	
    	// Create a client instance
    	clientMQ = new Paho.MQTT.Client($location.host(), 8000, $scope.clientSelected.client);

    	// set callback handlers
    	clientMQ.onConnectionLost = onConnectionLost;
    	clientMQ.onConnectFailure = onConnectFailure;
    	clientMQ.onMessageArrived = onMessageArrived;
    	clientMQ.onMessageDelivered = onMessageDelivered;

    	// connect the client
    	clientMQ.connect({mqttVersion: 3, userName: 'admin', password: 'admin', timeout: 15, 
    						onSuccess: onConnect, onFailure: onConnectFailure, useSSL: false});    	
    }
    
    $scope.disconnectMQ = function() {
    	clientMQ.disconnect();
    	$scope.error = "";
    	$scope.info = "Disconnected.";
    }

    $scope.prepareProduct = function() {
    	
    	$scope.isPreparing = true;
    	
        $timeout(function() {
        	
        	var message = "";
        	$scope.isPreparing = false;
        	$scope.productSelected.quantity = $scope.productSelected.quantity + 1;
        	
        	message = composeEvaDtsMessage();
        	
        	// Send message
        	var destinationName = "myCoffee/" + $scope.clientSelected.client;
        	sendMessage(destinationName, message);
        	
        }, 2000); // wait...    	
    	
    }
    
    function composeEvaDtsMessage() {
    	
    	var arr = $scope.evaDts.split("\n");
    	var i = 0, line = "", message = "", productInfosAdded = false;
    	
    	for (i = 0; i < arr.length; i++) {
    		
    		line = arr[i];
    		
    		if (line.indexOf("ID1") === 0) {
    			message += "\n";
    			message += "ID1*" + $scope.clientSelected.client + "*" + $scope.clientSelected.type + "*1.92*Luzern*CT1S_2M_2P";
    			
    		} else if (line.indexOf("PA1") === 0 || line.indexOf("PA4") === 0) {
    			if (!productInfosAdded) {
    				message += getProductInfos();
    				productInfosAdded = true;
    			}
    	
    		} else if (line.indexOf("EA3") === 0) {
    			message += "\n";
    			message += "EA3*14*" + getFormattedDateTime() + "**20131009*171030***37*2";
    			
    		} else {
    			if (message !== "")
    				message += "\n";
    			
    			message += line;
    		}
    	}
    	
    	return message;
    }
    
    function getFormattedDateTime() {
    	
    	var dateTimeStr = "";
    	var now = new Date();
    	
    	dateTimeStr += String(now.getFullYear()) + adjustTwoDigits(String(now.getMonth() + 1)) + adjustTwoDigits(String(now.getDate()));
    	dateTimeStr += "*";
    	dateTimeStr += adjustTwoDigits(String(now.getHours())) + adjustTwoDigits(String(now.getMinutes())) + adjustTwoDigits(String(now.getSeconds()));
    
    	return dateTimeStr;
    }
    
    function adjustTwoDigits(numberStr) {
    	if (numberStr.length === 1)
    		return "0" + numberStr;
    	else
    		return numberStr;
    }
    
    function getProductInfos() {
    	
    	var productsInfos = "", i = 0;
    	
    	for (i = 0; i < $scope.products.length; i++) {
    		productsInfos += "\n";
    		productsInfos += "PA1*3**" + $scope.products[i].name;
    		productsInfos += "\n";
    		productsInfos += "PA4*2*0*" + $scope.products[i].quantity + "*0";
    	}
    	
    	return productsInfos;
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
		clientMQ.subscribe("myCoffee/" + $scope.clientSelected.client + "/banner/", subscribeOptions);
		
		// TODO
		getProductsMaxQuantity();
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
		$scope.info = "Message arrived: " + message.payloadString;
		$timeout(function() {
			$scope.hasBanner = false;
			$scope.bannerUrlPreload = message.payloadString;
		}, 0); // wait...	
		$timeout(function() {
    		$scope.bannerUrl = message.payloadString;
    		$scope.hasBanner = true;
        }, 700); // wait...		
	}

	// called when a message arrives
	function onMessageDelivered(message) {
		console.log("onMessageDelivered: " + message.destinationName);
		
		// Create dummy event to update scope
        $timeout(function() {
    		$scope.info = "Message delivered: " + message.destinationName + " | qos: " + message.qos;
        }, 0); // wait...
	}
		
	function onSubscribeSuccess(responseObject) {
		$scope.subscribed = true;
		console.log("onSubscribeSuccess: " + responseObject.grantedQos);
		// Create dummy event to update scope
        $timeout(function() {
        	$scope.info = "Connected. Subscribed to 'myCoffee/" + $scope.clientSelected.client + "/banner/'";
        }, 0); // wait...		
	}
	
	function onSubscribeFailure(responseObject) {
		$scope.subscribed = false;
		console.log("onSubscribeFailure");
		if (responseObject.errorCode !== 0) {
			$scope.error = "onSubscribeFailure:" + responseObject.errorMessage;
		}
	}
	
	function sendMessage(destinationName, message) {

		var message = new Paho.MQTT.Message(message);
		message.qos = 2;
		message.destinationName = destinationName;
		clientMQ.send(message);
	}   
	
    getClients();

});
    
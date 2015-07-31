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
var sim = angular.module('Publisher', []);

//controller business logic
sim.controller('PublisherController', function AppCtrl($scope, $http, $location, $timeout) {

	var clientMQ = null;

	var context = "";
	if ($location.absUrl().indexOf("/mycoffee/") > -1) {
		context = "/mycoffee";
	}

	$scope.banners = [{name: 'Online-Shop', url: 'images/banner_1.png'},
	                  {name: 'Finanzierung KMU', url: 'images/banner_2.png'}];
	$scope.bannerSelected = null;
    $scope.clients = [];
    $scope.clientSelected = null;
    $scope.connectedToMQ = false;
    $scope.isPreparing = false;
    $scope.error = "";
    $scope.info = "Disconnected.";

    function getClients() {
        $http({
            method: 'GET',
            url: context + '/api/clients'
        }).
            success(function (data) {
            	// attach this data to the scope
                $scope.clients = data;
                $scope.clientSelected = $scope.clients[0];
                $scope.bannerSelected = $scope.banners[0];
                
                $scope.connectMQ();
                
                // clear the error messages
                $scope.error = '';

            }).
            error(function (data, status) {
                if (status === 404) {
                    $scope.error = 'No clients';
                } else {
                    $scope.error = 'Error: ' + status;
                }
            });
    };
    
    $scope.connectMQ = function() {
    	
    	$scope.error = "";
    	$scope.info = "Connecting...";
  	
    	// Create a client instance
    	clientMQ = new Paho.MQTT.Client($location.host(), 8000, "publisher");

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

    $scope.publish = function() {
    	// Send message
    	var destinationName = "myCoffee/" + $scope.clientSelected.client + "/banner/";
    	sendMessage(destinationName, $scope.bannerSelected.url);
    }
    
	// called when the client connects
	function onConnect() {
		
		// Create dummy event to update scope
        $timeout(function() {
        	$scope.connectedToMQ = true;
        }, 0); // wait...		
		
		// Once a connection has been made, make a subscription and send
		// a message.
		console.log("onConnect");
		$scope.info = "Connected.";
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
	}

	// called when a message arrives
	function onMessageDelivered(message) {
		console.log("onMessageDelivered: " + message.destinationName);
		
		// Create dummy event to update scope
        $timeout(function() {
    		$scope.info = "Message delivered: " + message.destinationName + " | payload: " + message.payloadString + " | qos: " + message.qos;
        }, 0); // wait...		
	}
						
	function sendMessage(destinationName, message) {

		var message = new Paho.MQTT.Message(message);
		message.qos = 2;
		message.destinationName = destinationName;
		clientMQ.send(message);
	}   
	
    getClients();

});
    
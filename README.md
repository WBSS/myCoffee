## Introduction

This is the Web Application project of the [myCoffee IoT Framework](http://www.wbss.ch/mycoffee/de/index.html).

The other components of the myCoffee IoT Framework are:
* [myCoffee HiveMQ Plugin](https://github.com/WBSS/myCoffeeHiveMQPlugin)
* [myCoffee Storm Application](https://github.com/WBSS/myCoffeeStorm)

The web application consists of three parts:
* Simulator [(Live Preview)](http://sandbox.itweet.ch:8080/mycoffee/simulator)
* Dashboard [(Live Preview)](http://sandbox.itweet.ch:8080/mycoffee/dashboard)
* Publisher [(Live Preview)](http://sandbox.itweet.ch:8080/mycoffee/publisher)

## Prerequisites

* MySQL 5.5 with `mycoffee` database
* HiveMQ with running [myCoffeeHiveMQPlugin](https://github.com/WBSS/myCoffeeHiveMQPlugin)
* [myCoffee Storm Application](https://github.com/WBSS/myCoffeeStorm) with running KairosDB

## Installation

#### MySQL Database
* Create database `mycoffee`
* Restore dump from `/db/MySQL-myCoffee-dump.sql`
* Create user with name/password: `mycoffee`/`mycoffee`

#### War File
* Edit MySQL-DB settings in `/src/main/resources/config/app_dev.properties`
* Build war file: `mvn package`
* Deploy `mycoffee.war` to Web Container of your choice (tested with Tomcat and Resin)

## Run

Make sure you start the myCoffee components in the following order:

1. MySQL DB
2. KairosDB
3. HiveMQ Broker
4. Storm Application
5. Web Container
 
Web pages: 
* [http://localhost:8080/mycoffee/simulator](http://localhost:8080/mycoffee/simulator)
* [http://localhost:8080/mycoffee/dashboard](http://localhost:8080/mycoffee/dashboard)
* [http://localhost:8080/mycoffee/publisher](http://localhost:8080/mycoffee/publisher)


# Introduction

This is the web application of the [myCoffee IoT Framework](http://www.wbss.ch/mycoffee/de/index.html).

The other components of the myCoffee IoT Framework are:
* [myCoffeeHiveMQPlugin](https://github.com/WBSS/myCoffeeHiveMQPlugin)
* [myCoffeeStorm](https://github.com/WBSS/myCoffeeStorm)

The web application consists of three parts:
* Simulator [(Live Preview)](http://sandbox.itweet.ch:8080/mycoffee/simulator)
* Dashboard [(Live Preview)](http://sandbox.itweet.ch:8080/mycoffee/dashboard)
* Publisher [(Live Preview)](http://sandbox.itweet.ch:8080/mycoffee/publisher)

# Prerequisites

* HiveMQ with running myCoffeeHiveMQPlugin
* myCoffeeStorm with running KairosDB
* MySQL 5.5

# Installation

## MySQL database
* Create database `mycoffee`
* Restore dump from `/db/MySQL-myCoffee-dump.sql`
* Create user with name/password: `mycoffee`/`mycoffee`

## War file
* Edit DB settings in `/src/main/resources/config/app_dev.properties`
* Build war file: `mvn package`
* Deploy `mycoffee.war` to Web Container of your choice (tested with Tomcat and Resin)

# Starting

Make sure MySQL-DB, HiveMQ-Broker and KairosDB are running.
* http://localhost:8080/mycoffee/simulator
* http://localhost:8080/mycoffee/dashboard
* http://localhost:8080/mycoffee/publisher


## Introduction

This is the front end of the [myCoffee IoT framework](http://www.wbss.ch/mycoffee/de/index.html).

The other components of the myCoffee IoT framework are:
* [myCoffee HiveMQ Plugin](https://github.com/WBSS/myCoffeeHiveMQPlugin)
* [myCoffee Storm Application](https://github.com/WBSS/myCoffeeStorm)

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

* Dashboard: [Data front end](http://localhost:8080/mycoffee/dashboard)
* Coffee maschine simulator: [IoT device](http://localhost:8080/mycoffee/simulator)
* Banner publisher: [Publisher front end](http://localhost:8080/mycoffee/publisher)

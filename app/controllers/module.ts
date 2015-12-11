///<reference path="../../typings/tsd.d.ts" />
import services = require('../services/module');
import HeatMapController = require('./HeatMap/HeatMapController');
import MapController = require('./Map/MapController');
import RegisterAMSController = require("./RegisterAMS/RegisterAMSController");
import MyProfileController = require("./MyProfile/MyProfileController");
import MyStationsController = require("./MyStations/MyStationsController");
import MapPageController = require("./PageControllers/MapPageController");
import ComparePageController = require("./PageControllers/ComparePageController");
import NVD3Controller = require("./NVD3/NVD3Controller");
import AQIController = require("./AQI/AQIController");
import HeaderController = require("./Index/HeaderController");
import AppController = require("./Index/AppController");


export = angular.module('controllers',
    [   "services"
    ])
            .controller(HeatMapController.name, HeatMapController)
            .controller(MapController.name, MapController)
            .controller(RegisterAMSController.name, RegisterAMSController)
            .controller(MyProfileController.name, MyProfileController)
            .controller(MyStationsController.name, MyStationsController)
            .controller(MapPageController.name, MapPageController)
            .controller(ComparePageController.name, ComparePageController)
            .controller(NVD3Controller.name, NVD3Controller)
            .controller(AQIController.name, AQIController)
            .controller(HeaderController.name, HeaderController)
            .controller(AppController.name, AppController);

/// <reference path="../../../typings/tsd.d.ts" />

import MapFactory = require("../../services/Map/MapFactory");
export = MapViewController;

class MapViewController {
    private clusterSearch;
    private deregisterStateWatcher;

    public detailsVisible:boolean;

    public selectedStation;
    // TODO: bring this back at some point...
    //public loadingStationData;

    public controls;
    public center;
    public defaults;
    public markers;
    public bounds;
    public events;
    public tiles;
    public layers;
    public detailsMode;

    public static $inject = [
        '$state',
        '$rootScope',
        '$scope',
        '$stateParams',
        'leafletData',
        'leafletBoundsHelpers',
        'leafletMarkerEvents',
        '$log',
        'locationService',
        'APIService',
        '$timeout',
        'mapFactory',
        'selectionService',
        'SearchService'
    ];

    constructor(private $state,
                private $rootScope,
                private $scope,
                private $stateParams,
                private leafletData,
                private leafletBoundsHelpers,
                private leafletMarkerEvents,
                private $log,
                private locationService,
                private APIService,
                private $timeout,
                private mapFactory,
                private selectionService,
                private SearchService) {
        let mv = this;

        mv.detailsMode = 'station';

        mv.detailsVisible = true;

        mv.$scope.siteSearchVisible = true;
        mv.$scope.plotVisible = false;

        mv.selectedStation = {location: {}, last: {}};

        mv.markers = mv.getMapMarkers();
        mv.defaults = mapFactory.getDefaults();
        mv.center = mapFactory.getCenter();

        // things to watch with scope watch
        if ($stateParams.mode === undefined) {
            $scope.mode = 'light';
        } else {
            $scope.mode = $stateParams.mode;
        }

        angular.extend($scope, {
            toggleSiteSearch: (show)=>{
                if(show !== undefined){
                    mv.$scope.siteSearchVisible = !!show;
                    return;
                }
                mv.$scope.siteSearchVisible = !mv.$scope.siteSearchVisible;
            },
            centerOnLocation: ()=> {
                mv.mapFactory.getCenterNoAutoDiscover(mv.center.zoom).then((response)=> {
                    mv.center = response;
                });
            },
            togglePlot: ()=>{
                //if (!mv.selectedStation || !mv.selectedStation.id) {
                //    return;
                //}
                //mv.$scope.plotVisible = !mv.$scope.plotVisible;
                //if (mv.$scope.plotVisible) {
                //    mv.generatePlot();
                //}
                mv.$scope.plotVisible = true;
                mv.generatePlot();
            },
            centerOnMarker: (marker)=>{
                if(marker){
                    mv.center = mv.mapFactory.getCenterFromMarker(marker, mv.center.zoom);
                    return;
                }
                if (mv.selectedStation && mv.selectedStation.id) {
                    mv.center = mv.mapFactory.getCenterFromMarker(mv.selectedStation, mv.center.zoom);
                }
            },
            downloadPlotData: ()=>{
                /*if (!mv.selectedStation || !mv.selectedStation.id) {
                    return;
                }*/

                let stationsGroup = mv.selectionService.getCurrentStationSelectionIds();
                let paramsGroup = mv.selectionService.getCurrentPollutantSelection();
                let dates = mv.selectionService.getDateRange();

                if (stationsGroup.length != 0) {
                    mv.mapFactory.downloadDataFromStation(stationsGroup, paramsGroup, dates);
                } /*else if (!mv.selectedStation || !mv.selectedStation.id) {
                    return;
                } else {
                    this.mapFactory.downloadDataFromStation(mv.selectedStation.id, paramsGroup);
                }*/
            },
            toggleCluster: (cluster)=>{
                if (cluster.id && mv.layers.overlays[cluster.id]) {
                    mv.layers.overlays[cluster.id].visible = !mv.layers.overlays[cluster.id].visible;
                }
            },
            hideAllClusters: ()=>{
                angular.forEach(mv.layers.overlays, function (cluster:any) {
                    cluster.visible = false;
                });
            },
            showAllClusters: ()=>{
                angular.forEach(mv.layers.overlays, function (cluster:any) {
                    cluster.visible = true;
                });
            },
            showUserClusters: ()=>{
                mv.layers.overlays['USER'].visible = true;
                mv.layers.overlays['USER'].doRefresh = true;
            },
            hideUserClusters: ()=>{
                mv.layers.overlays['USER'].visible = false;
                mv.layers.overlays['USER'].doRefresh = true;
            },
            toggleDetails: ()=>{
                mv.detailsVisible = !mv.detailsVisible;
            },
            setMapMode: (mode)=>{
                mv.tiles = mv.mapFactory.createTilesFromKey(mode);
            },
            resetZoom: (level?)=>{
                if(level){
                    mv.center.zoom = level;
                    return;
                }
                mv.center.zoom =5;
            },
            setSelectedStation: (station)=>{
                mv.selectedStation = station;
                mv.populateDetails(station);
            },
            markers: mv.markers,
            layers: mv.layers
        });

        mv.tiles = mapFactory.createTilesFromKey($scope.mode);
        mv.layers = mapFactory.createMapLayers();
        mv.events = mv.createMapEvents();
        mv.clusterSearch = $state.params['cluster'];

        $scope.$on('leafletDirectiveMarker.map.click', mv.onMarkerClick());
        $scope.$on('leafletDirectiveMap.map.moveend', mv.onMapMove());
        this.showStationsByCluster($stateParams['cluster']);
    }

    private registerStateWatcher($rootScope) {
        var self = this;
        $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams)=> {
            // TODO: for now I'm only doing tiles, in the future we may need to add additional checks here
            if (toState.name == fromState.name && toParams == fromParams) {
                return;
            }
            if (toState.name == 'app.map') {
                self.tiles = self.mapFactory.createTilesFromKey(toParams.mode);
                if (toParams.cluster) {
                    self.showStationsByCluster(toParams['cluster']);
                }
            } else {
                self.deregisterStateWatcher();
            }
        });
    }

    private showStationsByCluster(cluster) {
        let self = this;
        if (cluster === undefined) {
            return;
        }
        if (!cluster) {
            this.$scope.showAllClusters();
            return;
        }
        this.$scope.hideAllClusters();
        if (Array.isArray(cluster)) {
            angular.forEach(cluster, function (id) {
                if (self.layers.overlays[id] === undefined) {
                } else {
                    self.layers.overlays[id].visible = true;
                }
            });
        } else {
            this.layers.overlays[cluster].visible = true;
        }
    }

    private createMapEvents() {
        return {
            map: {
                enable: ['moveend'],
                logic: 'emit'
            },
            markers: {
                enable: this.leafletMarkerEvents.getAvailableEvents()
            }
        };
    }

    private onMapMove() {
        // This updates $scope.bounds because leaflet bounds are not updating automatically
        let self = this;
        self.$scope.$on('leafletDirectiveMap.map.moveend', function () {
            self.leafletData.getMap().then(
                function (map) {
                    self.bounds = map.getBounds();
                }
            );
        });
    }

    private onMarkerClick() {
        let self = this;
        self.$scope.$on('leafletDirectiveMarker.map.click', function (event, args) {

            // TODO: there is a reason why this is commented out for now
            //if (self.selectedStation && self.selectedStation.id && args.model.id == self.selectedStation.id) {
            //    self.toggleDetails(false);
            //    self.selectedStation = undefined;
            //    return;
            //}

            self.selectedStation = args.model;
            self.populateDetails(self.selectedStation);
        });
    }

    private populateDetails(station){
        var self = this;
        self.selectionService.setCurrentStation(station);
        self.mapFactory.getLastDataPointFromStation(station.id).then(
            function (response) {
                self.selectedStation.last = response.lastDataPoint;
                self.selectedStation.lastUpdated = response.lastUpdated;

                self.detailsVisible = true;
                if (self.$scope.plotVisible) {
                    self.$scope.plotVisible = false;
                }
            },
            function (response) {
                // error
            }
        );
    }

    private getMapMarkers() {
        let self = this;
        self.mapFactory.getMapMarkers().then(
            function (response) {
                if (self.markers == undefined) {
                    self.markers = response;
                } else {
                    self.markers = self.markers.concat(response);
                }
            },
            function (response) {
                self.$log.debug('Unable to get markers. Response:' + response);
                self.markers = [];
            }
        );
    }

    public generatePlot() {
        let stationsGroup = this.selectionService.getCurrentStationSelectionIds();
        let paramsGroup = this.selectionService.getCurrentPollutantSelection();
        let dateRange = this.selectionService.getDateRange();

        //if (stationsGroup.length != 0 && paramsGroup.length != 0) {
        //    this.unsetChartData();
        //    this.getDataForPlot(stationsGroup, paramsGroup, dateRange);
        //}
        this.unsetChartData();
        this.getDataForPlot(stationsGroup, paramsGroup, dateRange);
    }

    private getDataForPlot(ids, params, dates) {
        let self = this;
        self.mapFactory.getDataFromStation(ids, params, dates).then(
            function (response) {
                self.$scope.chartOptions = response.chartOptions;
                self.$scope.chartData = response.chartData;
            },
            function (response) {
                self.$log.debug('Unable to get chart data. Response' + response);
            }
        );
    }

    private hideChart() {
        this.$scope.plotVisible = false;
    }

    private unsetChartData() {
        //this.$scope.plotVisible = false;
        this.$scope.chartOptions = undefined;
        this.$scope.chartData = undefined;
    }
}

/// <reference path="../../../typings/tsd.d.ts" />

export = MapToolboxController;

class MapToolboxController {
    public stationQuery;
    public stationQueryResults;

    public availableParameters;
    public selectedParameters;

    public searchOptions;

    public expanded;
    public showDetails;
    public clusters;
    public currentStation;
    public stationGroup;
    public stationGroupMap;
    public sortOrder;
    public pollutantOptions;
    public pollutantOptionsMap;
    public weatherOptions;

    public static $inject = ['$scope','$state', 'mapFactory', 'selectionService','SearchService', 'AQIColors'];
    constructor(
        private $scope,
        private $state,
        private mapFactory,
        private selectionService,
        private SearchService,
        private AQIColors
    ) {

        this.searchOptions = {updateOn: 'default blur', debounce: {'default': 250 , 'blur': 0}};
        this.stationQueryResults = [];
        this.selectedParameters = [];
        this.availableParameters = this.AQIColors.getParameterList();

        let mtc = this;
        mtc.clusters = [];
        mtc.stationGroup = [];
        mtc.convertMapLayersToArray(mapFactory.createMapLayers().overlays);
        mtc.getStationGroupFromSelectionService();
        mtc.setSortOrderForStations('name');
        mtc.initPollutantOptions();

        var deregister = $scope.$parent.$watch('selectedStation', function (val) {
            mtc.currentStation = val;
        });

        $scope.$on("$destroy",()=>{deregister();});

    }

    public searchStations() {
        if(!this.stationQuery || this.stationQuery  == ''){
            this.stationQueryResults = [];
            return;
        }

        var self = this;
        this.SearchService.searchStations(this.stationQuery).then((results)=>{
            self.stationQueryResults = _.map(results.hits,(result:any)=>{
                return result._source;
            });
        });
    }

    private getStationGroupFromSelectionService() {
        this.currentStation = this.selectionService.getCurrentStation();
        this.stationGroup = this.selectionService.getCurrentStationSelection();
        this.stationGroupMap = this.selectionService.getCurrentStationSelectionMap();
    }

    public removeMarkerFromGroup(marker) {
        this.selectionService.removeStationFromSelection(marker);
        this.selectionService.setCurrentStation(marker);
        this.$scope.setSelectedStation(marker);
    }

    public addMarkerToGroup(marker) {
        this.selectionService.addStationToSelection(marker);
        this.selectionService.setCurrentStation(marker);
        this.$scope.setSelectedStation(marker);
    }

    public isMarkerInGroup(marker) {
        return this.stationGroupMap.hasOwnProperty(marker.id);
    }

    private convertMapLayersToArray(layers) {
        let self = this;
        angular.forEach(layers, function(value, key) {
            self.clusters.push({
                id: key,
                name: value.name,
                visible: value.visible
            });
        });
    }


    public getMarkerNames() {
        return this.mapFactory.getMarkerNames();
    }


    public showAllClusters() {
        this.$scope.showAllClusters();
        angular.forEach(this.clusters, function (cluster) {
            cluster['visible'] = true;
        });
    }

    public hideAllClusters() {
        this.$scope.hideAllClusters();
        angular.forEach(this.clusters, function (cluster) {
            cluster['visible'] = false;
        });
    }

    public setSortOrderForStations(order) {
        switch (order) {
            case 'name':
                this.sortOrder = '-name';
                break;
            case 'agency':
                this.sortOrder = '-agency';
                break;
            case 'id':
                this.sortOrder = '-id';
                break;
            case 'city':
                this.sortOrder = '-city';
                break;
            case 'state':
                this.sortOrder = '-state';
                break;
            case 'postal':
                this.sortOrder = '-postal';
                break;
            default:
                this.sortOrder = '-name';
        };
    }

    public setSelectedStation(marker) {
        this.selectionService.setCurrentStation(marker);
        this.$scope.setSelectedStation(marker);
        this.$scope.resetZoom(10);
        this.$scope.centerOnMarker(marker.location);
    }

    public togglePollutantOption(pollutant) {
        pollutant.selected = !pollutant.selected;
        this.selectionService.updatePollutantSelectionWith(pollutant.kind);
    }

    private initPollutantOptions() {
        let self = this;
        self.pollutantOptionsMap = self.getPollutantOptionsMap();

        let selection = self.selectionService.getCurrentPollutantSelection();
        let options = self.getPollutantOptions();
        angular.forEach(selection, function(value) {
            let key = self.pollutantOptionsMap[value];
            options[key].selected = true;
        });
        self.pollutantOptions = options;
    }

    private getPollutantOptions() {
        return [
            {
                kind: 'PM2.5',
                name: 'Particulate Matter 2.5',
                selected: false
            },
            {
                kind: 'PM10',
                name: 'Particulate Matter 10',
                selected: false
            },
            {
                kind: 'CO',
                name: 'Carbon Monoxide',
                selected: false
            },
            {
                kind: 'CO2',
                name: 'Carbon Dioxide',
                selected: false
            },
            {
                kind: 'NO2',
                name: 'Nitrogen Dioxide',
                selected: false
            },
            {
                kind: 'OZONE',
                name: 'Ozone',
                selected: false
            },
        ];
    }

    private getPollutantOptionsMap() {
        return {
            'PM2.5': 0,
            'PM10': 1,
            'CO': 2,
            'CO2': 3,
            'NO2': 4,
            'OZONE': 5
        };
    }
}

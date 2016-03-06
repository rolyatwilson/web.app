/// <reference path="../../../typings/tsd.d.ts" />

export = MapToolboxController;

class MapToolboxController {
    public expanded;
    public showDetails;
    public clusters;
    public stationGroup;
    public stationGroupMap;
    public sortOrder;
    public count;
    public static $inject = ['$scope','$state', 'mapFactory', 'selectionService'];
    constructor(
        private $scope,
        private $state,
        private mapFactory,
        private selectionService
    ) {
        this.showDetails = false;
        this.clusters = [];
        this.stationGroup = [];
        this.convertMapLayersToArray(mapFactory.createMapLayers().overlays);
        this.getStationGroupFromSelectionService();
        this.setSortOrderForStations('name');
        this.count = 0;
    }

    private getStationGroupFromSelectionService() {
        this.stationGroup = this.selectionService.getCurrentStationSelection();
        this.stationGroupMap = this.selectionService.getCurrentStationSelectionMap();
    }

    public removeMarkerFromGroup(marker) {
        console.log('removing marker: ' + marker.id);
        this.selectionService.removeStationFromSelection(marker);
    }

    public addMarkerToGroup(marker) {
        console.log('adding marker: ' + marker.id);
        this.selectionService.addStationToSelection(marker);
    }

    public isMarkerInGroup(marker) {
        console.log('isMarkerInGroup: ' + ++this.count);
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

    public toggleDetails() {
        this.showDetails = !this.showDetails;
    }

    public togglePreviewDetails() {
        this.$scope.$parent.toggleDetails = !this.$scope.$parent.toggleDetails;
    }

    public toggleExpand() {
        this.expanded = !this.expanded;
    }

    public toggleMap(mode) {
        this.$scope.$parent.mode = mode;
    }

    public getMarkerNames() {
        return this.mapFactory.getMarkerNames();
    }

    public centerMapOnLocation() {
        this.$scope.$parent.centerOnLocation = !this.$scope.$parent.centerOnLocation;
    }

    public togglePlot() {
        this.$scope.$parent.togglePlot = !this.$scope.$parent.togglePlot;
    }

    public download() {
        this.$scope.$parent.downloadPlot = !this.$scope.$parent.downloadPlot;
    }

    public centerMapOnSelectedMarker() {
        this.$scope.$parent.centerOnMarker = !this.$scope.$parent.centerOnMarker;
    }

    public toggleCluster(cluster) {
        console.log('cluster: ' + cluster);
        this.$scope.$parent.toggleCluster = cluster.id;
    }

    public showAllClusters() {
        this.$scope.$parent.showAllClusters = !this.$scope.$parent.showAllClusters;
        angular.forEach(this.clusters, function (cluster) {
            cluster['visible'] = true;
        });
    }

    public hideAllClusters() {
        this.$scope.$parent.hideAllClusters = !this.$scope.$parent.hideAllClusters;
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
        this.$scope.$parent.ctrl.selectedStation = marker;
        this.$scope.$parent.ctrl.center.zoom = 10;
        this.centerMapOnSelectedMarker();
    }

    public zoomMapOut() {
        this.$scope.$parent.ctrl.center.zoom = 5;
    }
}

/// <reference path="../../../typings/tsd.d.ts" />
import MapDetailsController = require('./MapViewController');

export = MapDetailsDirective;

class  MapDetailsDirective implements ng.IDirective {
    public static htmlName = "mapDetails";
    
    public restrict = "E";
    public templateUrl = "app/directives/Map/mapDetailsTemplate.html";
    public controller = MapDetailsController;
    public controllerAs = "ctrl";
    public bindToController = true;
    public scope = {
        visible: '=',
        station: '='
    };
    
    public static create() {
        return new MapDetailsDirective();
    }
    constructor() {}
}
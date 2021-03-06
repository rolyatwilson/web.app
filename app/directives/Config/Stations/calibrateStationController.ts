/// <reference path="../../../../typings/tsd.d.ts" />

export = CalibrateStationController;

class CalibrateStationController {
    public alert;
    public alertTimeout;
    public station;
    public existingAdjustments;
    public newAdjustments;
    public unadjustedParameters;
    public loading;
    public static $inject = ['$scope', '$state','$stateParams','APIService', 'AQIService'];
    public constructor(
        private $scope,
        private $state,
        private $stateParams,
        private APIService,
        private AQIService
    ){
        this.alertTimeout = 2000;
        this.loading = true;
        this.newAdjustments = [];
        this.unadjustedParameters = angular.copy(this.AQIService.getParameterList());

        var self = this;
        this.APIService.getStation($stateParams.id).then((station) => {
            self.station = station;
            self.APIService.getStationAdjustments(station.id).then((adjustments) => {
                self.existingAdjustments = adjustments;
                self.loading = false;
            }, (error) => {
                self.loading = false;
                // TODO: handle error nicely
            });
        });

        $scope.configureModal('Calibrate Station '+$stateParams.id,
            "Save",
            ()=> {
                let newAdjustments = [];
                angular.forEach(self.newAdjustments, (newAdjustment) => {
                    let isDuplicate = false;
                    angular.forEach(self.existingAdjustments, (existingAdjustment) => {
                        if (newAdjustment.parameter.name == existingAdjustment.parameter.name) {
                            isDuplicate = true;
                        }
                    });
                    if (!isDuplicate) {
                        newAdjustments.push(newAdjustment);
                    }
                });
                let onSuccess = (reaponse) => {
                    let message = 'Hooray! We will start applying those calibrations on your data.';
                    this.alert = {type: 'success', message: message};
                };

                let onError = (error) => {
                    let message = 'Oh no! We were unable to save your selection. Please try again.';
                    this.alert = {type: 'error', message: message};
                };
                self.APIService.updateStationAdjustments($stateParams.id, newAdjustments.concat(self.existingAdjustments)).then(onSuccess, onError);
            },
            "Cancel",
            ()=> {
                $scope.closeModal();
            });

        //TODO Load Adjustment params here
        console.log("Calibrating station "+$stateParams.id);
    }

    public deleteFromExistingAdjustments(adjustment) {
        let index = this.existingAdjustments.indexOf(adjustment);
        this.existingAdjustments.splice(index, 1);
    }

    public deleteFromNewAdjustments(adjustment) {
        let index = this.newAdjustments.indexOf(adjustment);
        this.newAdjustments.splice(index, 1);
    }

    public addNewAdjustment() {
        let parameter = this.unadjustedParameters[0];
        this.newAdjustments.push({
            parameter: parameter,
            scaleFactor: 1.0,
            shiftFactor: 0.0
        });
    }

    public onAlertClose(alert) {
        if (alert.type == 'success') {
            this.alert = undefined;
            this.$scope.closeModal();
        } else {
            this.alert = undefined;
        }
    }
}

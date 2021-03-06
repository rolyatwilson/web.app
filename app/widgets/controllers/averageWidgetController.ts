/// <reference path="../../../typings/tsd.d.ts" />
export = AverageWidgetController;

class AverageWidgetController {
    public static name = "AverageWidgetController";
    public static $inject = ['$scope'];

    public week;
    public average;
    public loading;

    public constructor(private $scope) {
        var self = this;
        this.loading = true;
        var unregisterDailies = $scope.$watch('dailies', (val)=> {
            if(!val){
                return;
            }
            self.week = self.getDailiesInRange(val,7);
            self.calculateAverage();
            this.loading = false;
        });
        $scope.$on("$destroy", ()=> {
            unregisterDailies();
        });
    }

    public getAQICategory(){
        if(!this.average || this.average > 500){
            return 'neutral';
        }

        var avg = this.average;
        if(avg <= 50){
            return 'green';
        }else if(avg <= 100){
            return 'yellow';
        }else if(avg <= 150){
            return 'orange';
        }else if(avg <= 200){
            return 'red';
        }else if(avg <= 300){
            return 'purple';
        }else if(avg <= 500){
            return 'maroon';
        }else{
            return 'neutral';
        }

    }

    public calculateAverage(){
        var sum = _.reduce(this.week,(memo:number, daily:any)=>{
            return memo + daily.avgAQI;
        },0);
        this.average =  sum/7.0;
    }

    public getDailiesInRange(dailies, daysAgo){
        var now = new Date();
        var then = new Date().setDate(now.getDate() - daysAgo);
        var result = _.filter(dailies, (daily:any)=>{
            return new Date(daily.date).getTime() > then;
        });
        return result;
    }
}

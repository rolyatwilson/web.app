/// <reference path="../../../../typings/tsd.d.ts" />

export = GroupController;

class GroupController {
    public group;
    public static $inject = ['$state', 'APIService', 'notificationService'];
    public constructor(
        private $state,
        private APIService,
        private notificationService
    ){}

    public deleteGroup() {
        var self = this;
        this.APIService.deleteGroup(this.group).then((succeeded)=>{
            if(succeeded){
                self.group = undefined;
                self.notificationService.notify('GroupModified');
            }
        });
    }

    public editGroup() {
        this.$state.go('modal.editGroup', { id: this.group.id, name: this.group.name } );
    }
}

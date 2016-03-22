///<reference path='../../../typings/tsd.d.ts'/>

import UserProfile = require('../../models/UserProfile');
export = AboutUsController;

class AboutUsController {
    public static name = 'AboutUsController';
    public static $inject = [];

    public profiles = [];

    constructor(
    ) {
        var jaredP  = new UserProfile('Jared Potter', 'Backend ASP.NET API, Frontend Angular.JS, and 3rd party data gathering.', 'https://www.linkedin.com/in/jared-potter-34138634', 'https://github.com/JDoge', 'app/assets/images/profilePictures/jared_potter.png');
        var jaredM  = new UserProfile('Jared Moore', 'Frontend Angular.JS', 'https://www.linkedin.com/in/jared-moore-820b2975', 'GitHub: https://github.com/Jmoore1127', 'app/assets/images/profilePictures/jared_moore.png');
        var taylorW = new UserProfile('Taylor Wilson', 'Frontend Angular.JS', 'https://www.linkedin.com/in/t3ilson', 'GitHub: https://github.com/TJHooker33', 'app/assets/images/profilePictures/taylor_wilson.png');
        var zachL   = new UserProfile('Zach Lobato', 'Backend ASP.NET API, MySQL Database, and 3rd party data gathering.', 'https://www.linkedin.com/in/zachlobato', 'https://github.com/ZachLobato', 'app/assets/images/profilePictures/zach_lobato.png');

        this.profiles = [jaredP, jaredM, taylorW, zachL];
    };
};

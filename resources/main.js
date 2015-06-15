var blacktip;
(function (blacktip) {
    'use strict';
    /**
    * Configures the application
    */
    var Config = (function () {
        /**
        * Creates an instance of the config
        */
        function Config(routeProvider, stateProvider, $locationProvider) {
            // Creates nice URLs
            $locationProvider.html5Mode(true);
            // if the path doesn't match any of the urls you configured
            // 'otherwise' will take care of routing back to the index
            routeProvider.otherwise("/");
            // Create the states
            stateProvider.state("home", { url: "/", templateUrl: "templates/home.html", controller: "homeCtrl", controllerAs: "controller" });
            stateProvider.state("about", { url: "/about", templateUrl: "templates/about.html" });
            stateProvider.state("contact", { url: "/contact", templateUrl: "templates/contact.html", controller: "contactCtrl", controllerAs: "controller" });
            stateProvider.state("projects", { url: "/projects", templateUrl: "templates/projects.html" });
            // Prior to the blog state loading, make sure the categories are downloaded
            stateProvider.state("blog", {
                url: "/blog?author&category&tag&index", templateUrl: "templates/blog.html", controller: "blogCtrl", controllerAs: "controller",
                resolve: {
                    categories: ["$http", "apiURL", function ($http, apiURL) {
                            return $http.get(apiURL + "/posts/get-categories").then(function (categories) {
                                return categories.data.data;
                            });
                        }]
                }
            });
            // Download the post prior to loading this state
            // then assign the post to the scope
            stateProvider.state("post", {
                url: "/post/:slug", templateUrl: "templates/post.html",
                resolve: {
                    post: ["$http", "apiURL", "$stateParams", function ($http, apiURL, stateParams) {
                            return $http.get(apiURL + "/posts/get-post/" + stateParams.slug).then(function (posts) {
                                if (posts.data.error)
                                    return posts.data;
                                return posts.data.data;
                            });
                        }]
                },
                controller: ["$scope", "post", "$sce", function (scope, post, sce) {
                        scope.post = post;
                        scope.post.content = sce.trustAsHtml(post.content);
                    }]
            });
        }
        Config.$inject = ["$urlRouterProvider", "$stateProvider", "$locationProvider"];
        return Config;
    })();
    blacktip.Config = Config;
})(blacktip || (blacktip = {}));
var blacktip;
(function (blacktip) {
    var FooterCtrl = (function () {
        function FooterCtrl(scope, http, apiURL) {
            scope.posts = [];
            var that = this;
            http.get(apiURL + "/posts/get-posts?limit=5&minimal=true&tags=webinate&visibility=public").then(function (posts) {
                scope.posts = posts.data.data;
            });
        }
        // The dependency injector
        FooterCtrl.$inject = ["$scope", "$http", "apiURL"];
        return FooterCtrl;
    })();
    blacktip.FooterCtrl = FooterCtrl;
})(blacktip || (blacktip = {}));
var blacktip;
(function (blacktip) {
    'use strict';
    /**
    * Controller for the blog page
    */
    var BlogCtrl = (function () {
        /**
        * Creates an instance of the home controller
        */
        function BlogCtrl(http, apiURL, stateParams, categories) {
            this.http = http;
            this.posts = [];
            this.apiURL = apiURL;
            this.limit = 5;
            this.index = parseInt(stateParams.index) || 0;
            this.last = Infinity;
            this.author = stateParams.author || "";
            this.category = stateParams.category || "";
            this.tag = stateParams.tag || "";
            this.categories = categories;
            this.getPosts();
        }
        /**
        * Sets the page search back to index = 0
        */
        BlogCtrl.prototype.goNext = function () {
            this.index += this.limit;
            this.getPosts();
        };
        /**
        * Sets the page search back to index = 0
        */
        BlogCtrl.prototype.goPrev = function () {
            this.index -= this.limit;
            if (this.index < 0)
                this.index = 0;
            this.getPosts();
        };
        BlogCtrl.prototype.getBlogImageURL = function (post) {
            var url = "/media/images/camera.jpg";
            if (post.featuredImage && post.featuredImage != "")
                url = post.featuredImage;
            return {
                "background-image": "url('" + url + "')"
            };
        };
        BlogCtrl.prototype.getPosts = function () {
            var that = this;
            this.http.get(this.apiURL + "/posts/get-posts?visibility=public&tags=" + that.tag + ",webinate&index=" + that.index + "&limit=" + that.limit + "&author=" + that.author + "&categories=" + that.category + "&minimal=true").then(function (posts) {
                that.posts = posts.data.data;
                that.last = posts.data.count;
            });
        };
        // The dependency injector
        BlogCtrl.$inject = ["$http", "apiURL", "$stateParams", "categories"];
        return BlogCtrl;
    })();
    blacktip.BlogCtrl = BlogCtrl;
})(blacktip || (blacktip = {}));
var blacktip;
(function (blacktip) {
    'use strict';
    /**
    * Controller for managing the
    */
    var HomeCtrl = (function () {
        /**
        * Creates an instance of the home controller
        */
        function HomeCtrl(scope) {
            var that = this;
            this._resizeProxy = this.scaleSlider.bind(this);
            this._slider = null;
            scope.$on("$destroy", function () { that.onDestroy(); });
        }
        /**
        * Cleans up the controller
        */
        HomeCtrl.prototype.onDestroy = function () {
            $(window).unbind("load", this._resizeProxy);
            $(window).unbind("resize", this._resizeProxy);
            $(window).unbind("orientationchange", this._resizeProxy);
            this._resizeProxy = null;
            this._slider = null;
        };
        /**
        * Resizes the slider if the window is resized
        */
        HomeCtrl.prototype.scaleSlider = function () {
            var parentWidth = jQuery(".slider-monitor").width();
            if (parentWidth)
                this._slider.$ScaleWidth(parentWidth);
            else
                window.setTimeout(this._resizeProxy, 30);
        };
        /**
        * Called after the home content is loaded
        */
        HomeCtrl.prototype.loadSlider = function () {
            var _SlideshowTransitions = [
                { $Duration: 1200, $Opacity: 2 }
            ];
            var _CaptionTransitions = [];
            _CaptionTransitions["FADE_IN"] = { $Duration: 1200, $Clip: 15, $Opacity: 1.7, $During: { $Clip: [0.5, 0.5], $Opacity: [0, 0.5] } };
            _CaptionTransitions["LEFT_MARCH"] = { $Duration: 400, x: 0.6, $Easing: { $Left: $JssorEasing$.$EaseInOutSine }, $Opacity: 2 };
            _CaptionTransitions["ATTACK_RIGHT"] = { $Duration: 1500, x: -0.5, y: 0.1, $Zoom: 1, $Easing: { $Left: $JssorEasing$.$EaseInExpo, $Top: $JssorEasing$.$EaseOutWave }, $Opacity: 2, $During: { $Left: [0, 0.7], $Top: [0.3, 0.7] }, $Round: { $Top: 1.3 } };
            var options = {
                $FillMode: 2,
                $AutoPlay: true,
                $AutoPlaySteps: 1,
                $AutoPlayInterval: 5000,
                $PauseOnHover: 1,
                $ArrowKeyNavigation: true,
                $SlideDuration: 500,
                $MinDragOffsetToSlide: 20,
                $SlideSpacing: 0,
                $DisplayPieces: 1,
                $ParkingPosition: 0,
                $UISearchMode: 1,
                $PlayOrientation: 1,
                $DragOrientation: 3,
                $SlideshowOptions: {
                    $Class: $JssorSlideshowRunner$,
                    $Transitions: _SlideshowTransitions,
                    $TransitionsOrder: 1,
                    $ShowLink: true //[Optional] Whether to bring slide link on top of the slider when slideshow is running, default value is false
                },
                $BulletNavigatorOptions: {
                    $Class: $JssorBulletNavigator$,
                    $ChanceToShow: 2,
                    $AutoCenter: 1,
                    $Steps: 1,
                    $Lanes: 1,
                    $SpacingX: 10,
                    $SpacingY: 10,
                    $Orientation: 1 //[Optional] The orientation of the navigator, 1 horizontal, 2 vertical, default value is 1
                },
                $CaptionSliderOptions: {
                    $Class: $JssorCaptionSlider$,
                    $CaptionTransitions: _CaptionTransitions,
                    $PlayInMode: 1,
                    $PlayOutMode: 3 //[Optional] 0 None (no play), 1 Chain (goes before main slide), 3 Chain Flatten (goes before main slide and flatten all caption animations), default value is 1
                }
            };
            this._slider = new $JssorSlider$("slides", options);
            this.scaleSlider();
            $(window).bind("load", this._resizeProxy);
            $(window).bind("resize", this._resizeProxy);
            $(window).bind("orientationchange", this._resizeProxy);
        };
        // The dependency injector
        HomeCtrl.$inject = ["$scope"];
        return HomeCtrl;
    })();
    blacktip.HomeCtrl = HomeCtrl;
})(blacktip || (blacktip = {}));
var blacktip;
(function (blacktip) {
    'use strict';
    /**
     * Controller for the contact us page
     */
    var ContactCtrl = (function () {
        /**
        * Creates an instance of the home controller
        */
        function ContactCtrl(http) {
            this.http = http;
            this.mail = { email: "", name: "", message: "" };
            // Create the map object and center it on the premise
            var geocoder = new google.maps.Geocoder();
            var map = new google.maps.Map(jQuery(".map").get(0), {
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            geocoder.geocode({ 'address': "57 The Headlands, Bray, Ireland" }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    new google.maps.Marker({ map: map, position: results[0].geometry.location });
                }
            });
        }
        /*
        * Sends an email to the modepress admin
        */
        ContactCtrl.prototype.sendMessage = function () {
            var details = this.mail;
            jQuery(".success").hide();
            jQuery(".error").hide();
            jQuery("#contact-form .submit").prop('disabled', true);
            this.http.post("/api/message-admin", details).then(function (response) {
                // Check for any errors
                if (response.data.error) {
                    jQuery(".error").show().text(response.data.message);
                    return;
                }
                else {
                    jQuery(".success").show().text(response.data.message);
                }
            }).catch(function (error) {
                jQuery(".error").show().text("Oh dear, there seems to be an error with our server.\n                    Please try again or send us an email and we'll try get back to you as soon as possible");
            }).finally(function () {
                jQuery("#contact-form .submit").prop('disabled', false);
            });
        };
        // The dependency injector
        ContactCtrl.$inject = ["$http"];
        return ContactCtrl;
    })();
    blacktip.ContactCtrl = ContactCtrl;
})(blacktip || (blacktip = {}));
/**
 * The main entry point of the application
 */
var blacktip;
(function (blacktip) {
    'use strict';
    angular.module("modepress", ["ui.router", 'ngSanitize'])
        .config(blacktip.Config)
        .run(["$rootScope", "$location", "$window", function ($rootScope, $location, $window) {
            // This tells Google analytics to count a new page view on each state change
            $rootScope.$on('$stateChangeSuccess', function (event) {
                if (!$window.ga)
                    return;
                $window.ga('send', 'pageview', { page: $location.path() });
            });
        }])
        .constant("apiURL", "./api")
        .controller("footerCtrl", blacktip.FooterCtrl)
        .controller("homeCtrl", blacktip.HomeCtrl)
        .controller("blogCtrl", blacktip.BlogCtrl)
        .controller("contactCtrl", blacktip.ContactCtrl);
})(blacktip || (blacktip = {}));
/// <reference path="lib/definitions/jquery.d.ts" />
/// <reference path="lib/definitions/angular.d.ts" />
/// <reference path="lib/definitions/angular-ui-router.d.ts" />
/// <reference path="lib/definitions/jssor.d.ts" />
/// <reference path="lib/definitions/modepress.d.ts" />
/// <reference path="lib/Config.ts" />
/// <reference path="lib/controllers/FooterCtrl.ts" />
/// <reference path="lib/controllers/BlogCtrl.ts" />
/// <reference path="lib/controllers/HomeCtrl.ts" />
/// <reference path="lib/controllers/ContactCtrl.ts" />
/// <reference path="lib/Application.ts" /> 

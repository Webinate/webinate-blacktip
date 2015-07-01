﻿module blacktip
{
	'use strict';

    /**
    * Controller for the blog page
    */
    export class BlogCtrl
	{
		// An array of todo items
        private http: ng.IHttpService;
        public posts: Array<modepress.IPost>;
        public categories: Array<modepress.ICategory>;
        public apiURL: string;
        private signaller: Function;
        private scrollTop: Function;

        public author: string;
        public category: string;
        public tag: string;
        public index: number;
        public limit: number;
        public last: number;

		// The dependency injector
        public static $inject = ["$http", "apiURL", "$stateParams", "categories", "signaller", "meta", "scrollTop" ];

		/**
		* Creates an instance of the home controller
		*/
        constructor(http: ng.IHttpService, apiURL: string, stateParams: any, categories: Array<modepress.ICategory>, signaller: Function, meta: Meta, scrollTop: Function)
		{
            this.http = http;
            this.posts = [];
            this.apiURL = apiURL;
            this.signaller = signaller;
            this.scrollTop = scrollTop;

            this.limit = 12;
            this.index = parseInt(stateParams.index) || 0;
            this.last = 1;

            this.author = stateParams.author || "";
            this.category = stateParams.category || "";
            this.tag = stateParams.tag || "";
            this.categories = categories;

            meta.defaults();
            meta.description = "Welcome to our blog, where you will find up to date information on what's happening at the webinate studio";
            meta.brief = meta.description;
        }

        /**
        * Sets the page search back to index = 0
        */
        goNext()
        {
            this.index += this.limit;
            this.getPosts();
        }

        /**
        * Sets the page search back to index = 0
        */
        goPrev()
        {
            this.index -= this.limit;
            if (this.index < 0)
                this.index = 0;

            this.getPosts();
        }

        getBlogImageURL(post: modepress.IPost)
        {
            var url = "/media/images/camera.jpg";
            if (post.featuredImage && post.featuredImage != "")
                url = post.featuredImage;
            
            return {
                "background-image": "url('" + url + "')"
            }
        }

        getPosts()
        {
            var that = this;
            that.posts = [];
            this.http.get<modepress.IGetPosts>(`${this.apiURL}/posts/get-posts?visibility=public&tags=${that.tag}&rtags=webinate&index=${that.index}&limit=${that.limit}&author=${that.author}&categories=${that.category}&minimal=true`).then(function (posts)
            {
                that.posts = posts.data.data;
                that.last = posts.data.count;

                that.scrollTop();
                that.signaller();               
            });
        }
	}
}
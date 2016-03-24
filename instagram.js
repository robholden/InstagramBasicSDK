/**


INSTAGRAM LOGIC 
AUTHOR: Robert Holden


**/

// Create instagram object
var Instagram = {

    // Vars
    clientId: false,
    redirectURI: false,
    accessToken: false,
    user: false,
    _APIBase: 'https://api.instagram.com',

    // Initialise values
    init: function (values) {
        try {
            if (typeof values === 'undefined')
                throw "Instagram->init(): clientId & redirectURI unset";

            if (typeof values.clientId === 'undefined')
                throw "Instagram->init(): clientId unset";

            if (typeof values.redirectURI === 'undefined')
                throw "Instagram->init(): redirectURI unset";

            this.clientId = values.clientId;
            this.redirectURI = values.redirectURI;    
            this.scrapeToken();    
        }

        catch (e) {
            console.error(e);
        }
    },

    // Login method
    login: function (callback){
        if (this.accessToken != false) {
            callback();
            return;
        }

        // Is Loading 
        this.loading = true;

        // Inline methods
        var me = this;

        // Open window to authenticate user
        var oWindow = window.open(
            me._APIBase + '/oauth/authorize/?client_id=' + this.clientId + '&redirect_uri=' + this.redirectURI + '&response_type=token',
            "",
            "width=500, height=500"
        );

        var handleWindow = function () {
            if (typeof oWindow !== 'undefined' || oWindow != null) {
                me.loading = !oWindow.closed;
                
                // Get access token from object
                try {
                    if (typeof oWindow.Instagram !== 'undefined' && !me.hasValidToken()) {
                        var oInsta = oWindow.Instagram;
                        if (oInsta.hasValidToken()) {
                            me.accessToken = oInsta.accessToken;
                            me.getUser(function(result){
                                if (typeof result !== 'undefined') {
                                    if (typeof result.data !== 'undefined') {
                                        me.user = result.data;
                                    }
                                }

                                oWindow.close();                        
                            });
                        }
                    }
                } catch (e) { }
            }
        }

        var interval = window.setInterval(function() {
            try {
                if (oWindow == null || oWindow.closed) {
                    window.clearInterval(interval);
                    callback();
                }
            }

            catch (e) { console.error(e); }
                
            finally { handleWindow(); }
        }, 100);
    },

    hasValidToken: function () {
        return (this.accessToken != false && this.accessToken != '');
    },

    scrapeToken: function () {
        // Check domain for access token
        var hash = window.location.hash.substr(1);
        if (hash.indexOf('access_token=') > -1) {
            this.accessToken = hash.replace('access_token=', '');
        }

        // Is there an error?
        var err = this.getParameterByName('error');
        if (err != null) {
            window.close();
        }
    },

    getUser: function (callback) {
        try {
            if (! this.hasValidToken())
                throw "Instagram->init(): Unauthorised";

            $.ajax({
                type: "GET",
                url: this._APIBase + '/v1/users/self',
                data: {access_token: this.accessToken},
                dataType: 'jsonp',
                success: function (result) {
                    callback(result);                    
                },
                error: function () {
                }
            });
        }

        catch (e) {
            console.error(e);
        }
    },

    getPhotos: function(options, callback) {
        var me = this;

        this.login(function(){
            if (me.hasValidToken() && me.user != false) {

                $.ajax({
                    type: "GET",
                    url: 'https://api.instagram.com/v1/users/' + me.user.id + '/media/recent',
                    data: {access_token: me.accessToken, max_id: options.max_id, count: options.count},
                    dataType: 'jsonp',
                    success: function (result) {
                        callback(result);
                    },
                    error: function () {
                    }
                });
            } else { callback(false); }
        })
    },

    getAllPhotos: function (callback) {
        var getAllPhotos = {
            start: 0,
            data: [],

            options: {
                count: -1,
                max_id: '',
            },

            get: function (callback) {
                var me = this;
                Instagram.getPhotos(this.options, function(photos) {
                    $('#insta-login').text((! photos) ? 'Login' : 'Logged In');

                    if (photos != false && photos.pagination != null) {
                        // Push images to data
                        me.data = me.data.concat(photos.data);

                        // Get more is there's a next page
                        if (typeof photos.pagination.next_max_id !== 'undefined') {
                            me.options.max_id = photos.pagination.next_max_id;
                            me.get(callback);
                        }

                        else {
                            callback(me.data);
                        }
                    }

                    else {
                        callback(me.data);
                    }
                });
            }
        }

        getAllPhotos.get(callback);
    },

    getParameterByName: function (name, url) {
        if (!url) url = window.location.href;
        url = url.toLowerCase(); // This is just to avoid case sensitiveness  
        name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}

$(document).ready(function () {

    // Init Insta
    Instagram.init({
        clientId: CLIENT-ID,
        redirectURI: YOUR-URL,
    });

    // login
    $(document).on('click', '#insta-login', function(e){
        $(this).text('Logging in...');

        Instagram.getAllPhotos(function(photos){
            var html = '';
            for (var i = 0; i < photos.length; i++) {
                try {
                    var url = photos[i]['images']['standard_resolution']['url'];
                    html += '<a href="#" class="fb-image" data-url="' + url + '" style="display: block; float: left; width: 100px; height: 100px; background: center no-repeat; background-size: cover; background-image: url(' + url + ')"></a>';
                } catch (e) { }
            }
            
            $('#images').html(html);
        });

        e.preventDefault();
    });
});
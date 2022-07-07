var $jqm = $.mobile;

var MobileApp = {

    loginPath: "/web/mobile",
    inAppBrowser: null,

    init: function() {
//        // fix for ios7 status bar
//        var updateStatusBar = navigator.userAgent.match(/iphone|ipad|ipod/i) && parseInt(navigator.appVersion.match(/OS (\d)/)[1], 10) >= 7;
//        if (updateStatusBar) {
//            document.body.style.webkitTransform = 'translate3d(0, 20px, 0)';
//        }

        //load profiles
        var list = MobileApp.getProfileList();
        var profiles = list.split(";");

        if (list !== "") {
            $(".profile_container").append("<select id=\"profile\" name=\"profile\"></select>");
            for (var i = 0; i < profiles.length; i++) {
                if (profiles[i] !== "") {
                    $("#profile").append("<option>"+profiles[i]+"</option>");
                }
            }

            $("#profile").on("change", function(){
                var p = $("#profile").val();
                MobileApp.loadProfile(p);
            });

            $(".profile_container").append("<div data-role=\"controlgroup\" data-type=\"horizontal\"><a href=\"#\" data-role=\"button\" data-icon=\"plus\" data-iconpos=\"notext\">Add</a><a href=\"#\" data-role=\"button\" data-icon=\"minus\" data-iconpos=\"notext\">Delete</a></div>");
            $(".profile_container [data-role='controlgroup']").controlgroup();

            $(".profile_container [data-icon='plus']").click(function() {
                 window.location.hash = "#newprofile";
                 MobileApp.newProfile();
            });
            $(".profile_container [data-icon='minus']").click(function() {
                if (confirm("Delete this profile?")) {
                    MobileApp.deleteProfile();
                }
            });

            // load last profile
            var profile = MobileApp.getLastLogin();
            if (list !== "") {
                if (profiles.indexOf(profile) < 0) {
                    profile = profiles[0];
                    if (profile === "") {
                        profile = profiles[1];
                    }
                }
            } else {
                profile = "default";
            }
            $("#profile").val(profile).trigger("change");
            MobileApp.loadProfile(profile);

            // register device for push
            try {
                MobilePush.registerDevice();
            } catch(e) {
                console.log(e);
            }

        } else {
            MobileApp.newProfile();
            $("#loginForm #cancel").remove();
        }


        $(document).on("backbutton", function(e) {
            if ($("#header:visible").length > 0) {
                e.preventDefault();
                navigator.app.exitApp();
            } else {
               navigator.app.backHistory();
            }
        });
    },

    initDevice: function() {
        // adjust UI for iOS status bar
        if (device && device.platform === "iOS") {
            $(document.body).addClass("ios");
            $("#main").addClass("ios");
            $("#header").addClass("ios");
        }
    },

    supportsHtml5Storage: function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    },

    getData: function(name) {
        var data;
        if (MobileApp.supportsHtml5Storage()) {
            data = localStorage.getItem(name);
        } else {
            data = $.cookie(name);
        }
        if (data == null) {
            data = "";
        }
        return data;
    },

    getProfileList: function() {
        return MobileApp.getData("profiles");
    },

    getLastLogin: function() {
        return MobileApp.getData("lastLogin");
    },

    getHomeUrl: function(profile) {
        return MobileApp.getData(profile + "_homeUrl");
    },

    getUsername: function(profile) {
        return MobileApp.getData(profile + "_username");
    },

    getPassword: function(profile) {
        return MobileApp.getData(profile + "_password");
    },

    getRememberPassword: function(profile) {
        return MobileApp.getData(profile + "_rememberPassword");
    },

    setData: function(name, value) {
        if (MobileApp.supportsHtml5Storage()) {
            localStorage.setItem(name, value);
        } else {
            $.cookie(name, value);
        }
    },

    setLastLogin: function(profile){
        MobileApp.setData("lastLogin", profile);
    },

    setHomeUrl: function(profile, url) {
        MobileApp.setData(profile + "_homeUrl", url);
    },

    setUsername: function(profile, username) {
        MobileApp.setData(profile + "_username", username);
    },

    setPassword: function(profile, password) {
        MobileApp.setData(profile + "_password", password);
    },

    setRememberPassword: function(profile, rememberPassword) {
        MobileApp.setData(profile + "_rememberPassword", rememberPassword);
    },

    getFullUrl: function(url) {
        if (!url || url === "") {
            return "";
        }

        //remove extra "/" at the end of the url
        if (url.match(/\/$/)) {
            url = url.substring(0, url.length - 1);
        }

        //if no http/https, add http
        if (!url.toLowerCase().match(/(http|https):\/\/.*$/)) {
            url = "http://" + url;
        }

        var fullUrl;

        //if url is userview or mobile direct link
        if (url.indexOf("/web/userview/") > 0 || url.indexOf("/web/mobile/") > 0) {
            fullUrl = url;
        } else {
            fullUrl = url

            // if without context path, add /jw
            if (!url.toLowerCase().match(/(http|https):\/\/.*\/.*$/)) {
                fullUrl = fullUrl + "/jw";
            }

            fullUrl = fullUrl + MobileApp.loginPath;
        }
        return fullUrl;
    },

    addProfile: function(profile) {
        var profileList = MobileApp.getProfileList();
        var profiles = profileList.split(";");
        for (var i=0; i<profiles.length; i++) {
            if (profiles[i].toLowerCase() === profile.toLowerCase()) {
                profiles.splice(i, 1);
                break;
            }
        }
        profiles.push(profile);
        profileList = profiles.join(";");
        MobileApp.setData("profiles", profileList);
        window.location.hash = "";
    },

    deleteProfile: function() {
        var profile = $("#profile").val();

        var profileList = MobileApp.getProfileList();
        var profiles = profileList.split(";");
        for (var i=0; i<profiles.length; i++) {
            if (profiles[i].toLowerCase() === profile.toLowerCase()) {
                profiles.splice(i, 1);
                break;
            }
        }
        profileList = profiles.join(";");
        MobileApp.setData("profiles", profileList);

        $(".profile_container").html("");
        try {
            MobilePush.unregisterDevice(profile);
        } catch(e) {
            console.log(e);
        }
        MobileApp.init();
    },

    newProfile: function() {
        $(".profile_container").html("");
        $(".profile_container").append("<input id=\"profile\" name=\"profile\" placeholder=\"Profile Name\" />");
        $("#profile").textinput();

        if ($("#loginForm #cancel").length == 0) {
            $("#loginForm").append('<button id="cancel" name="cancel" class="form-button ui-btn ui-shadow ui-corner-all">Cancel</button>');
            $("#loginForm #cancel").on("click", function() {
                $(this).remove();
                history.back(-1);
            });
        }

        MobileApp.loadProfile("");
        $("#profile").focus();
    },

    loadProfile: function(profile) {
        var homeUrl = (profile === "") ? "" : MobileApp.getHomeUrl(profile);
        var username = (profile === "") ? "" : MobileApp.getUsername(profile);
        var password = (profile === "") ? "" : MobileApp.getPassword(profile);
        var rememberPassword = (profile === "") ? "" : MobileApp.getRememberPassword(profile);

        $("#url").val(homeUrl).textinput("refresh");
        $("#username").val(username).textinput("refresh");
        $("#password").val(password).textinput("refresh");
        if (rememberPassword == "true") {
            $("#rememberPassword").prop('checked', true).checkboxradio('refresh');
        }
        if (!homeUrl || homeUrl == '') {
            $("#url").val("").textinput("refresh");
            $("#url").focus();
        } else if (!username || username == '') {
            $("#username").focus();
        } else if (!password || password == '') {
            $("#password").focus();
        } else {
            $("#login").focus();
        }
    },

    login: function() {
        var profile = $("#profile").val().trim();
        var url = $("#url").val().trim();
        var username = $("#username").val().trim();
        var password = $("#password").val();
        var rememberPassword = $("#rememberPassword:checked").val();

        $(".required").remove();
        if (profile === "") {
            $("#profile").parent().after("<span class=\"required\">This field is required</span>");
        }
        if (url === "") {
            $("#url").parent().after("<span class=\"required\">This field is required</span>");
        }
        if (username === "") {
            $("#username").parent().after("<span class=\"required\">This field is required</span>");
        }
        if (password === "") {
            $("#password").parent().after("<span class=\"required\">This field is required</span>");
        }

        if (profile && profile != "" && url && url != "" && username && username != "" && password && password != "") {
            $.mobile.loading('show');

            var fullUrl = MobileApp.getFullUrl(url);
            try {
                var urlParser = document.createElement("a");
                urlParser.href = fullUrl;
                var pathName = urlParser.pathname;
                var idx = pathName.substring(1, pathName.length).indexOf("/");
                if (idx > 0) {
                    var success = false;
                    var contextPath = pathName.substring(1, idx + 1);
                    var apiUrl = urlParser.protocol + "//" + urlParser.host + "/" + contextPath + "/web/mapp/xxx/xxx";
                    $.support.cors = true;
                    try {
                        $.ajax({
                            type: 'GET',
                            url: apiUrl,
                            dataType: "json",
                            error: function (data) {
                                if (data.status === 401 || data.status === 404) {
                                    success = true;
                                    if ($(".ui-input-text #profile").length > 0) {
                                        MobileApp.addProfile(profile);
                                    }

                                    MobileApp.setLastLogin(profile);
                                    MobileApp.setHomeUrl(profile, url);
                                    MobileApp.setUsername(profile, username);
                                    if (rememberPassword == "true") {
                                        MobileApp.setPassword(profile, password);
                                    } else {
                                        MobileApp.setPassword(profile, "");
                                    }
                                    MobileApp.setRememberPassword(profile, rememberPassword);

                                    MobilePush.registerDevice();
                                    MobileApp.loginAndNavigate(fullUrl, username, password);
                                } else {
                                    $.mobile.loading('hide');
                                    alert("Invalid Server or Unsupported Version");
                                }
                            }
                        });
                    } catch (e) {
                    }
                    setTimeout(function () {
                        if (!success) {
                            $.mobile.loading('hide');
                        }
                    }, 5000);
                } else {
                    $.mobile.loading('hide');
                    alert("Invalid URL " + fullUrl);
                }
            } catch (e) {
                $.mobile.loading('hide');
                alert("Invalid URL: " + fullUrl);
            }
            return false;
        } else {
            return false;
        }
    },

    navigate: function(url) {
        $.mobile.loading('show');

        var login = false;

        // check for matching profile
        var parser = document.createElement('a');
        parser.href = url;
        var hostUri = "http://" + parser.host + "/";
        console.log("host: " + parser.host);
        var hostUriHttps = "https://" + parser.host + "/";
        var profileList = MobileApp.getProfileList();
        var profiles = profileList.split(";");
        for (var i = 0; i < profiles.length; i++) {
            var profile = profiles[i];
            var rememberPassword = MobileApp.getRememberPassword(profile);
            if (rememberPassword === "true") {
                console.log("checking profile: " + profile);
                var domain = MobileApp.getFullUrl(MobileApp.getHomeUrl(profile));
                if (domain.indexOf(hostUri) === 0 || domain.indexOf(hostUriHttps) === 0) {
                    // matching profile with remember password found
                    console.log("matching profile: " + profile);
                    var username = MobileApp.getUsername(profile);
                    var password = MobileApp.getPassword(profile);
                    // login and navigate to URL
                    MobileApp.loginAndNavigate(url, username, password);
                    login = true;
                    break;
                }
            }
        }

        if (!login) {
            // show URL in frame
            MobileApp.showFrame(url);
        }
    },

    loginAndNavigate: function(url, username, password) {
        var parser = document.createElement('a');
        parser.href = url;
        var hostUri = parser.protocol + "//" + parser.host;
        var search = parser.search;
        var loginUrl = hostUri + "/jw/j_spring_security_check";    
        var credentials = "j_username=" + encodeURIComponent(username) + "&j_password=" + encodeURIComponent(password);
        $.mobile.loading('hide');
        var newUrl = url;
        newUrl += (search) ? "&" : "?";
        newUrl += "_cordova=true";
        MobileApp.showFrame(newUrl, loginUrl, credentials);
    },

    showFrame: function(url, loginUrl, credentials) {
        // implementation using InAppBrowser plugin https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-inappbrowser/
        var ios = device && device.platform === "iOS";
        if (!ios) {
            // for Android, use AJAX call to SSO
            var options = "location=yes,footer=no,toolbar=yes,toolbarcolor=#000000,navigationbuttoncolor=#ffffff,lefttoright=yes,closebuttoncaption=Home,hideurlbar=yes,zoom=no";
            if (loginUrl) {
                $.post(loginUrl + "?", credentials)
                    .done(function() {
                        MobileApp.inAppBrowser = cordova.InAppBrowser.open(url, "_blank", options);
                    });
            } else {
                cordova.InAppBrowser.open(url, "_blank", options);
            }
        } else {
            // for iOS, use InAppBrowser.executeScript method because session cookies are not passed over to the webview
            MobileApp.inAppBrowser = cordova.InAppBrowser.open(url, "_blank", "location=no,toolbar=yes,toolbartranslucent=no,toolbarposition=bottom,closebuttoncaption=Home,hideurlbar=yes,zoom=no");
            if (loginUrl) {
                var loggedIn = false;
                var callback = function() {
                    if (!loggedIn && window.location !== 'about:blank') {
                        var loginScript = " window.onload=function() { try { var xhttp = new XMLHttpRequest(); xhttp.open('POST', '" + loginUrl + "', false); xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhttp.send('" + credentials + "'); } catch(e) { alert(e) }; }";
                        MobileApp.inAppBrowser.executeScript({code: loginScript});
                        console.log("login: " + loginUrl);
                        loggedIn = true;
                    }
                };
                MobileApp.inAppBrowser.addEventListener('loadstart', callback);
            }
        }
    },

    closeFrame: function() {
        $("#userview").fadeIn();
        MobileApp.inAppBrowser.close();
    },

    popup: function(title, message, url) {
        if (MobileApp.inAppBrowser) {
            MobileApp.inAppBrowser.hide();
        }
        $("#popupDialog h4").text(title);
        $("#popupDialog p").text(message);
        $("#popupButtons").empty();
        if (url) {
            var navButton = $("<button>Go</button>");
            navButton.on("click", function() {
                $("#popupDialog").popup().popup("close");
                MobileApp.navigate(url);
            });
            $("#popupButtons").append(navButton);
            var cancelButton = $("<button>Cancel</button>");
            cancelButton.on("click", function() {
                $("#popupDialog").popup().popup("close");
                MobileApp.inAppBrowser.show();
            });
            $("#popupButtons").append(cancelButton);
        } else {
            var okButton = $("<button>OK</button>");
            okButton.on("click", function() {
                $("#popupDialog").popup().popup("close");
                MobileApp.inAppBrowser.show();
            });
            $("#popupButtons").append(okButton);
        }
        $("#popupDialog").popup().popup("open");
    }

}
$(document).on("pageinit", function() {
    MobileApp.init();
});
document.addEventListener("deviceready", MobileApp.initDevice, false);
window.addEventListener("hashchange", function(){
    if (!window.location.hash) {
        $(".profile_container").html("");
        MobileApp.init();
    }
});
// open URLs in InAppBrowser
window.addEventListener('message', function(message) {
    var url = message.data;
    if (url.startsWith("http://") || url.startsWith("https://")) {
        cordova.InAppBrowser.open(url, "_blank");
    }
});


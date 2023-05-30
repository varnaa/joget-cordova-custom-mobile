var MobilePush = {
    
    CONFIG_SENDER_ID: "151651598697",
    CONFIG_PUSH_SERVER_URL: "https://mobile.cloud.joget.com/jw/web/json/app/jms/plugin/org.joget.mobile.MobilePushPlugin/service",
    pushRegistrationId: "",

    init: function() {
        var push = PushNotification.init({
            "android": {
                "senderID": MobilePush.CONFIG_SENDER_ID,
                "icon": "icon",
                "forceShow": true
            },
            "ios": {
                "senderID": MobilePush.CONFIG_SENDER_ID,
                "gcmSandbox": "false",
                "alert": "true",
                "badge": "true",
                "clearBadge": "true",
                "sound": "true"
            }
        });

        push.on('registration', function (data) {
            MobilePush.pushRegistrationId = data.registrationId;
            console.log("MobilePush.pushRegistrationId: " + MobilePush.pushRegistrationId);
            MobilePush.registerDevice();
        });

        push.on('notification', function (data) {
            console.log("notification title: " + data.title);
//            alert(JSON.stringify(data));
            var url = data.additionalData.url;
            MobileApp.popup(data.title, data.message, url);
        });

        push.on('error', function (e) {
            console.log("error: " + e.message);            
        });

        var permissions = cordova.plugins.permissions;
        permissions.hasPermission(permissions.POST_NOTIFICATIONS, function( status ){
            if (!status.hasPermission) {
                permissions.requestPermission(permissions.POST_NOTIFICATIONS);
            }
        });
    },
    
    registerDevice: function() {
        var registrationId = MobilePush.pushRegistrationId;
        if (registrationId) {
            var deviceId = device.uuid;
            var deviceInfo = device.platform + " " + device.version + " " + device.manufacturer + " " + device.model;
            var profileList = MobileApp.getProfileList();
            var profiles = profileList.split(";");
            console.log("deviceId: " + deviceId);
            console.log("deviceInfo: " + deviceInfo);
            console.log("registrationId: " + registrationId);
            console.log("profiles: " + profileList);
            for (var i = 0; i < profiles.length; i++) {
                var profile = profiles[i];
                if (profile !== "") {
                    var domain = MobilePush.getPushUrl(MobileApp.getHomeUrl(profile));
                    var username = MobileApp.getUsername(profile);
                    console.log("profileUrl: " + domain);
                    console.log("username: " + username);

                    var pushUrl = MobilePush.CONFIG_PUSH_SERVER_URL + "?_a=register&deviceId=" + encodeURIComponent(deviceId) + "&deviceInfo=" + encodeURIComponent(deviceInfo) + "&registrationId=" + encodeURIComponent(registrationId) + "&username=" + encodeURIComponent(username) + "&domain=" + encodeURIComponent(domain);
                    $.support.cors = true;
                    $.ajax({
                        type: 'GET',
                        url: pushUrl,
                        crossDomain: true,
                        dataType: "json",
                        success: function(data) {
                            console.log("device registration successful");
                        },
                        error: function(data) {
                            console.log("device registration error: " + data.status);
                        }
                    });
                }
            }
        }
    },
    
    unregisterDevice: function(profile) {
        var deviceId = device.uuid;
        if (profile !== "") {
            var domain = MobilePush.getPushUrl(MobileApp.getHomeUrl(profile));
            var username = MobileApp.getUsername(profile);
            console.log("deviceId: " + deviceId);
            console.log("profileUrl: " + domain);
            console.log("username: " + username);

            var pushUrl = MobilePush.CONFIG_PUSH_SERVER_URL + "?_a=unregister&deviceId=" + encodeURIComponent(deviceId) + "&username=" + encodeURIComponent(username) + "&domain=" + encodeURIComponent(domain);
            $.support.cors = true;
            $.ajax({
                type: 'GET',
                url: pushUrl,
                crossDomain: true,
                dataType: "json",
                success: function(data) {
                    console.log("device unregistration successful");
                },
                error: function(data) {
                    console.log("device unregistration error: " + data.status);
                }
            });
        }
    },
    
    getPushUrl: function(url) {
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
        
        var pushUrl = url;
        
        //if url is userview or mobile direct link
        if (pushUrl.indexOf("/web/userview/") > 0) {
            pushUrl = pushUrl.substring(0, pushUrl.indexOf("/web/userview/"));
        } else if (pushUrl.indexOf("/web/mobile/") > 0) {
            pushUrl = pushUrl.substring(0, pushUrl.indexOf("/web/mobile/"));
        }
            
        // if without context path, add /jw
        if (!url.toLowerCase().match(/(http|https):\/\/.*\/.*$/)) {
            pushUrl = pushUrl + "/jw";
        }
        pushUrl = pushUrl + "/web/mobile";
        return pushUrl;
    }    
    
}
document.addEventListener("deviceready", MobilePush.init, false);

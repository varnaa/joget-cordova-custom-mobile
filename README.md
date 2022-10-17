# Description

Native hybrid mobile app for the [Joget](https://www.joget.com) no-code/low-code platform using [Apache Cordova](https://cordova.apache.org/).


# Prerequisite Checklist

Ensure that you have the following prerequisite information and files ready for Android and iOS development:

### Android (https://developer.android.com/studio/publish/app-signing)
1. Android package name
2. Android signing keystore file: android.keystore 
3. Android signing keystore alias
4. Android signing keystore password

### iOS (https://developer.apple.com/support/code-signing/)
1. iOS App ID (Bundle ID)
2. App store provisioning profile name
3. App store provisioning profile file:  ios-appstore.mobileprovision
4. Apple distribution certificate file (p12 format): ios-certificate.p12
5. Apple distribution certificate password
6. Apple Team ID

### Firebase Push Notifications (https://firebase.google.com/docs/guides)
1. Firebase project number
2. Android Google Services JSON file: android-google-services.json
3. iOS Google Service Plist file: ios-GoogleService-info.plist 

# Customization

### Customize App Configuration

Update `config.xml` to replace the package name, ID, version, name, description and author details as required:

```
<widget android-activityName="CustomMobile" android-packageName="com.example.custom.mobile" android-versionCode="10000" id="com.example.custom.mobile" ios-CFBundleVersion="1.0.0" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0" xmlns:android="http://schemas.android.com/apk/res/android">

<name>Custom Mobile</name>
<description>Custom Mobile</description>
<author email="info@example.com" href="http://www.example.com">Example Inc</author>
…
        <config-file target="AndroidManifest.xml" parent="/manifest/application">
            <provider
                android:name="androidx.core.content.FileProvider"
                android:authorities="com.example.custom.mobile.provider"
```

### Customize Title and About Dialog

Update the title in `www/index.html` as required:

```
<title>Custom Mobile</title>
…
<div id="cover" class="row p-2 h-25">
    <div class="col-10">
        <h6 class="p-2 mb-5 text-light">Custom Mobile</h6>
    </div>
    <div class="col p-2">
        <a href="#" class="m-2 my-0 float-end text-light" data-bs-toggle="modal" data-bs-target="#about-dialog"><i class="fa fa-circle-info"></span></i></a>
    </div>
</div>
…
```

### Update the About dialog in `www/index.html` as required:

```
<div class="modal-content">
    <div class="modal-header">
        <h5 class="modal-title" id="about-dialog-long-title">About</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
        <h7>Custom Mobile</h7>
        <div id="version">
            https://www.example.com
            <br />
            info@example.com
            <br />
            <br />
            VERSION 1.0.0
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    </div>
</div>
```

### Customize Images and CSS 

Replace the app logo:
```
www/logo.png
```

Replace the cover image:
```
www/cover.jpg
```

The app UI utilizes the [Bootstrap](https://getbootstrap.com/) CSS framework.
The height of the cover image can be increased by setting the Bootstrap sizing class in the div with id “cover” e.g. change the class to `h-50` for 50% vertical height:
```
…
<div id="cover" class="row p-2 h-50">
    <div class="col-10">
        <h6 class="p-2 mb-5 text-light">Custom Mobile</h6>
    </div>
```

### Customize the CSS colors in `www/mobile.css`:

```
h6.p-2.mb-5.text-light {
    color: #ffffff !important;
}
button {
    background: teal !important;
}
#profile-buttons a {
    color: teal;
}
input.form-check-input:checked {
    background-color: teal !important;
    border-color: teal !important;
}
```

Optionally, update the Bootstrap CSS as required using SASS.
Edit variables in `bootstrap-custom.scss` e.g. set the primary color to “teal”:

```
$primary: teal;
@import "bootstrap/scss/bootstrap";
```

Generate the custom CSS by running:

```
npm install -g sass
sass bootstrap-custom.scss bootstrap-custom.css
```

By default, the app displays a navigation bar (appears on top on Android and at the bottom on iOS). To display a floating button on the bottom left, set MobileApp.floatingButton to true in `www/index.html`
```
MobileApp.floatingButton = true;
```

### Customize Home URL 

By default, the mobile app allows a user to add or remove multiple profiles to connect to multiple Joget server URLs. Optionally, set a Joget URL to disable profiles and hardcode a single connection profile for the app in `www/index.html` e.g.:
```
<script>
    $(function() {
        var homeUrl = "https://joget.example.com/jw";
        MobileApp.init(homeUrl);
    });
</script>
```

### Customize Icons

Replace the app icons:

- res/AppIcon40x40.png
- res/icon.png
- res/logo_76x76.png
- res/logo_120x120.png
- res/logo_152x152.png
- res/logo_167x167.png
- res/logo_512x512.png
- res/logo_1024x1024.png

### Customize Splash Screens

Replace the splash screens and screenshots:

- res/splash_640x1136.png
- res/splash_white_640x1136.png
- res/screen/ios/Default@2x\~universal~anyany.png
- res/screen/ios/Default@2x\~universal~comany.png
- res/screen/ios/Default@2x\~universal~comcom.png
- res/screen/ios/Default@3x\~universal~anyany.png
- res/screen/ios/Default@3x\~universal~anycom.png
- res/screen/ios/Default@3x\~universal~comany.png

### Access Cordova Native Features

Due to the cross-origin security restrictions on IFRAMEs and AJAX requests, Joget web apps need to be launched within Cordova's [InAppBrowser](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-inappbrowser/index.html).
The Cordova app automatically inserts a JavaScript function `cordovaAction(action, message)` into the Joget web app, and this function can be called from the Joget web app to invoke actions in the Cordova app. 
For the list of available actions, refer to MobileApp.cordovaAction in `www/mobile.js`. 
Some examples of Cordova native features:

- Camera: Option to capture image directly from camera is automatically integrated to the file upload field.
- Offline: Offline and background sync functionality is automatically handled by the Joget PWA web app. Recent tests indicate offline support in the latest Android and iOS 15 versions.
- Geolocation: Call `cordovaAction("geolocation")` to prompt the app to ask for the user’s permission to access geolocation information.
- Vibration: Call `cordovaAction("vibration")` to vibrate the mobile device.
- Alerts: Call `cordovaAction("alert", "message")` to display a native alert message.
- Biometric: Biometric authentication supporting both fingerprint and Face ID available in the app using the cordova-plugin-fingerprint-aio plugin.


### Configure Mobile Push Settings

Update the Firebase project number (project_number in `android-google-services.json`), and mobile server URL in `www/push.js`:

```
CONFIG_SENDER_ID: "151651598697", // project_number from google-services.json
CONFIG_PUSH_SERVER_URL: "https://custom.mobile.example.com/jw/web/json/app/jms/plugin/org.joget.mobile.MobilePushPlugin/service",
```


# Building

To build the project, [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) are used for confidential information and files like the keys, certificates and passwords.

### Enable GitHub Actions

If you do not see an Actions tab in your GitHub repository, enable [GitHub Actions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository) in the repository Settings. 

### Build Android App Using GitHub Actions

Add the following secrets:

1. `ANDROID_KEYSTORE_BASE64` (convert android.keystore into base64 e.g. using the command: base64 android.keystore)
2. `ANDROID_GOOGLE_SERVICES_JSON_BASE64` (convert the android-google-services.json into base64 e.g. using the command: base64 android-google-services.json)
3. `ANDROID_KEYSTORE_ALIAS`
4. `ANDROID_KEYSTORE_PASSWORD`

Go to Actions > Build Android > Run workflow.

When the workflow run is completed, the APK and App Bundle will be available in the `android-app-release.zip` artifact.


### Build iOS App Using GitHub Actions

Edit the environment variables in `.github/workflow/build-ios.yml` to match your environment:

```
env:
  TEAM_ID: CQHX8VZ8F7
  PROVISIONING_PROFILE: Custom Mobile App Store
  IPA_FILE: Custom Mobile.ipa
```

Set the following secrets:

1. `IOS_CERTIFICATE_BASE64` (convert the ios-certificate.p12 into base64 e.g. using the command: base64 ios-certificate.p12)
2. `IOS_PROVISION_PROFILE_BASE64` (convert the ios-appstore.mobileprovision into base64 e.g. using the command: base64 ios-appstore.mobileprovision)
3. `IOS_P12_PASSWORD`
4. `IOS_GOOGLESERVICE_PLIST_BASE64` (convert the ios-GoogleService-info.plist into base64 e.g. using the command: base64 ios-GoogleService-info.plist)

Go to Actions > Build iOS > Run workflow.

When the workflow run is completed, the IPA will be available in the `ios-app-release.zip` artifact, and the source XCode workspace in the `xcworkspace.zip` artifact.


# Licensing

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

NOTE: This software may depend on other packages that may be licensed under different open source licenses.

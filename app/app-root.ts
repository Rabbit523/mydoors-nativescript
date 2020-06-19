import { EventData } from "tns-core-modules/ui/page/page";
import { Frame } from "tns-core-modules/ui/frame";
import * as appSettings from 'tns-core-modules/application-settings';
import { fromObject } from "tns-core-modules/data/observable/observable";
import * as firebase from "nativescript-plugin-firebase";
import { Vibrate } from 'nativescript-vibrate';
import { LocalNotifications } from "nativescript-local-notifications";
import { getBackgroundColor, setBackgroundColor } from "./shared/utils";

// background settings
if(!appSettings.hasKey('md_background_color')) setBackgroundColor('#fffcee');

export const appRootModel = fromObject({
	route: (appSettings.hasKey('md_token')) ? 'pages/home/home-page' : 'pages/auth/register/register-page',
	bkgColor: getBackgroundColor()
});
// end background settings

export function onLoaded(args: EventData) {
	const frame = <Frame>args.object;
	frame.transition = { name: 'slide', duration: 200 };

	// FIREBASE
	firebase.init({
		persist: false,
		showNotificationsWhenInForeground: true,
		onPushTokenReceivedCallback: token => {
			appSettings.setString('fcm_token', token);
			console.log("Firebase push token: " + token);
		},
		onMessageReceivedCallback: message => {
			console.log(`Title: ${message.title}`);
			console.log(`Body: ${message.body}`);
			// if your server passed a custom property called 'foo', then do this:
			console.log(`Value of 'has_trillo': ${message.data.has_trillo}`);
			if(message.data.has_trillo) {
				let vibrator = new Vibrate();
				vibrator.vibrate([1000, 300, 500, 2000]);
			}

			localNotificationAction(message);
		},
		onAuthStateChanged: (data) => { // optional but useful to immediately re-logon the user when they re-visit your app
			console.log(data.loggedIn ? "Logged in to firebase" : "Logged out from firebase");
			console.dir(data);

			if (data.loggedIn) {
				console.log("user:");
				console.dir(data.user);
				appSettings.setString('md_token', data.user.uid);
			}
		}
		// Optionally pass in properties for database, authentication and cloud messaging,
		// see their respective docs.
	}).then( () => {
			console.log("firebase.init done");
		}, error => {
			console.log(`firebase.init error: ${error}`);
		}
	);
	// END FIREBASE



	frame.bindingContext = appRootModel;

}


function localNotificationAction(data) {
	LocalNotifications.hasPermission()
		.then(granted => {
			LocalNotifications.schedule([{
				// id: 1,
				title: data.title,
				// subtitle: 'This poster is awesome!',
				body: data.body,
				// icon: "res://ic_mydoors",
				bigTextStyle: false, // Allow more than 1 row of the 'body' text on Android, but setting this to true denies showing the 'image'
				// color: new Color("green"),
				// image: "https://images-na.ssl-images-amazon.com/images/I/61mx-VbrS0L.jpg",
				// thumbnail: "https://2.bp.blogspot.com/-H_SZ3nAmNsI/VrJeARpbuSI/AAAAAAAABfc/szsV7_F609k/s200/emoji.jpg",
				forceShowWhenInForeground: true,
				// channel: "vue-channel",
				// ticker: "Special ticker text for Vue (Android only)",
				// at: new Date(new Date(new Date().getTime() + (5 * 1000))),
				// actions: []
			}])
				.then(() => {
					console.log("NOTIFICA ARRIVATA DA LOCAL NOTIFICATIONS");
					// alert({
					// 	title: "Notification scheduled",
					// 	message: "ID: 1",
					// 	okButtonText: "OK, thanks"
					// });
				})
				.catch(error => console.log("doSchedule error: " + error));
		});
}

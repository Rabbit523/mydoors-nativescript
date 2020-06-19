import { EventData, fromObject } from "tns-core-modules/data/observable";
import { GridLayout, TouchGestureEventData } from "tns-core-modules/ui";
import * as firebase from 'nativescript-plugin-firebase';
import { Profile } from "~/shared/models/user";
import { AnimationCurve } from "tns-core-modules/ui/enums/enums";
import * as mapsModule from "nativescript-google-maps-sdk";
import { Message } from "~/shared/models/message";

function setLocationOnMap(latitude: number, longitude: number) {
	mapView.latitude = latitude;
	mapView.longitude = longitude;
}

function setMarkerPosition(latitude: number, longitude: number) {
	marker.position = mapsModule.Position.positionFromLatLng(latitude, longitude);
	marker.title = showMapModel.get('user_name');
}

function getLocationCoordinates(message: Message) {
	const positionLatLng: string[] = message.body.split('|');
	const latitude = parseFloat(positionLatLng[0]);
	const longitude = parseFloat(positionLatLng[1]);
	return { latitude, longitude };
}

export class ShowMap extends GridLayout {
	user_name: string = null;
}

export const showMapModel = fromObject(new ShowMap() );

export let showMapComponent : ShowMap;
export let mapView: mapsModule.MapView;
export let marker: mapsModule.Marker;

export function showMapLoaded(args: EventData) {
	showMapComponent = args.object as ShowMap;
	showMapComponent.bindingContext = showMapModel;
}

export function onMapReady(args: EventData) {
	mapView = args.object as mapsModule.MapView;
	marker = new mapsModule.Marker();
	setMarkerPosition(0,0);
	mapView.addMarker(marker);

    mapView.settings.zoomGesturesEnabled = true;
	mapView.settings.tiltGesturesEnabled = true;
	mapView.mapAnimationsEnabled = true;
    mapView.zoom = 10;
}

export function onMarkerSelect(args: EventData) { }

export function bypassTap(args: TouchGestureEventData) { }

export function showShowMap(message) {
	try {
		firebase.firestore.collection('users').doc(message.user_by).onSnapshot( user => {
			const userData = {
				id: message.user_by,
				...user.data()
			} as Profile;

			showMapModel.set('user_name', `${userData.firstname} ${userData.lastname}`);
			const { latitude, longitude } = getLocationCoordinates(message);
			setLocationOnMap(latitude, longitude);
			setMarkerPosition(latitude, longitude);

			showMapComponent.visibility = 'visible';
			showMapComponent.animate({
				opacity: 1,
				duration: 300,
				curve: AnimationCurve.easeIn
			});
		});
	} catch( error ) {
		console.log(error);
	}
}

export function hideShowMap(args: EventData) {
	showMapComponent.animate({
		opacity: 0,
		duration: 300,
		curve: AnimationCurve.easeIn
	}).then(() => {
		showMapComponent.visibility = 'collapse';
		showMapModel.set('user_name', null);
		showMapModel.set('body', null);
	});
}

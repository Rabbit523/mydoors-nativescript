import { GridLayout, TouchGestureEventData } from "tns-core-modules/ui";
import { fromObject, EventData } from "tns-core-modules/data/observable/observable";
import * as firebase from 'nativescript-plugin-firebase';
import { Profile } from "~/shared/models/user";
import { AnimationCurve } from "tns-core-modules/ui/enums/enums";

export class ViewPhotoModal extends GridLayout {
	user_name: string = null;
	body: string = null;
}

let viewPhotoComponent : ViewPhotoModal;

export let viewPhotoModalModel = fromObject(new ViewPhotoModal());

export function viewPhotoLoaded(args: EventData) {
	viewPhotoComponent = args.object as ViewPhotoModal;
	viewPhotoComponent.bindingContext = viewPhotoModalModel;
}

export function bypassTap(args: TouchGestureEventData) { }

export function showViewPhoto(message) {
	try {
		firebase.firestore.collection('users').doc(message.user_by).onSnapshot( user => {
			const userData = {
				id: message.user_by,
				...user.data()
			} as Profile;

			viewPhotoModalModel.set('user_name', `${userData.firstname} ${userData.lastname}`);
			viewPhotoModalModel.set('body', message.body);

			viewPhotoComponent.visibility = 'visible';
			viewPhotoComponent.animate({
				opacity: 1,
				duration: 300,
				curve: AnimationCurve.easeIn
			});
		});
	} catch( error ) {
		console.log(error);
	}
}

export function hideViewPhoto(args: EventData) {
	viewPhotoComponent.animate({
		opacity: 0,
		duration: 300,
		curve: AnimationCurve.easeIn
	}).then(() => {
		viewPhotoComponent.visibility = 'collapse';
		viewPhotoModalModel.set('user_name', null);
		viewPhotoModalModel.set('body', null);
	});
}

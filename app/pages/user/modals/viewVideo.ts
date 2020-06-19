import { EventData } from "tns-core-modules/ui/page/page";
import { GridLayout, TouchGestureEventData } from "tns-core-modules/ui";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { Video } from 'nativescript-exoplayer';
import { AnimationCurve } from "tns-core-modules/ui/enums/enums";
import { Profile } from "~/shared/models/user";
import * as firebase from 'nativescript-plugin-firebase';

export class ViewVideo extends GridLayout {
	user_name: string = null;
	body: string = null;
}

export const viewVideoModel = fromObject( new ViewVideo() );

export let viewVideoComponent: ViewVideo;


export function viewVideoLoaded(args: EventData) {
	viewVideoComponent = args.object as ViewVideo;
	viewVideoComponent.bindingContext = viewVideoModel;

	const videoplayer: Video = viewVideoComponent.getViewById('nativeVideoPlayer');

	console.log(videoplayer.isLoaded);
	console.log(videoplayer.src);
}

export function bypassTap(args: TouchGestureEventData) { }

export function showViewVideo(message) {
	try {
		firebase.firestore.collection('users').doc(message.user_by).onSnapshot( user => {
			const userData = {
				id: message.user_by,
				...user.data()
			} as Profile;

			viewVideoModel.set('user_name', `${userData.firstname} ${userData.lastname}`);
			viewVideoModel.set('body', message.body);

			viewVideoComponent.visibility = 'visible';
			viewVideoComponent.animate({
				opacity: 1,
				duration: 300,
				curve: AnimationCurve.easeIn
			});
		});
	} catch( error ) {
		console.log(error);
	}
}

export function hideViewVideo(args: EventData) {
	viewVideoComponent.animate({
		opacity: 0,
		duration: 300,
		curve: AnimationCurve.easeIn
	}).then(() => {
		viewVideoComponent.visibility = 'collapse';
		viewVideoModel.set('user_name', null);
		viewVideoModel.set('body', null);
	});
}



import { TouchGestureEventData, GridLayout } from "tns-core-modules/ui";
import { EventData } from "tns-core-modules/ui/page/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { AnimationCurve } from "tns-core-modules/ui/enums/enums";

import * as firebase from 'nativescript-plugin-firebase';
import { Profile } from "~/shared/models/user";


export class ReadMessageModal extends GridLayout {
	user_name: string = null;
	body: string = null;
}

export const ReadMessageModalModel = fromObject(new ReadMessageModal());

let readMessageModal: ReadMessageModal;

export function readMessageLoaded(args: EventData) {
	readMessageModal = args.object as ReadMessageModal;
	readMessageModal.bindingContext = ReadMessageModalModel;
}

export function bypassTap(args: TouchGestureEventData) { }

export function showReadMessage(message) {
	try {
		firebase.firestore.collection('users').doc(message.user_by).onSnapshot( user => {
			const userData = {
				id: message.user_by,
				...user.data()
			} as Profile;

			ReadMessageModalModel.set('user_name', `${userData.firstname} ${userData.lastname}`);
			ReadMessageModalModel.set('body', message.body);

			readMessageModal.visibility = 'visible';
			readMessageModal.animate({
				opacity: 1,
				duration: 300,
				curve: AnimationCurve.easeIn
			});
		});
	} catch( error ) {
		console.log(error);
	}
}

export function hideReadMessage(args: EventData) {
	readMessageModal.animate({
		opacity: 0,
		duration: 300,
		curve: AnimationCurve.easeIn
	}).then(() => {
		readMessageModal.visibility = 'collapse';
		ReadMessageModalModel.set('user_name', null);
		ReadMessageModalModel.set('body', null);
	});
}

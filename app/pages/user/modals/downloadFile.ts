import * as firebase from 'nativescript-plugin-firebase';
import { Downloader, ProgressEventData, DownloadEventData } from 'nativescript-downloader';
import { EventData } from 'tns-core-modules/ui/page/page';
import { GridLayout, TouchGestureEventData } from 'tns-core-modules/ui';
import { fromObject } from 'tns-core-modules/data/observable/observable';
import { AnimationCurve } from 'tns-core-modules/ui/enums/enums';
import { Profile } from '~/shared/models/user';
import { knownFolders } from 'tns-core-modules/file-system/file-system';
const downloader = new Downloader();

export class DownloadFile extends GridLayout {
	user_name: string = null;
	body: string = null;
}

export let downloadFileModel = fromObject(new DownloadFile());

export let downloadFileComponent: DownloadFile;

export function downloadFileLoaded(args: EventData) {
	downloadFileComponent = args.object as DownloadFile;
	downloadFileComponent.bindingContext = downloadFileModel;
}

export function downloadAttachedFile() {
	// const imageDownloaderId = downloader.createDownload({ url: downloadFileModel.get('body') });
	const imageDownloaderId = downloader.createDownload({
		url: 'https://images.wallpaperscraft.com/image/city_tower_dawn_167312_1280x720.jpg',
		path: knownFolders.documents().getFolder('Download').path
	});
	downloader
		.start(imageDownloaderId, (progressData: ProgressEventData) => {
			console.log(`Progress : ${progressData.value}%`);
			console.log(`Current Size : ${progressData.currentSize}%`);
			console.log(`Total Size : ${progressData.totalSize}%`);
			console.log(`Download Speed in bytes : ${progressData.speed}%`);
		})
		.then((completed: DownloadEventData) => {
			console.log(`Image : ${completed.path}`);
		})
		.catch(error => {
			console.log(error.message);
		});
}

export function bypassTap(args: TouchGestureEventData) { }

export function showDownloadFile(message) {
	try {
		firebase.firestore.collection('users').doc(message.user_by).onSnapshot( user => {
			const userData = {
				id: message.user_by,
				...user.data()
			} as Profile;

			downloadFileModel.set('user_name', `${userData.firstname} ${userData.lastname}`);
			downloadFileModel.set('body', message.body);

			downloadFileComponent.visibility = 'visible';
			downloadFileComponent.animate({
				opacity: 1,
				duration: 300,
				curve: AnimationCurve.easeIn
			});
		});
	} catch( error ) {
		console.log(error);
	}
}

export function hideDownloadFile(args: EventData) {
	downloadFileComponent.animate({
		opacity: 0,
		duration: 300,
		curve: AnimationCurve.easeIn
	}).then(() => {
		downloadFileComponent.visibility = 'collapse';
		downloadFileModel.set('user_name', null);
		downloadFileModel.set('body', null);
	});
}

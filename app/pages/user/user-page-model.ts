import * as app from "tns-core-modules/platform";
import * as firebase from 'nativescript-plugin-firebase';
import * as geolocation from 'nativescript-geolocation';
import { Observable, EventData } from "tns-core-modules/data/observable";
import { User, UserService, Profile } from "~/shared/models/user";
import { Button, Page, FlexboxLayout, Image, Frame } from "tns-core-modules/ui";
import { messageService, Message } from "~/shared/models/message";
import { openPergamena, closePergamena, pergamenaData } from "./modals/pergamena";
import { Color, View, NavigatedData } from "tns-core-modules/ui/page/page";
import { Label } from 'tns-core-modules/ui/label';
import { tapAction } from "./parts/action";
import { showRecModal } from "./modals/audiorecording";
import { takePhoto, sendNotification, saveToRemoteFile } from "~/shared/utils";
import { ImageAsset } from "tns-core-modules/image-asset/image-asset";
import { Action } from './parts/action';

import { Mediafilepicker, VideoPickerOptions, FilePickerOptions, ImagePickerOptions } from 'nativescript-mediafilepicker';
import { showReadMessage } from "./modals/readMessage";
import { showViewPhoto } from "./modals/viewPhoto";
import { showViewVideo } from "./modals/viewVideo";
import { showDownloadFile } from "./modals/downloadFile";
import { ObservableProperty } from "~/observable-property-decorator";
import { Accuracy } from "tns-core-modules/ui/enums/enums";
import { showShowMap } from "./modals/showMap";
import { openAddUserModal } from "./modals/addUserModal";
import { hideMainLoader } from "~/components/main_loader/main_loader";


export class UserPageModel extends Observable {

	private msgService: messageService;

	private me: Profile;

	@ObservableProperty() nextDoor_id: string;
	@ObservableProperty() nextDoor_name: string;
	@ObservableProperty() nextDoor_color: string;
	@ObservableProperty() message_modal: boolean;
	@ObservableProperty() user: User;
	@ObservableProperty() door_id: number;
	@ObservableProperty() door_name: string;
	@ObservableProperty() door_color: string;
	@ObservableProperty() is_mistery: boolean;
	@ObservableProperty() messageData: string;
	@ObservableProperty() isLoading: boolean;

	@ObservableProperty() pergamena_icon : string;
	@ObservableProperty() pergamena_color : string;

	public notifications = {
		text: [],
		video: [],
		photo: [],
		pergamena: [],
		attachedfile: [],
		audio: [],
		sharecontact: [],
		geolocation: []
	};

	constructor(ctx) {
		super();

		this.msgService = new messageService();

		this.init(ctx);
	}

	private async init(ctx) {
		console.log(ctx.nextDoor_id);
		this.nextDoor_id = ctx.nextDoor_id;
		this.nextDoor_name = ctx.nextDoor_name;
		this.nextDoor_color = ctx.nextDoor_color;
		this.message_modal = false;
		this.user = ctx.user;
		this.door_id = ctx.door_id;
		this.door_name = ctx.door_name;
		this.door_color = ctx.door_color;
		this.is_mistery = ctx.is_mistery;
		this.messageData = null;
		this.isLoading = false;
		// console.log('USER:', JSON.stringify(this.user));

		let usrService = new UserService();
		this.me = await usrService.getUserData();
	}

	public bypassTap () {}

	public async navigatedTo(args: NavigatedData) {
		const messages = await this.msgService.getMessagesFromUser(this.user.id);
		const page = <Page>args.object;
		try {
			for (const msg of messages) {
				if(['pergamena', 'trillo'].indexOf(msg.type) > -1) continue;
				this.notifications[msg.type].push(msg);
				const action = <Action>page.getViewById(msg.type + 'Action');
				const act_notif : Label = action.getViewById('action_notifs');
				act_notif.text = this.notifications[msg.type].length.toString();
			}
			// console.dir(this.notifications);
		} catch (error) {
			console.log(error);
		}
		hideMainLoader();
	}

	public openAddUserModal(args: EventData) {
		if(this.isLoading) return;
		openAddUserModal(args);
	}

	public openMessageModal(args: EventData) {
		if(this.isLoading) return;
		tapAction(args)
			.then( status => {
				if(!status) {
					showReadMessage(this.notifications.text[0]);
					this.readedMessage(this.notifications.text[0]);
					this.notifications.text.splice(0,1);
					return;
				}
				const btn = <Button>args.object;
				const page: Page = btn.page;
				const messageModal: FlexboxLayout = page.getViewById("messageModal");
				this.message_modal = true;
				messageModal.animate({
					opacity: 1,
					duration: 300
				});
			});
	}

	public closeMessageModal(args: EventData) {
		const btn = <Button>args.object;
		const page: Page = btn.page;
		const messageModal: FlexboxLayout = page.getViewById("messageModal");
		messageModal.animate({
			opacity: 0,
			duration: 300
		}).then(() => {
			this.message_modal = false;
		});
	}

	public onFocusMessageBox(args: EventData) {
		const component = args.object as View;
		const page : Page = component.page;
		const messageModalComponent : FlexboxLayout = page.getViewById('messageModal');
		messageModalComponent.paddingTop = 30;
	}

	public onBlurMessageBox(args: EventData) {
		const component = args.object as View;
		const page : Page = component.page;
		const messageModalComponent : FlexboxLayout = page.getViewById('messageModal');
		messageModalComponent.paddingTop = 130;
	}

	public openPergamenaModal(args: EventData) {
		if(this.isLoading) return;
		console.log('test audio');
		tapAction(args)
			.then( status => {
				if(!status) return;
				openPergamena(args);
			});
	}

	public openRecordingModal(args: EventData) {
		// https://github.com/jibon57/nativescript-mediafilepicker
		// https://github.com/nstudio/nativescript-audio
		tapAction(args)
			.then( status => {
				if(!status) {
					console.dir(this.notifications.audio);
					showRecModal(args, true, this.notifications.audio[0].body);
					// this.readedMessage(this.notifications.audio[0]);
					// this.notifications.audio.splice(0,1);
					return;
				}
				showRecModal(args);
			})
	}

	private toSendMessage() : Promise<any> {

		const tmpMessage = new Message();

		tmpMessage.user_by = UserService._uid;
		tmpMessage.user_to = this.user.id;
		tmpMessage.type = 'text';
		tmpMessage.body = this.messageData;

		this.messageData = null;

		return this.msgService.addMessage(tmpMessage);
	}

	private toSendNotification(title: string, body: string, data?: any) {
		for (const token of this.user.fcm_tokens) {
			sendNotification(token, title, body, data);
		}
	}

	public sendMessage(args: EventData) {

		if(!this.messageData) return;
		this.toSendMessage()
			.then(() => {
				this.toSendNotification('Nuovo messaggio!', `Hai ricevuto un messaggio da ${this.me.firstname} ${this.me.lastname}`);
				return ;
			})
			.then(() => {
				this.closeMessageModal(args);
			})
			.catch(err => {
				console.log('ERRORE INVIO MESSAGGIO', err);
			});
	}

	public setPergamenaIcon(args) {
		const value = args.object.value;
		this.pergamena_icon = value;

		const img = args.object as Image;
		const parent = img.parent;

		parent.eachChild( (el) => {
			if(el.typeName != 'Image') return !!el;
			el.style.borderWidth = 1;
			el.style.backgroundColor = new Color('transparent');
			el.style.borderColor = new Color('transparent');
			return !!el;
		});

		img.style.borderWidth = 1;
		img.style.backgroundColor = new Color('white');
		img.style.borderColor = new Color('#FF9955');

	}

	public setPergamenaColor(args) {
		const value = args.object.value;
		this.pergamena_color = value;

		const checkbox = args.object as View;
		const parent = checkbox.parent;

		parent.eachChild( (el) => {
			if(el.typeName != 'FlexboxLayout') return !!el;
			let tmpClassList = Array.from(el.cssClasses.values());
			if(tmpClassList.indexOf('checked') >= 0) return !!el;
			el.cssClasses.delete('checked');
			(el.getViewById('check_box') as View).backgroundColor = new Color('white');
			return !!el;
		});

		checkbox.cssClasses.delete('checked');
		(checkbox.getViewById('check_box') as View).backgroundColor = new Color('#dc6366');
	}

	public sendPergamena(args: EventData) {
		if(this.pergamena_icon == null || this.pergamena_color == null) return;
		const tmpMessage = new Message();

		tmpMessage.user_by = null;
		tmpMessage.user_to = this.user.id;
		tmpMessage.type = 'pergamena';
		tmpMessage.body = `${this.pergamena_icon}|${this.pergamena_color}|Anonimo ti ha inviato ${pergamenaData.icons[this.pergamena_icon]} con indizio ${pergamenaData.colors[this.pergamena_color]}`;

		this.msgService.addMessage(tmpMessage).then(() => {
			this.pergamena_icon = null;
			this.pergamena_color = null;

			closePergamena(args);
			this.toSendNotification(
				'Una pergamena!',
				'Qualcuno ti ha inviato un indizio con una pergamena!',
				{ type: 'pergamena' }
			);

			alert({
				title: 'Fatto',
				message: "Pergamena inviata con successo",
				okButtonText: "OK"
			});
		});

	}

	public sendTrillo(args: EventData) {
		if(this.isLoading) return;
		tapAction(args)
			.then(status => {
				if(!status) return;
				this.toSendNotification('Sveglia!', `${this.me.firstname} ${this.me.lastname} ti sta cercando!`, {has_trillo: true});
			})
			.then(() => {
				alert({
					title: "Fatto",
					message: "Trillo inviato correttamente",
					okButtonText: "OK"
				});
			})
			.catch( err => {
				console.log('errore', err);
			})
	}

	public sendPhoto(args: EventData) {
		if(this.isLoading) return;
		tapAction(args)
			.then(status => {
				if(!status) {
					showViewPhoto(this.notifications.photo[0]);
					this.readedMessage(this.notifications.photo[0]);
					this.notifications.photo.splice(0,1);
					return;
				}

				let options: ImagePickerOptions = {
					android: {
						isCaptureMood: false,
						isNeedCamera: true,
						maxNumberFiles: 1,
						isNeedFolderList: true
					}, ios: {
						isCaptureMood: false,
						isNeedCamera: true,
						maxNumberFiles: 1
					}
				};

				let mediafilepicker = new Mediafilepicker();
				mediafilepicker.openImagePicker(options);

				mediafilepicker.on("getFiles", res => {
					let results = res.object.get('results');
					let file_path : string = results[0].file;
					let file_name = file_path.split('/')[file_path.split('/').length - 1];
					let remote_path = `uploads/messages/video/${this.user.id}/${file_name}`;

					this.isLoading = true;

					saveToRemoteFile(remote_path, file_path, 'image/jpg')
						.then( url => {
							console.log("Remote URL: " + url);
							return this.msgService.addMessage({
								user_by: UserService._uid,
								user_to: this.user.id,
								type: 'photo',
								body: url
							})
						})
						.then( () => {
							this.toSendNotification(
								'Ti hanno inviato una foto!',
								`${this.me.firstname} ${this.me.lastname} ti ha inviato una foto!`,
								{ type: 'photo' }
							);
						})
						.then( () => {
							this.isLoading = false;
							alert({
								title: "Fatto",
								message: "Foto inviata correttamente",
								okButtonText: "OK"
							});
						})
						.catch( err => {
							console.log('errore invio messaggio', err);
							this.isLoading = false;
						})
				});

				// for iOS iCloud downloading status
				mediafilepicker.on("exportStatus", res => {
					let msg = res.object.get('msg');
					console.log(msg);
				});

				mediafilepicker.on("error", res => {
					let msg = res.object.get('msg');
					console.log(msg);
					this.isLoading = false;
				});

				mediafilepicker.on("cancel", res => {
					let msg = res.object.get('msg');
					console.log(msg);
					this.isLoading = false;
				});
				// BACKUP in utils.ts:97
			})
			.catch( err => {
				console.log('errore', err);
			})
	}

	public openFileToShare(args: EventData) {
		if(this.isLoading) return;
		tapAction(args)
			.then(status => {
				if(!status) {
					showDownloadFile(this.notifications.attachedfile[0]);
					this.readedMessage(this.notifications.attachedfile[0]);
					this.notifications.attachedfile.splice(0,1);
					return;
				}
				this.isLoading = true;
				let extensions = [];

				if (app.isIOS) {
					// extensions = [kUTTypePDF, kUTTypeText]; // you can get more types from here: https://developer.apple.com/documentation/mobilecoreservices/uttype
				} else {
					extensions = ['txt', 'pdf', 'epub', 'zip'];
				}

				let options: FilePickerOptions = {
					android: {
						extensions: extensions,
						maxNumberFiles: 1
					},
					ios: {
						extensions: extensions,
						multipleSelection: true
					}
				};

				let mediafilepicker = new Mediafilepicker();
				mediafilepicker.openFilePicker(options);

				mediafilepicker.on("getFiles", res => {
					let results = res.object.get('results');
					let file_path : string = results[0].file;
					let file_name = file_path.split('/')[file_path.split('/').length - 1];
					let remote_path = `uploads/messages/attachedfile/${this.user.id}/${file_name}`;

					let contentType = 'text/plain';
					switch (file_name.split('.')[1]) {
						case 'txt':
							contentType = 'text/plain';
							break;
						case 'pdf':
							contentType = 'application/pdf';
							break;
						case 'epub':
							contentType = 'application/epub+zip';
							break;
						case 'zip':
							contentType = 'application/zip';
							break;
						default:
							contentType = 'application/octet-stream';
							break;
					}

					saveToRemoteFile(remote_path, file_path, contentType)
						.then( url => {
							console.log("Remote URL: " + url);
							return this.msgService.addMessage({
								user_by: UserService._uid,
								user_to: this.user.id,
								type: 'attachedfile',
								body: url
							})
						})
						.then( () => {
							this.toSendNotification(
								'Ti hanno inviato un file!',
								`${this.me.firstname} ${this.me.lastname} ti ha inviato un file!`,
								{ type: 'attachedfile' }
							);
						})
						.then( () => {
							this.isLoading = false;
							alert({
								title: "Fatto",
								message: "File inviato correttamente",
								okButtonText: "OK"
							});
						})
						.catch( err => {
							console.log('errore invio messaggio', err);
						})
				});

				mediafilepicker.on("error", res => {
					let msg = res.object.get('msg');
					console.log(msg);
					this.isLoading = false;
				});

				mediafilepicker.on("cancel", res => {
					let msg = res.object.get('msg');
					console.log(msg);
					this.isLoading = false;
				});
			})
			.catch( err => {
				console.log('errore', err);
			});
	}

	public sendVideo(args: EventData) {
		if(this.isLoading) return;
		tapAction(args)
			.then(status => {
				if(!status) {
					showViewVideo(this.notifications.video[0]);
					this.readedMessage(this.notifications.video[0]);
					this.notifications.video.splice(0,1);
					return;
				}
				this.isLoading = true;

				// let allowedVideoQualities = [];

				// if (app.ios) {
				// 	allowedVideoQualities = [AVCaptureSessionPreset1920x1080, AVCaptureSessionPresetHigh];  // get more from here: https://developer.apple.com/documentation/avfoundation/avcapturesessionpreset?language=objc
				// }

				let options: VideoPickerOptions = {
					android: {
						isCaptureMood: false, // if true then camera will open directly.
						isNeedCamera: true,
						maxNumberFiles: 1,
						isNeedFolderList: true,
						maxDuration: 20,

					},
					// ios: {
					// 	isCaptureMood: false, // if true then camera will open directly.
					// 	videoMaximumDuration: 10,
					// 	allowedVideoQualities: allowedVideoQualities
					// }
				};

				let mediafilepicker = new Mediafilepicker();
				mediafilepicker.openVideoPicker(options);

				mediafilepicker.on("getFiles", res => {
					let results = res.object.get('results');
					let file_path : string = results[0].file;
					let file_name = file_path.split('/')[file_path.split('/').length - 1];
					let remote_path = `uploads/messages/video/${this.user.id}/${file_name}`;

					let contentType = 'application/octet-stream';
					switch (file_name.split('.')[1]) {
						case 'avi':
							contentType = 'video/x-msvideo';
							break;
						case 'mpeg':
							contentType = 'video/mpeg';
							break;
						case 'ogv':
							contentType = 'video/ogg';
							break;
						case 'webm':
							contentType = 'video/webm';
							break;
						default:
							contentType = 'application/octet-stream';
							break;
					}

					saveToRemoteFile(remote_path, file_path, contentType)
						.then( url => {
							console.log("Remote URL: " + url);
							return this.msgService.addMessage({
								user_by: UserService._uid,
								user_to: this.user.id,
								type: 'video',
								body: url
							})
						})
						.then( () => {
							this.toSendNotification(
								'Ti hanno inviato un video!',
								`${this.me.firstname} ${this.me.lastname} ti ha inviato un video!`,
								{ type: 'video' }
							);
						})
						.then( () => {
							this.isLoading = false;
							alert({
								title: "Fatto",
								message: "Video inviato correttamente",
								okButtonText: "OK"
							});
						})
						.catch( err => {
							console.log('errore invio messaggio', err);
						})
				});

				// for iOS iCloud downloading status
				mediafilepicker.on("exportStatus", res => {
					let msg = res.object.get('msg');
					console.log(msg);
					this.isLoading = false;
				});

				mediafilepicker.on("error", res => {
					let msg = res.object.get('msg');
					console.log(msg);
					this.isLoading = false;
				});

				mediafilepicker.on("cancel", res => {
					let msg = res.object.get('msg');
					console.log(msg);
					this.isLoading = false;
				});
			})
			.catch( err => {
				console.log('errore', err);
			});
	}

	public readedMessage(message: Message) {
		// if(message.type != 'text') this.deleteFile(message.body);
		try {
			if( ['text', 'geolocation'].indexOf(message.type) == -1 ) this.deleteFile(message.body);
			this.msgService.removeMessage(message.id);
		} catch (error) {
			console.log('errore readedMessage:', message);
		}
	}

	public deleteFile(path) : Promise<void> {
		return firebase.storage.deleteFile({
			remoteFullPath: path
		});
	}

	public shareContact(args) {
		tapAction(args)
			.then(status => {
				if(!status) {
					const sharedUser = JSON.parse(this.notifications.sharecontact[0].body);
					this.readedMessage(this.notifications.sharecontact[0]);
					this.notifications.sharecontact.splice(0,1);
					Frame.topmost().navigate({
						moduleName: 'pages/user/user-page',
						context: {
							user: sharedUser,
							door_id: 'mistery',
							door_color: '~/images/misterydoor.png',
							door_name: 'Mistery Door',
							is_mistery: true
						}
					});
					return;
				}

				Frame.topmost().navigate({
					moduleName: 'pages/search/search-page',
					context: {
						user: this.user
					}
				});
			})
			.catch(err => {
				console.log('Errore shareContact', err);
			})
	}

	public sharePosition(args: EventData) {

		tapAction(args)
			.then(status => {
				if(!status) {
					showShowMap(this.notifications.geolocation[0]);
					this.readedMessage(this.notifications.geolocation[0]);
					this.notifications.geolocation.splice(0,1);
					return;
				}

				geolocation.enableLocationRequest()
					.then(() => geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high, maximumAge: 5000, timeout: 20000 }) )
					.then( (currentLocation: geolocation.Location) => {
						console.log('latitude:', currentLocation.latitude);
						console.log('longitude:', currentLocation.longitude);
						return this.msgService.addMessage({
							user_by: UserService._uid,
							user_to: this.user.id,
							type: 'geolocation',
							body: `${currentLocation.latitude}|${currentLocation.longitude}`,
						})
					})
					.then(() => {
						this.toSendNotification('Posizione', `${this.me.firstname} ${this.me.lastname} ti ha condiviso una posizione!`);
						alert({
							title: "Fatto",
							message: "Posizione inviata correttamente",
							okButtonText: "OK"
						});
					})
					.catch( err => {
						console.log('errore geolocalizzazione', err);
					});
			})
			.catch( err => {
				console.log('errore geolocalizzazione', err);
			});
	}

	public test() {
		console.log('testing');
	}
}

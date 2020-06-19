import * as platform from 'tns-core-modules/platform';
import * as firebase from 'nativescript-plugin-firebase';
import { Observable, EventData } from "tns-core-modules/data/observable";
import { Button, Page, Image } from "tns-core-modules/ui";

import { UserService, Profile } from "~/shared/models/user";
import { takePhoto } from "~/shared/utils";
import { ImageAsset } from 'tns-core-modules/image-asset/image-asset';
import { ObservableProperty } from '~/observable-property-decorator';
import { ImagePickerOptions, Mediafilepicker } from 'nativescript-mediafilepicker';
import { showMainLoader } from '~/components/main_loader/main_loader';


const usrService : UserService = new UserService();
export class EditPageModel extends Observable {

	private id : string; // ID dell'utente loggato
	private avatarChanged : boolean;

	@ObservableProperty() firstname: string;
	@ObservableProperty() lastname: string;
	@ObservableProperty() username: string;
	@ObservableProperty() email: string;
	@ObservableProperty() avatar: string;
	@ObservableProperty() password: string;
	@ObservableProperty() gender: boolean;
	@ObservableProperty() birthdate: string;

	constructor(private currentUser?: Profile) {
		super();
		if(this.currentUser) {
			this.id = this.currentUser.id;
			this.firstname = this.currentUser.firstname;
			this.lastname = this.currentUser.lastname;
			this.username = this.currentUser.username;
			this.email = this.currentUser.email;
			this.avatar = this.currentUser.avatar;
			this.gender = this.currentUser.gender === 'F';
			this.birthdate = this.currentUser.birthdate;
		}
		this.password = null;
		this.avatarChanged = false;
	}

	public get getAvatar() : string {
		return this.avatar ?
			this.avatar :
			!this.gender ?
				'~/images/avatars/male.png' :
				'~/images/avatars/female.png';
	}

	public onSubmit(args: EventData) {
		const button = <Button>args.object;
		const page : Page = button.page;

		const tmp = {
			firstname: this.firstname,
			lastname: this.lastname,
			username: this.username,
			email: this.email,
			avatar: this.avatar,
			password: this.password,
			gender: this.gender ? 'F' : 'M',
			birthdate: this.birthdate,
		};

		showMainLoader();

		if(this.avatarChanged) {
			let file_path : string = this.avatar;
			let file_name = file_path.split('/')[file_path.split('/').length - 1];
			let remote_path = `uploads/profile/${this.id}/${file_name}`;

			firebase.storage.uploadFile({
				remoteFullPath: remote_path,
				localFullPath: file_path,
				metadata: {
					contentType: 'image/jpg',
					contentLanguage: 'it'
				}
			})
			.then( uploadedFile => {
					console.log("File uploaded: " + JSON.stringify(uploadedFile));
					firebase.storage.getDownloadUrl({
						// bucket: uploadedFile.bucket,
						remoteFullPath: remote_path
					})
					.then( url => {
							console.log("Remote URL: " + url);
							tmp.avatar = url;
							console.log(tmp.avatar);
							this.updateUser(tmp, page);
						})
						.catch( error => {
							console.log("Error: " + error);
						});
				})
				.catch( err => {
					console.log('errore upload firebase', err);
				});
		} else {
			this.updateUser(tmp, page);
		}
	}

	private updateUser(data, page) {
		usrService.updateUserData(data)
			.then(res => {
				console.log('utente aggiornato:', JSON.stringify(res));
				try {
					page.frame.navigate('pages/home/home-page');
				} catch (error) {
					console.log('errore navigazione', error);
				}
			})
			.catch(err => {
				console.log('errore', err);
			});
	}

	public editAvatarImage(args: EventData) {

		const imageAvatar = args.object as Image;

		this.takeThePhoto((path, err) => {
			if(err) {
				console.log(err);
				return;
			}
			imageAvatar.src = path;
			this.avatar = path;
			this.avatarChanged = true;
		});
	}

	private takeThePhoto(callback: (path: string, err?: any) => void) : void {
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
			callback(file_path);
		});

		// for iOS iCloud downloading status
		mediafilepicker.on("exportStatus", res => {
			let msg = res.object.get('msg');
			console.log(msg);
		});

		mediafilepicker.on("error", res => {
			let msg = res.object.get('msg');
			console.log(msg);
			callback(null, msg);
		});

		mediafilepicker.on("cancel", res => {
			let msg = res.object.get('msg');
			console.log(msg);
		});
	}
}

import {Observable, EventData} from 'tns-core-modules/data/observable';
import { Page } from 'tns-core-modules/ui/page/page';
import { Frame, topmost } from 'tns-core-modules/ui/frame/frame';
import { Button } from 'tns-core-modules/ui';
import * as as from "tns-core-modules/application-settings";
import * as dialog from "tns-core-modules/ui/dialogs";
import * as firebase from "nativescript-plugin-firebase";
import { firestore } from 'nativescript-plugin-firebase/app';
import { ObservableProperty } from '~/observable-property-decorator';
import { UserService } from '~/shared/models/user';
import { showMainLoader, hideMainLoader } from '~/components/main_loader/main_loader';


export class LoginViewModel extends Observable {

	private UID: string;
	@ObservableProperty() phone: string;
	@ObservableProperty() code: string;
	@ObservableProperty() showCode: boolean;

	constructor() {
		super();
		this.phone = null;
		// this.phone = '+393662303841';
		this.code = null;
		this.showCode = false;
	}

	public onSubmit(args: EventData) {
		showMainLoader();
		const button = <Button>args.object;
		const page : Page = button.page;
		const secondButton : Button = page.getViewById('confirmCode');
		const frame : Frame = page.frame;
		let tmpPhone: string = this.phone;

		console.log(tmpPhone);

		firebase["requestPhoneAuthVerificationCode"] = ( onUserResponse: (phoneAuthVerificationCode: string) => void, verificationPrompt: string) => {

			this.showCode = true;
			hideMainLoader();

			secondButton.on('tap', (args: EventData) => {
				if(!this.code) {
					dialog.alert({
						title: 'Attenzione',
						message: 'Non è stato inserito alcun codice',
						okButtonText: 'ok'
					});
					return;
				}

				showMainLoader();
				onUserResponse(this.code);
			})
		}

		firebase.login({
			type: firebase.LoginType.PHONE,
			phoneOptions: {
				phoneNumber: tmpPhone,
			}
		})
			.then( res => {

				this.UID = res.uid;

				return firestore().collection('users').doc(this.UID).get()
					.then( doc => {
						if (doc.exists) {
							console.log('Utente già registrato:');
							console.dir(doc.data());
							as.setString('md_token', this.UID);
							UserService._uid = this.UID;
						} else {
							console.log("Nuovo utente!");
							firestore().collection('users').doc(this.UID).set(JSON.parse(as.getString('md_tmpDataRegister')));
						}
					});
			})
			.then( () => {
				firebase.addOnPushTokenReceivedCallback(token => {
					console.log('FCM Token:', token);
					firestore().collection('users').doc(this.UID).update({ fcm_tokens: firebase.firestore.FieldValue.arrayUnion(token) })
					.then( () => {
						try {
							frame.navigate('pages/home/home-page');
						} catch (error) {
							console.log('errore navigazione home', error);
						}
					});
				});
			})
			.catch( err => {
				console.log('autenticazione non effettuata');
				console.dir(err);
				dialog.alert({
					title: 'Attenzione',
					message: 'Il codice inserito non è corretto!',
					okButtonText: 'ok'
				});
			});

	}

}

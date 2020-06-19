import { Observable, EventData, View } from "tns-core-modules/ui/page/page";
import { AudioRecording } from "~/shared/AudioRecording";
import { saveToRemoteFile, sendNotification } from "~/shared/utils";
import { isAndroid } from "tns-core-modules/platform";
import { messageService } from "~/shared/models/message";
import { UserService } from "~/shared/models/user";
import * as appSettings from 'tns-core-modules/application-settings';
import * as audio from "nativescript-audio";
import { ObservableProperty } from "~/observable-property-decorator";

export class AudioRecordingModel extends Observable {

	private audioRecording : AudioRecording;

	@ObservableProperty() status : string;
	@ObservableProperty() image : string;
	@ObservableProperty() audioPath : string;
	@ObservableProperty() is_listening : boolean;

	constructor(
		private component : View,
		private user_id : string,
		private msgService: messageService
	) {
		super();
		this.is_listening = false;
		this.audioRecording = new AudioRecording();
		this.audioPath = null;
		this.initData();
	}

	private initData() {
		this.status = 'init';
		this.image = '~/images/recs/rec_start.png';
	};

	public toAudioRecordingStart() {
		this.status = this.status == 'paused' || this.status == 'init' ? 'recording' : 'paused';
		this.image = this.status == 'paused' ? '~/images/recs/rec_play.png' : '~/images/recs/rec_pause.png';

		if(this.is_listening) {
			this.readAudio(this.audioPath);
			return;
		}

		if(this.status == 'paused') {
			this.audioRecording.pauseRecording();
		} else {
			this.audioRecording.startRecordingAudio();
		}
		console.log('test recording', this.status);
	}

	public close() {
		this.component.animate({
			opacity: 0,
			duration: 700
		}).then(() => {
			this.component.visibility = 'hidden';
		});
	}

	public toAudioRecordingStartCancel() {
		this.status = 'init';
		this.image = '~/images/recs/rec_start.png';
	}

	public toAudioRecordingStartConfirm() {
		this.status = 'done';
		this.image = '~/images/recs/rec_pause.png';
		this.audioRecording.stopRecording()
			.then( () => {
				console.log('confermato');
			})
			.catch( err => {});
	}

	public toAudioRecordingSend(args: EventData) {
		console.log('send data');
		let file_path : string = this.audioRecording.getFile();
		let file_name = file_path.split('/')[file_path.split('/').length - 1];
		let remote_path = `uploads/messages/audio/${this.user_id}/${file_name}`;
		saveToRemoteFile(remote_path, file_path, isAndroid ? 'audio/m4a' : 'audio/x-caf')
			.then( url => {
				console.log("Remote URL: " + url);
				return this.msgService.addMessage({
					user_by: UserService._uid,
					user_to: this.user_id,
					type: 'audio',
					body: url
				})
			})
			.then( () => {
				return sendNotification(
					appSettings.getString('fcm_token'),
					'Ti hanno inviato un audio!',
					'Qualcuno ti ha inviato un audio!',
					{ type: 'audio' }
				);
			})
			.then( () => {
				this.close();
				alert('audio inviato correttamente');
			})
			.catch( err => {
				console.log('errore invio messaggio', err);
			})
	}

	private readAudio(audioPath: string) {
		const player = new audio.TNSPlayer();
		const playerOptions = {
			audioFile: audioPath,
			loop: false,
			completeCallback: () => {
				this.initData();
				console.log('finished playing'); },
			errorCallback: (errorObject) => {
				this.initData();
				console.log(JSON.stringify(errorObject));
			},
			infoCallback: (args) => { console.log(JSON.stringify(args)); }
		};

		return player
			.playFromUrl(playerOptions)
			.then( res => {

				console.log('THEN:', res);
				return res;
			})
			.catch(err => {
				console.log('something went wrong...', err);
				throw err;
			});
	}
}

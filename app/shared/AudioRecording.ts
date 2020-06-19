import {
	AudioRecorder,
	AudioRecorderOptions
} from '@nstudio/nativescript-audio-recorder';
import { File, knownFolders } from 'tns-core-modules/file-system';
import { isAndroid } from 'tns-core-modules/platform';
import * as dialogs from 'tns-core-modules/ui/dialogs';

export class AudioRecording {
	private _recorder: AudioRecorder;
	private recordedAudioFile: string;

	constructor() {
		this._recorder = new AudioRecorder();
	}

	public startRecordingAudio() {
		if (!AudioRecorder.DEVICE_CAN_RECORD()) {
			console.log('crud, this device cannot record audio');
			return;
		}

		const audioFolder = knownFolders.currentApp().getFolder('audio');

		let androidFormat;
		let androidEncoder;
		if (isAndroid) {
			androidFormat = android.media.MediaRecorder.OutputFormat.MPEG_4;
			androidEncoder = android.media.MediaRecorder.AudioEncoder.AAC;
		}
		console.log('FORMATO AUDIO', androidFormat);
		const recorderOptions: AudioRecorderOptions = {
			filename: `${audioFolder.path}/recording.${isAndroid ? 'm4a' : 'caf'}`,

			format: androidFormat,

			encoder: androidEncoder,

			metering: true,

			infoCallback: infoObject => {
				console.log(JSON.stringify(infoObject));
			},

			errorCallback: errorObject => {
				console.log(JSON.stringify(errorObject));
			}
		};

		this._recorder
			.start(recorderOptions)
			.then(result => {
				console.log('recording has started', result);
			})
			.catch(err => {
				console.log('oh no, something is wrong and recording did not start', err);
			});
	}

	public pauseRecording() {
		this._recorder
			.pause()
			.then(result => {
				console.log('recording has been paused');
			})
			.catch(err => {
				console.log('recording could not be paused');
			});
	}

	public async stopRecording() {
		const stopResult = await this._recorder.stop().catch(err => {
			console.log('oh no recording did not stop correctly');
		});
		if (stopResult) {
			console.log('recording stopped successfully.');
		}
	}

	public getFile() {
		try {
			const audioFolder = knownFolders.currentApp().getFolder('audio');
			const recordedFile = audioFolder.getFile(
				`recording.${isAndroid ? 'm4a' : 'caf'}`
			);
			// console.log(JSON.stringify(recordedFile));
			// console.log('recording exists: ' + File.exists(recordedFile.path));
			this.recordedAudioFile = recordedFile.path;
			return recordedFile.path;
		} catch (ex) {
			console.log(ex);
		}
	}

	public async disposeRecorder() {
		const disposeResult = await this._recorder.dispose().catch(err => {
			dialogs.alert({
				message: `Dispose Error: ${err}`,
				okButtonText: 'Okay'
			});
		});
		console.log('disposeResult', disposeResult);
		this._recorder = new AudioRecorder();
	}
}

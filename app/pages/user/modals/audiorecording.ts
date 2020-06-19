import { EventData, View, Page } from "tns-core-modules/ui/page/page";
import { AudioRecordingModel } from "./audiorecording-model";
import { messageService } from "~/shared/models/message";

export class Recording extends View {
	status: string = 'init';
	image: string = '~/images/recs/rec_start.png';
	user_id: string;
	data: any;
}

let recModel : AudioRecordingModel;
const msgService : messageService = new messageService();

export function recModalLoaded(args: EventData) {
	const recComponent = args.object as Recording;
	const user_id = recComponent.user_id;
	recModel = new AudioRecordingModel(recComponent, user_id, msgService);
	recComponent.bindingContext = recModel;
}


export function showRecModal(args: EventData, is_listening: boolean = false, audio_path?: string) {
	recModel.audioPath = is_listening ? audio_path : null;
	recModel.is_listening = is_listening;
	const element = args.object as View;
	const page : Page = element.page;
	const recComponent = page.getViewById('recordingModal') as Recording;
	recComponent.visibility = 'visible';
	recComponent.animate({
		opacity: 1,
		duration: 700
	});
}

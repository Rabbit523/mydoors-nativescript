import { Observable, EventData } from "tns-core-modules/data/observable";
import { ObservableProperty } from "~/observable-property-decorator";
import { Message, messageService } from "~/shared/models/message";
import { UserService } from "~/shared/models/user";
import { Page, FlexboxLayout, AnimationDefinition, NavigatedData, Image, GridLayout } from "tns-core-modules/ui";
import { AnimationCurve } from "tns-core-modules/ui/enums/enums";
import { Door } from "~/shared/models/door";
import { openPergamena } from "./modals/pergamena";


export class HomePageModel extends Observable {

	@ObservableProperty() canAddDoor : boolean = true;
	@ObservableProperty() pergamena_notifs : number = 0;
	@ObservableProperty() pergamena_messages : Message[];
	@ObservableProperty() mistery_notifs: number = 0;
	@ObservableProperty() mistery_messages: Message[];

	private readPergamenaElement: FlexboxLayout;
	private misteryDoorElement: FlexboxLayout;

	constructor(
		private page: Page,
		private msgService: messageService,
		private usrService: UserService,
		private doorList: Door[]
	) {
		super();
		this.canAddDoor = this.doorList.length <= 3;
		this.initPergamena();
		this.initMisteryDoor();
	}

	private async initPergamena() {
		this.pergamena_messages = await this.msgService.getPergamenaMessages();
		console.dir(this.pergamena_messages);
		this.pergamena_notifs = this.pergamena_messages.length;
		this.readPergamenaElement = this.page.getViewById('readPergamena') as FlexboxLayout;
		if(this.pergamena_messages.length > 0) {
			this.openReadPergamenaIcon();
		}
	}

	private async initMisteryDoor() {
		this.mistery_messages = await this.msgService.getMessagesFromUnkowns();
		this.mistery_notifs = this.mistery_messages.length;
		this.misteryDoorElement = this.page.getViewById('misteryDoor') as FlexboxLayout;
		if(this.mistery_messages.length > 0) {
			this.openMisteryDoorIcon();
		}
	}

	private openReadPergamenaIcon() {
		this.readPergamenaElement.animate({
			translate: {x: 0, y: 0},
			opacity: 1,
			duration: 400,
			curve: AnimationCurve.easeInOut
		});
	}

	private closeReadPergamenaIcon() {
		this.readPergamenaElement.animate({
			translate: {x: 0, y: 160},
			opacity: 0,
			duration: 400,
			curve: AnimationCurve.easeInOut
		});
	}

	private openMisteryDoorIcon() {
		this.misteryDoorElement.animate({
			translate: {x: 0, y: 0},
			opacity: 1,
			duration: 400,
			curve: AnimationCurve.easeInOut
		});
	}

	private closeMisteryDoorIcon() {
		this.misteryDoorElement.animate({
			translate: {x: 0, y: 160},
			opacity: 0,
			duration: 400,
			curve: AnimationCurve.easeInOut
		});
	}

	public openPergamena(args: EventData) {
		openPergamena(this.pergamena_messages[0])
			.then( () => {
				console.log('test');
				this.pergamena_notifs--;
				console.log(this.pergamena_notifs);
				this.msgService.removeMessage(this.pergamena_messages[0].id);
				this.pergamena_messages.splice(0,1);
				if(this.pergamena_notifs == 0) this.closeReadPergamenaIcon();
			});
	}

	public async navigateToMistery(args: EventData) {
		this.page.frame.navigate('pages/door/misteryDoor/mistery-door');
	}
}

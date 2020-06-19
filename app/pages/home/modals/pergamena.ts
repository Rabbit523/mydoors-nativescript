import { EventData, Page } from "tns-core-modules/ui/page/page";
import { FlexboxLayout, Button, GridLayout, Image } from "tns-core-modules/ui";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { AnimationCurve } from "tns-core-modules/ui/enums/enums";
import { Message } from "~/shared/models/message";

class PergamenaHome extends FlexboxLayout {
	pergamena_icon: string = null;
	pergamena_color: string = null;
	pergamena_message: string = null;
}

export const PergamenaHomeModel = fromObject(new PergamenaHome());
let pergamenaHomeComponent: PergamenaHome;

export function loadedPergamenaHome(args: EventData) {
	pergamenaHomeComponent = args.object as PergamenaHome;
	pergamenaHomeComponent.bindingContext = PergamenaHomeModel;
}

export function openPergamena(msg: Message) : Promise<void> {

	const data = msg.body.split('|');

	PergamenaHomeModel.set('pergamena_icon', `~/images/pergamena/${data[0]}.png`);
	PergamenaHomeModel.set('pergamena_color', 'square ' + data[1]);
	PergamenaHomeModel.set('pergamena_message', data[2]);

	console.log('message pergamena:', data);

	console.log(
		PergamenaHomeModel.get('pergamena_icon'),
		PergamenaHomeModel.get('pergamena_color'),
		PergamenaHomeModel.get('pergamena_message'),
	);

	const page : Page = pergamenaHomeComponent.page;
	const pClosed : GridLayout = page.getViewById('pergamenaClosed');
	const pOpened : GridLayout = page.getViewById('pergamenaOpened');

	pergamenaHomeComponent.visibility = 'visible';

	return pergamenaHomeComponent.animate({
		opacity: 1,
		duration: 200,
		curve: AnimationCurve.easeInOut
	})
	.then( () => {
		return pClosed.animate({
			duration: 200,
			opacity: 1,
			curve: AnimationCurve.easeInOut
		});
	})
	.then( () => {
		return pClosed.animate({
			duration: 300,
			opacity: 0,
			delay: 150,
			curve: AnimationCurve.easeInOut
		});
	})
	.then(() =>
		pOpened.animate({
			duration: 300,
			opacity: 1,
			curve: AnimationCurve.easeInOut
		})
	);
}

export function closePergamena(args: EventData) {
	const btn = <Button>args.object;
	const page = <Page>btn.page;
	const pergamenaModal = <FlexboxLayout>page.getViewById('pergamenaModal');
	const pClosed = <GridLayout>page.getViewById('pergamenaClosed');
	const pOpened = <GridLayout>page.getViewById('pergamenaOpened');
	pergamenaModal.animate({
		opacity: 0,
		duration: 400,
		curve: AnimationCurve.easeInOut
	})
	.then(() => {
		pClosed.opacity = 0;
		pOpened.opacity = 0;
		pergamenaModal.visibility = 'collapse';
	});
}

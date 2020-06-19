import { EventData } from "tns-core-modules/data/observable";
import { Button, Page, FlexboxLayout, GridLayout, AnimationDefinition, View, Image } from "tns-core-modules/ui";
import { AnimationCurve } from "tns-core-modules/ui/enums/enums";
import { UserPageModel } from "../user-page-model";


let pergamena;

export function loadedPergamena(args) {
	console.log('pergamena caricata');
	pergamena = args.object;
}

export function openPergamena(args: EventData) {
	const img = <Image>args.object;
	const page = <Page>img.page;
	// toggleReadPergamenaIcon(page);
	const pergamenaModal = pergamena;
	const pClosed = pergamena.getViewById('pergamenaClosed');
	const pOpened = pergamena.getViewById('pergamenaOpened');

	pergamenaModal.visibility = 'visible';
	pergamenaModal.animate({
		opacity: 1,
		duration: 200,
		curve: AnimationCurve.easeInOut
	} as AnimationDefinition)
	.then( () => {
		return pClosed.animate({
			duration: 200,
			opacity: 1,
			curve: AnimationCurve.easeInOut
		} as AnimationDefinition);
	})
	.then( () => {
		return pClosed.animate({
			duration: 300,
			opacity: 0,
			delay: 150,
			curve: AnimationCurve.easeInOut
		} as AnimationDefinition);
	})
	.then(() => {
		pOpened.animate({
			duration: 300,
			opacity: 1,
			curve: AnimationCurve.easeInOut
		} as AnimationDefinition);
	});
}

export function closePergamena(args: EventData) {
	const btn = <Button>args.object;
	const page = <Page>btn.page;
	const pergamenaModal = pergamena;
	const pClosed = pergamena.getViewById('pergamenaClosed');
	const pOpened = pergamena.getViewById('pergamenaOpened');
	pergamenaModal.animate({
		opacity: 0,
		duration: 400,
		curve: AnimationCurve.easeInOut
	} as AnimationDefinition)
	.then(() => {
		pClosed.opacity = 0;
		pOpened.opacity = 0;
		pergamenaModal.visibility = 'collapse'; });
}

export const pergamenaData = {
	icons: {
		wine: 'Un calice',
		gift: 'Un regalo',
		heart: 'Un cuore',
	},
	colors: {
		yellow: 'giallo',
		blue: 'blu',
		red: 'rosso',
	}
}

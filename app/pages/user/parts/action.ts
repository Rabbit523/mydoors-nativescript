import { EventData, View } from "tns-core-modules/ui/page/page";
import { Image, Label } from "tns-core-modules/ui";
import { fromObject } from "tns-core-modules/data/observable/observable";

export class Action extends View {
	image: string = '';
	notifs: number = 0;
	type: string = 'message';
}

export function loadedAction(args: EventData) {
	let actionComponent = args.object as Action;
	const actionModel = fromObject({
		... new Action(),
		tapActionComponent() : boolean {
			console.log(actionModel.get('type'), actionModel.get('notifs'));
			let notifications = parseInt(actionModel.get('notifs'));
			if( notifications > 0) {
				notifications--;
				actionModel.set('notifs', notifications);
				// TODO: completare interazione apertura
				return false;
			}

			return true;
		}
	});
	actionModel.set('image', actionComponent.image);
	actionModel.set('notifs', actionComponent.notifs);
	actionModel.set('type', actionComponent.type);

	actionComponent.bindingContext = actionModel;
}


export async function tapAction(args: EventData) {
	let actionComponent = args.object as Action;
	console.log('eseguito');
	let result : boolean = actionComponent.bindingContext.tapActionComponent();
	return result;
}

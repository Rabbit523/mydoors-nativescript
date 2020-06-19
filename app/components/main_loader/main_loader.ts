import { TouchGestureEventData } from "tns-core-modules/ui";
import { EventData, Observable, View } from "tns-core-modules/ui/page/page";
import { ObservableProperty } from "~/observable-property-decorator";
import { AnimationCurve } from "tns-core-modules/ui/enums/enums";

class MainLoader extends Observable {
	@ObservableProperty() public is_active: boolean = false;
}

export const mainLoaderModel : MainLoader = new MainLoader();
export let mainLoaderComponent : View;

export function loadedMainLoader(args: EventData) {
	mainLoaderComponent = args.object as View;
	mainLoaderComponent.bindingContext = mainLoaderModel;
}

export function bypassTap(args: TouchGestureEventData) { }

export function showMainLoader() : Promise<void> {
	mainLoaderModel.is_active = true;
	return mainLoaderComponent.animate({
		opacity: 1,
		duration: 300,
		curve: AnimationCurve.easeIn
	});
}

export function hideMainLoader() : Promise<void> {

	return mainLoaderComponent.animate({
		opacity: 0,
		duration: 300,
		curve: AnimationCurve.easeIn
	})
	.then( () => {
		mainLoaderModel.is_active = false;
	});
}

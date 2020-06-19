import { EventData, Page, View } from "tns-core-modules/ui/page/page";
import { Button } from "tns-core-modules/ui";

let page : Page;

export function navigatingTo(args: EventData) {
	page = args.object as Page;
}

export function goToBackground(args: EventData) {
	page.frame.navigate('pages/profile/custom/background/background-page');
}

export function goToSkin(args: EventData) {
	page.frame.navigate('pages/profile/custom/skin/skin-page');
}

export function goBack(args: EventData) {
    page.frame.goBack();
}

import { EventData, Page, View } from "tns-core-modules/ui/page/page";
import { Button } from "tns-core-modules/ui";
import { setBackgroundColor, getBackgroundColor } from "~/shared/utils";
import { appRootModel } from "~/app-root";

let page : Page;

export function navigatingTo(args: EventData) {
	page = args.object as Page;
}

export function goBack(args: EventData) {
    page.frame.goBack();
}

export function changeBg(args) {
	const button = args.object;
	let bgValue = button.val;
	appRootModel.set('bkgColor', bgValue);
	setBackgroundColor(bgValue);
}

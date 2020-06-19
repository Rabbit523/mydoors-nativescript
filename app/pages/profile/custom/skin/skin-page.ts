import { EventData, Page, View } from "tns-core-modules/ui/page/page";
import { Button } from "tns-core-modules/ui";

let page : Page;

export function navigatingTo(args: EventData) {
	page = args.object as Page;
}

export function goBack(args: EventData) {
    page.frame.goBack();
}

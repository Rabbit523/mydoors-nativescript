import { EventData, Page, View } from "tns-core-modules/ui/page/page";
import { Button } from "tns-core-modules/ui";

let page : Page;

export function navigatingTo(args: EventData) {
	page = args.object as Page;
}

export function goBack(args: EventData) {
    page.frame.goBack();
}

export function goTo(args) {
	const button = args.object;
	const page : Page = button.page;
	const pkg = button.pkg;

	page.frame.navigate({
		moduleName: 'pages/packs/packs-page',
		context:{
			pkg: pkg
		}
	})
}

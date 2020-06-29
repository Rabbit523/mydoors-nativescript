import { EventData, NavigatedData, Page } from "tns-core-modules/ui/page";
import { PacksPageModel } from "./packs-page-model";

let page : Page;
let pkg : string;
let packsPageModel : PacksPageModel;

export function navigatingTo(args: NavigatedData) {
	page = args.object as Page;
	pkg = args.context.pkg;

	packsPageModel = new PacksPageModel(pkg);

	page.bindingContext = packsPageModel;
}

export function goBack(args: EventData) {
    page.frame.goBack();
}



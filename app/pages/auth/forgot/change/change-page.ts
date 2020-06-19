import { NavigatedData, Page } from "tns-core-modules/ui";
import { EventData } from "tns-core-modules/ui/page/page";
import { ChangePageModel } from "./change-page-model";

let page : Page;

export function navigatingTo(args: NavigatedData) {
	page = <Page>args.object;
	page.bindingContext = new ChangePageModel(page.navigationContext);
}

export function onTap() {
	page.frame.navigate({
		moduleName: 'pages/auth/login/login-page',
		clearHistory: true
	});
}

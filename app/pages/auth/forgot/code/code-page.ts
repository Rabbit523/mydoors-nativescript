import { NavigatedData, Page } from "tns-core-modules/ui";
import { CodePageModel } from "./code-page-model";

let page : Page;

export function navigatingTo(args: NavigatedData) {
	page = <Page>args.object;
	page.bindingContext = new CodePageModel(page.navigationContext);
}

export function onTap() {
	page.frame.navigate({
		moduleName: 'pages/auth/login/login-page',
		clearHistory: true
	});
}

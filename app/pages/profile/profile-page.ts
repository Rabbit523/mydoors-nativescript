import { EventData, Page } from "tns-core-modules/ui/page/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { UserService, User } from "~/shared/models/user";
import * as appSettings from 'tns-core-modules/application-settings';

let page : Page;
let usrService: UserService;

export async function navigatingTo(args: EventData) {
	page = <Page>args.object;
	usrService = new UserService();
	const currentUser : User = await usrService.getUserData();
	console.dir(currentUser);
	page.bindingContext = fromObject(currentUser);
}

export function goBack() {
	page.frame.goBack();
}

export function goCustom() {
	page.frame.navigate('pages/profile/custom/custom-page');
}

export function goEdit() {
	page.frame.navigate('pages/profile/edit/edit-page');
}

export function toLogout() {
	appSettings.clear();
	page.frame.navigate({
		moduleName: 'pages/auth/login/login-page',
		clearHistory: true
	});
}

export function toDeleteAccount() {
	usrService.deleteAccount()
		.then(() => {
			toLogout();
			console.log('account eliminato');
			alert('Account eliminato');
		})
}

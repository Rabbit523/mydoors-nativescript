import { NavigatedData, Page } from "tns-core-modules/ui";
import { EditPageModel } from "./edit-page-model";
import { UserService } from "~/shared/models/user";

let page : Page;
let usrService : UserService;

export async function navigatingTo(args: NavigatedData) {
	page = <Page>args.object;
	usrService = new UserService();
	page.bindingContext = new EditPageModel(await usrService.getUserData());
}

export function goBack() { page.frame.goBack(); }

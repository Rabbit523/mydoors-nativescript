import { EventData, NavigatedData, Page } from "tns-core-modules/ui/page/page";
import { Button } from "tns-core-modules/ui";
import { MisteryDoorModel } from './mistery-door-model';
import { UserService } from "~/shared/models/user";

let usrService : UserService;
let misteryModel : MisteryDoorModel;

export function navigatingTo(args: NavigatedData){
	const page = <Page>args.object;
	usrService = new UserService();
	misteryModel = new MisteryDoorModel(usrService);
	page.bindingContext = misteryModel;
}

export function goBack(args: EventData){
	const button = <Button>args.object;
	const page : Page = button.page;
	page.frame.goBack();
}

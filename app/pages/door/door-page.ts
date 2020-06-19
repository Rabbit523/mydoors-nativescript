import { NavigatedData, Page, EventData } from "tns-core-modules/ui/page/page";
import { Button } from "tns-core-modules/ui/button/button";
import { Door } from "~/shared/models/door";
import { DoorModel } from "./door-model";

let doorModel : DoorModel;

export async function navigatingTo(args: NavigatedData) {
	const page = <Page>args.object;
	const data = page.navigationContext;
	doorModel = new DoorModel(data);
	page.bindingContext = doorModel;
}

export function goBack(args: EventData) {
	const button = <Button>args.object;
	button.page.frame.goBack();
}

export function toDelete(args: EventData) {
	doorModel.removeUser();
}

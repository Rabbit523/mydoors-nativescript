import { NavigatedData, Page, Button } from "tns-core-modules/ui";
import { SearchPageModel } from "./search-page-model";
import { messageService } from "~/shared/models/message";
import { EventData } from "tns-core-modules/ui/page/page";
import { UserService } from "~/shared/models/user";

export function navigatingTo(args: NavigatedData) {
	const page = args.object as Page;
	page.bindingContext = new SearchPageModel(
		page,
		new messageService(),
		new UserService(),
		page.navigationContext.user || null
	);
}

export function goBack(args: EventData) {
	const btn = <Button>args.object;
	btn.page.frame.goBack();
}

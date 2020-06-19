import { Observable, EventData } from "tns-core-modules/data/observable";
import { ObservableProperty } from "~/observable-property-decorator";
import { Door } from "~/shared/models/door";
import { UserService, User } from "~/shared/models/user";
import { Button, Page, FlexboxLayout } from "tns-core-modules/ui";

export class AddUserModalModel extends Observable {

	@ObservableProperty() doorlist : Door[];
	@ObservableProperty() adduser_modal: boolean;
	@ObservableProperty() user: User;

	constructor(
		private usrService: UserService
	) {
		super();
		this.init();
	}

	private async init() {
		this.doorlist = await this.usrService.getDoors();
	}
}

import { Observable, EventData } from "tns-core-modules/data/observable";
import { Door } from "~/shared/models/door";
import { UserService, User } from "~/shared/models/user";
import { NavigationEntry, Page } from "tns-core-modules/ui";
import { ObservableProperty } from "~/observable-property-decorator";

export class MisteryDoorModel extends Observable {

	@ObservableProperty() misteryDoor : Door;
	@ObservableProperty() infoModal: boolean;

	constructor(private readonly usrService: UserService) {
		super();
		this.infoModal = true;
		this.init();
	}

	private async init() : Promise<void> {
		let users = await this.usrService.getMisteryUsers();
		console.dir(users);
		this.misteryDoor = {
			id: 'mistery',
			color: '~/images/misterydoor.png',
			name: 'Mistery Door',
			users: users
		};
		// console.dir(this.misteryDoor);
	}

	public itemSelected(args) {
		try {
			const user: User = this.misteryDoor.users[args.index];
			const theNavEntry: NavigationEntry = {
				moduleName: 'pages/user/user-page',
				context: {
					user: user,
					door_id: 'mistery',
					door_name: this.misteryDoor.name,
					door_color: this.misteryDoor.color,
					is_mistery: true
				}
			};
			const page = <Page>args.object.page;
			page.frame.navigate(theNavEntry);

		} catch (error) {
			alert(error);
		}

	}

	public closeModal() {
		this.infoModal = false;
	}
}

import { Observable, EventData } from "tns-core-modules/data/observable";
import { User, UserService } from "~/shared/models/user";
import { Door } from "~/shared/models/door";
import { NavigationEntry, Page, Button, AbsoluteLayout, Label, StackLayout, NavigatedData, View, ListView } from "tns-core-modules/ui";
import { ObservableProperty } from "~/observable-property-decorator";
import { confirm } from "tns-core-modules/ui/dialogs";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { showMainLoader } from "~/components/main_loader/main_loader";

let usrService: UserService;

export class DoorModel extends Observable {
	@ObservableProperty() door_id: string;
	@ObservableProperty() door_name: string;
	@ObservableProperty() door_color: string;
	@ObservableProperty() users: ObservableArray<User>;
	@ObservableProperty() selected_index: number = -1;

	constructor(private readonly data) {
		super();
		usrService = new UserService();
		usrService.getDoor(this.data.door_id)
			.then((door: Door) => {
				this.door_id = this.data.door_id;
				this.door_color = door.color;
				this.door_name = door.name;
				this.users = new ObservableArray<User>(door.users);
				console.dir(door.users);
			})
			.catch( err => {
				console.log("Errore", err);
			})
	}

	public async itemSelected(args) {
		await showMainLoader();
		try {
			const user: User = this.users.getItem(args.index);
			const theNavEntry: NavigationEntry = {
				moduleName: "pages/user/user-page",
				context: {
					user: user,
					door_id: this.door_id,
					door_name: this.door_name,
					door_color: this.door_color,
					is_mistery: false
				}
			};
			const page = <Page>args.object.page;
			page.frame.navigate(theNavEntry);
		} catch (error) {
			alert(error);
		}
	}

	public addUser(args: EventData) {
		const btn = <Button>args.object;
		const page = <Page>btn.page;
		const theNavEntry: NavigationEntry = {
			moduleName: "pages/door/create/add-door-page",
			backstackVisible: false,
			context: {
				door_id: this.door_id,
				door_name: this.door_name,
				door_color: this.door_color,
				availableUsers: this.users,
				is_edit: true
			}
		};
		page.frame.navigate(theNavEntry);
	}

	public onUserSelected(args) {
		console.dir(args);
		const element = <StackLayout>args.view;
		element.backgroundColor = 'transparent';
		const iconDelete : Label = element.getViewById('icon_delete');
		iconDelete.visibility = 'visible';
		this.selected_index = args.index;
		console.log(this.selected_index);
	}

	public onUserDeselected(args) {
		console.dir(args);
		const element = <StackLayout>args.view;
		element.backgroundColor = 'transparent';
		const iconDelete : Label = element.getViewById('icon_delete');
		iconDelete.visibility = 'collapse';
	}

	public removeUser() {
		confirm("Sicuro di voler eliminare dalla Door quest'utente?")
			.then( async v => {
				if(v) {
					try {
						const tmpUser = this.users.getItem(this.selected_index);
						await usrService.removeUserFromDoor(this.door_id, tmpUser.id);
						this.users.splice(this.selected_index, 1);
					} catch (error) {
						console.log('errore elimina user', error);
					}
				}
			});
	}

}

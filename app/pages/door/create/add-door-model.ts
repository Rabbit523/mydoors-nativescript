import { Observable, EventData } from "tns-core-modules/data/observable";
import * as dialogs from 'tns-core-modules/ui/dialogs';
import * as firebase from 'nativescript-plugin-firebase';

import { User, UserService } from "~/shared/models/user";
import { doorImages, Door } from "~/shared/models/door";
import { TextField, Label, ItemEventData, View, Page } from "tns-core-modules/ui";
import { ObservableProperty } from "~/observable-property-decorator";
import { showMainLoader, hideMainLoader } from "~/components/main_loader/main_loader";

export class AddDoorModel extends Observable {

	private is_edit = false;
	private usrService: UserService;

	@ObservableProperty() id: string;
	@ObservableProperty() backgroundDoor: string;
	@ObservableProperty() doorName: string;
	@ObservableProperty() search: string;
	@ObservableProperty() filteredUsers: User[];
	@ObservableProperty() availableUsers: User[];

	constructor(navCtx) {
		super();
		this.usrService = new UserService();

		this.backgroundDoor = doorImages[0];
		this.doorName = 'New Door';
		this.search = null ;
		this.filteredUsers = [];

		this.is_edit = !!navCtx.is_edit;

		if(this.is_edit) {
			this.id = navCtx.door_id;
			this.backgroundDoor = navCtx.door_color;
			this.doorName = navCtx.door_name;
			this.availableUsers = navCtx.availableUsers;
		}
	}

	private getUserFullName(u: User) : string { return `${u.firstname} ${u.lastname}`; }

	public textChange(args: EventData) {
		const textField = <TextField>args.object;
		let current_search: string = textField.text.toLocaleLowerCase();
		if(current_search == '' || current_search == null) {
			this.filteredUsers = [];
			return;
		}
		const currentUsers = [];
		firebase.firestore.collection('users')
			.get()
			.then(querySnapShot => {
				querySnapShot.forEach( el => {
					if(el.id != UserService._uid) {
						currentUsers.push({
							id: el.id,
							...el.data()
						});
					}
				});

				const fltUsr : User[] = currentUsers.filter( (el : User) => this.getUserFullName(el).toLowerCase().includes( current_search.toLowerCase() ) )
				this.filteredUsers = fltUsr;
			})
	}

	public tapdoor() {
		const index = doorImages.indexOf(this.backgroundDoor);
		this.backgroundDoor = doorImages[index + 1];
	}

	public ddtap() {
		dialogs.prompt('Inserisci nome Door:')
			.then( (res : dialogs.PromptResult) => {
				this.doorName = res.text;
			});
	}

	public async onItemTap(args: ItemEventData) {
		try {
			const el: View = <View>args.object;
			const page: Page = el.page;
			const index: number = args.index;
			const item: User = this.filteredUsers[index];

			console.log(item);


			const currentUser: User = {
				id: item.id,
				firstname: item.firstname,
				lastname: item.lastname,
				username: item.username,
				email: item.email,
				avatar: item.avatar ? item.avatar : null,
				gender: item.gender,
				fcm_tokens: item.fcm_tokens
			};

			const door: Door = {
				id: this.is_edit ? this.id: 'fourth',
				name: this.doorName,
				color: this.backgroundDoor,
				users: this.is_edit ? [...this.availableUsers, currentUser] : [currentUser]
			};

			showMainLoader();
			if(this.is_edit) await this.usrService.updateDoor(door);
			else await this.usrService.addDoor(door);
			this.goToDoor(page, door);
		} catch (error) {
			console.log(error);
		}

	}

	public navigatedFrom() {
		this.backgroundDoor = doorImages[0];
		this.doorName = 'New Door';
		this.search = null;
		this.filteredUsers = [];
		this.availableUsers = [];
	}

	private goToDoor(page: Page, door: Door) : void {
		page.frame.navigate({
			moduleName: 'pages/door/door-page',
			backstackVisible: false,
			transition: {name: 'slideRight'},
			context: {
				door_id: door.id,
				door_color: door.color,
				door_name: door.name,
			}
		});
		hideMainLoader();
	}


}

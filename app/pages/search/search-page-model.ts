import { Observable, EventData } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { ObservableProperty } from "~/observable-property-decorator";
import { User, UserService } from "~/shared/models/user";
import { ItemEventData, NavigatedData, Page, TextField } from "tns-core-modules/ui";
import { messageService } from "~/shared/models/message";
import { demousers } from "../door/create/demoData";
import { sendNotification } from "~/shared/utils";
import * as firebase from 'nativescript-plugin-firebase';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { Door } from "~/shared/models/door";

export class SearchPageModel extends Observable {

	@ObservableProperty() search: string = null;
	// @ObservableProperty() filteredUsers: ObservableArray<User> = new ObservableArray([]);
	@ObservableProperty() filteredUsers: User[] = [];

	constructor(
		private page : Page,
		private msgService: messageService,
		private usrService: UserService,
		private current_user: User,
	) {
		super();
		this.getAllUsers();
	}

	private convertUserSchema(user) {
		return {
			id: user.id,
			firstname: user.firstname,
			lastname: user.lastname,
			username: user.username,
			gender: user.gender,
			avatar: user.avatar,
			email: user.email,
			fcm_tokens: user.fcm_tokens,
		}
	}

	private async getAllUsers() {
		const doors: Door[] = await this.usrService.getDoors();
		let tmpUsers: User[] = [];
		doors.forEach((door: Door) => {
			tmpUsers = [...tmpUsers, ...door.users.map(this.convertUserSchema)];
		});
		console.dir(tmpUsers);
		if(this.search === null) this.filteredUsers = tmpUsers;
	}

	private getUserFullName(u: User) : string { return `${u.firstname} ${u.lastname}`; }

	public textChange(args: EventData) {
		console.dir(args);
		const textField = <TextField>args.object;
		let current_search: string = textField.text;
		const currentUsers: User[] = this.filteredUsers;
		const fltUsr : User[] = currentUsers.filter( (el : User) => this.getUserFullName(el).toLowerCase().includes( current_search.toLowerCase() ) )
		this.filteredUsers = fltUsr;
	}

	private toSendNotification(tokens: string[], title: string, body: string, data?: any) {
		for (const token of tokens) {
			sendNotification(token, title, body, data);
		}
	}

	public onItemTap(args: ItemEventData) {
		const user: User = this.filteredUsers[args.index];
		console.log(args.index, JSON.stringify(user));
		this.msgService.addMessage({
			user_by: UserService._uid,
			user_to: this.current_user.id,
			type: 'sharecontact',
			body: JSON.stringify(this.convertUserSchema(user))
		})
		.then( async res => {
			console.log('risposta', JSON.stringify(res));
			const me = await this.usrService.getUserData();
			firebase.firestore.collection('users').doc(this.current_user.id).onSnapshot( snapshot => {
				if(snapshot.exists) {
					this.toSendNotification(snapshot.data().fcm_tokens, 'Condivisione contatto!', `${me.firstname} ${me.lastname} ti ha condiviso un contatto`);
				}
			});

			this.page.frame.navigate({
				moduleName: 'pages/home/home-page',
				clearHistory: true,
			});
		})
		.catch( err => {
			dialogs.alert({
				title: "Errore",
				message: '' + err,
				okButtonText: "OK"
			});
		})
	}

	public navigatedTo(args: NavigatedData) {

	}
}

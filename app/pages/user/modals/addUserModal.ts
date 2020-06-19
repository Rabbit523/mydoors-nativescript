import { EventData, fromObject } from "tns-core-modules/data/observable";
import { FlexboxLayout, Button, Page } from "tns-core-modules/ui";
import { AddUserModalModel } from "./addUserModalModel";
import { UserService, User } from "~/shared/models/user";
import { sendNotification } from "~/shared/utils";

class AddUserModal extends FlexboxLayout {
	user: User;
}

let addUserModalComponent : AddUserModal;
let addUserModalModel: AddUserModalModel;
let usrService : UserService;

export function addUserModalLoaded(args: EventData) {
	addUserModalComponent = args.object as AddUserModal;
	usrService = new UserService();
	addUserModalModel = new AddUserModalModel(usrService);
	addUserModalModel.user = addUserModalComponent.user;
	addUserModalComponent.bindingContext = addUserModalModel;
}

function toSendNotification(title: string, body: string, data?: any) {
	for (const token of this.current_user.fcm_tokens) {
		sendNotification(token, title, body, data);
	}
}

export async function addUserToDoor(args: EventData) {
	const btn = args.object as Button;
	const page: Page = btn.page;
	const door_id = btn["door-id"];
	const currentDoor = (await usrService.getUserData())[door_id];
	// console.log('test');
	// console.dir(currentDoor);
	// console.dir(addUserModalModel.user);
	usrService.addUserToDoor(door_id, {
		id: addUserModalModel.user.id,
		firstname: addUserModalModel.user.firstname,
		lastname: addUserModalModel.user.lastname,
		username: addUserModalModel.user.username,
		avatar: addUserModalModel.user.avatar,
		email: addUserModalModel.user.email,
		gender: addUserModalModel.user.gender,
	})
		.then( () => {
			UserService.misteryMessages = UserService.misteryMessages.filter( message => message.user_by != addUserModalModel.user.id );
			page.frame.navigate({
				moduleName: "pages/home/home-page",
				clearHistory: true
			});

		}).catch( err => {
			console.log("Errore:", JSON.stringify(err));
		});


}

export function openAddUserModal(args: EventData) {
	addUserModalModel.adduser_modal = true;
	addUserModalComponent.animate({
		opacity: 1,
		duration: 300
	});
}

export function closeAddUserModal(args: EventData) {
	addUserModalComponent.animate({
		opacity: 0,
		duration: 300
	}).then(() => {
		addUserModalModel.adduser_modal = false;
	});
}

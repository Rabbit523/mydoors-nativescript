import * as appSettings from 'tns-core-modules/application-settings';
import { Door } from './door';
import { firestore } from 'nativescript-plugin-firebase/app';
import { Message } from './message';

export const getUserToken = () => appSettings.hasKey('md_token') ? appSettings.getString('md_token') : null;

export class UserService {

	public static userData : Promise<any>;
	public static _uid : string;
	public static misteryMessages: Message[];

	constructor() {
		console.log('costruttore service user');
		UserService._uid = getUserToken();
		this.setUserData();
	}

	public getUID() : string {
		return UserService._uid;
	}

	public getMisteryMessages() : Message[] {
		return UserService.misteryMessages;
	}

	public setMisteryMessages(messages: Message[]) {
		UserService.misteryMessages = messages;
	}

	public async getDoors() {
		const tmpuser = await UserService.userData;
		return Object.keys(tmpuser.doors)
			.map( doorName => ({
				...tmpuser.doors[doorName],
				id: doorName
			}));
	}

	public async getDoor(id) {
		return (await UserService.userData).doors[id];
	}

	public async getUserData() : Promise<Profile> {
		return await UserService.userData;
	}

	public setUserData() {
		UserService.userData = new Promise((resolve, reject) => {
			firestore().collection('users').doc(UserService._uid)
				.onSnapshot( user => {
					if(!user.exists) {
						reject('Utente non trovato');
					} else {
						resolve({
							id: UserService._uid,
							...user.data()
						});
					}
				});
		});
	}

	public async updateUserData(data) : Promise<void> {
		return firestore().collection('users')
			.doc(UserService._uid)
			.update(data);
	}

	public async addDoor(data: Door) : Promise<void> {
		return firestore().collection('users')
			.doc(UserService._uid)
			.update({
				doors: {
					...(await UserService.userData).doors,
					fourth: {
						name: data.name,
						color: data.color,
						users: data.users,
					}
				}
			});
	}

	public async updateDoor(data: Door) : Promise<void> {
		let key = data.id;
		return firestore().collection('users')
			.doc(UserService._uid)
			.update({
				["doors." + key]: {
						name: data.name,
						color: data.color,
						users: data.users,
					}
			});
	}

	public deleteAccount() {
		// console.log(UserService._uid);
		return firestore().collection('users').doc(UserService._uid).delete();
	}

	public async addUserToDoor(doorName: string, user: User) : Promise<void> {
		console.log(doorName);
		let tmpUserData = await this.getUserData();
		tmpUserData.doors[doorName].users.push(user);
		return firestore().collection('users')
			.doc(UserService._uid)
		.update({
			['doors.' + doorName + '.users']: tmpUserData.doors[doorName].users,
		});
	}

	public async removeUserFromDoor(doorName: string, id_user: string) : Promise<void> {
		console.log(doorName);
		let tmpUserData = await this.getUserData();
		return firestore().collection('users')
			.doc(UserService._uid)
		.update({
			['doors.' + doorName + '.users']: tmpUserData.doors[doorName].users.filter((usr: User) => usr.id != id_user)
		});
	}

	public getMisteryUsers() : Promise<User[]> {
		try {
			let tempElements = [];
			let counter = 1;
			return new Promise((resolve, reject) => {
				this.getMisteryMessages().forEach( async el => {

					let FsDoc = await firestore().collection('users').doc(el.user_by);
					FsDoc.onSnapshot( doc => {
						let tmpIndex = tempElements.findIndex(u => u.id == doc.id);
						if(tmpIndex > - 1) {
							tempElements.splice(tmpIndex, 1, {
								id: doc.id,
								messages: [...tempElements[tmpIndex].messages, el],
								...doc.data()
							})
						} else {
							tempElements.push({
								id: doc.id,
								messages: [el],
								...doc.data()
							});
						}

						if(counter == this.getMisteryMessages().length) resolve(tempElements);
						counter++;
					})

				});
			});

		} catch (error) {
			console.log('errore:', error);
		}
	}
}

export interface User {
	id: string;
	fcm_tokens?: string[];
	firstname: string;
	lastname: string;
	username: string;
	email: string;
	avatar: string;
	gender: string;
}

export class Profile implements User {
	id: string;
	fcm_tokens: string[];
	firstname: string;
	lastname: string;
	username: string;
	birthdate: string;
	email: string;
	password: string;
	doors: any;
	role_id: number;
	avatar: string;
	gender: string;
	mistery: Door;
	blockedList: [];

	public get fullName() : string { return `${this.firstname} ${this.lastname}`; }
}

import * as firebase from 'nativescript-plugin-firebase/app';
import { firestore } from 'nativescript-plugin-firebase';
import { UserService } from './user';
import { Door } from './door';

export class Message {
	id?: string;
	user_by : string;
	user_to : string;
	body : string;
	data?: any;
	type: string;
}

export class messageService {

	private _messageCollection : firestore.CollectionReference;
	private usrService: UserService;

	constructor() {
		this._messageCollection = firebase.firestore().collection('messages');
		this.usrService = new UserService();
	}

	public getAllMessages() : Promise<Message[]> {
		return new Promise((resolve, reject) => {
			return this._messageCollection.onSnapshot( messages => {
				resolve(this.parseMessages(messages));
			}, err => {
				reject(err);
			})
		})
	}

	private parseMessages(messages) : Message[] {
		const tmpMessages : Message[] = [];
		messages.forEach(message => {
			tmpMessages.push({
				id: message.id,
				...message.data()
			});
		});
		return tmpMessages;
	}

	public async getMessagesFromUser(user_id) : Promise<Message[]> {
		return (await this.getAllMessages()).filter( message => message.user_by === user_id && message.user_to === UserService._uid);
		// return (await this.getAllMessages()).filter( message => message.user_to === user_id);
	}

	public async addMessage(data: Message) : Promise<firestore.DocumentReference> {
		return firebase.firestore().collection('messages').add(data);
	}

	public removeMessage(message_id: string) : Promise<void> {
		return firebase.firestore().collection('messages').doc(message_id).delete();
	}

	public async getPergamenaMessages() : Promise<Message[]> {
		return (await this.getAllMessages())
			.filter(
				message =>
					message.user_to === UserService._uid &&
					message.type == 'pergamena'
			);
	}

	private flatten<T>(arr: any[]): T[] {
		return arr.reduce((flat, toFlatten) => {
			return flat.concat(Array.isArray(toFlatten) ? this.flatten(toFlatten as T[]) : toFlatten);
		}, []);
	}

	public async getMessagesFromUnkowns() : Promise<Message[]> {
		let allMessages = (await this.getAllMessages()).filter( message => message.user_to === UserService._uid );
		let doors : Door[] = await this.usrService.getDoors();
		let tmpUsers = this.flatten<string>(doors.map( door => [...door.users.map(el => el.id) || null]));
		let tmpMisteryMessages = allMessages.filter(el => tmpUsers.indexOf(el.user_by) == -1 && el.type != 'pergamena' ) as Message[];
		this.usrService.setMisteryMessages(tmpMisteryMessages);
		return tmpMisteryMessages;
	}
}

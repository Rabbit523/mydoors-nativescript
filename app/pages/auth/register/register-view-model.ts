import {Observable, EventData} from 'tns-core-modules/data/observable';
import { Page, Button } from 'tns-core-modules/ui';
import * as as from 'tns-core-modules/application-settings';
import { defaultDoorData } from '~/shared/models/door';
import { ObservableProperty } from '~/observable-property-decorator';
import { Profile } from '~/shared/models/user';
// import { firestore } from 'nativescript-plugin-firebase/app';

export class RegisterViewModel extends Observable {

	@ObservableProperty() firstname: string;
	@ObservableProperty() lastname: string;
	@ObservableProperty() username: string;
	@ObservableProperty() email: string;
	@ObservableProperty() gender: boolean;
	@ObservableProperty() checked: boolean;
	@ObservableProperty() birthdate: string;

	constructor() {
		super();
		// this.firstname = 'Alberto';
		// this.lastname = 'Baldi';
		// this.username = 'albal';
		// this.email = 'albertobaldi87@gmail.com';
		// this.birthdate = '09-03-1987';
		// this.gender = false;
		// this.checked = false;
	}

	public toggleCheck() {
		this.checked = !this.checked;
	}

	public onSubmit(args: EventData) {
		if(!this.checked) return;
		const button = <Button>args.object;
		const page : Page = button.page;

		const tmp = {
			firstname: this.firstname,
			lastname: this.lastname,
			username: this.username,
			avatar: null,
			email: this.email,
			gender: this.gender ? 'F' : 'M',
			doors: defaultDoorData,
			birthdate: this.birthdate,
			blockedList: [],
			fcm_tokens: [],
		};

		as.setString('md_tmpDataRegister', JSON.stringify(tmp));

		page.frame.navigate({
			moduleName: 'pages/auth/login/login-page',
			clearHistory: true
		});
	}

	public toggleGender() {
		this.gender = !this.gender;
	}

}

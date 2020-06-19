import { Observable, EventData } from "tns-core-modules/data/observable";
import { Button, Page } from "tns-core-modules/ui";
import { HTTP } from "~/shared/utils";

export class ChangePageModel extends Observable {

	private _password: string;
	private _confirm: string;
	private userId: string;

	public get password(): string { return this._password; }
	public get confirm(): string { return this._confirm; }

	public set password(value: string) { this._password = value; this.notifyPropertyChange('password', value); }
	public set confirm(value: string) { this._confirm = value; this.notifyPropertyChange('confirm', value); }

	constructor(ctx) {
		super();
		this.password = null;
		this.confirm = null;
		this.userId = ctx.userId;
	}

	public onSubmit(args: EventData) {
		const btn = <Button>args.object;
		const page : Page = btn.page;

		if(this.password === this.confirm) {

			HTTP.post('users/me/reset/confirm', {
				userId: this.userId,
				password: this.password
			})
				.then( res => {
					if(res.status !== 'success') throw res;
					console.log('MODIFICA PASSWORD');
					page.frame.navigate({
						moduleName: 'pages/auth/login/login-page',
						clearHistory: true
					});
				})
				.catch( err => {
					console.log('ERRORE');
					console.log(err);
					alert('ERRORE!');
				});
		} else {
			alert('Le password inserite non combaciano');
		}
	}
}

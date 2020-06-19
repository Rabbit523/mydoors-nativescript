import { Observable, EventData } from "tns-core-modules/data/observable";
import { Page, NavigationContext, Button } from "tns-core-modules/ui";
import { HTTP } from "~/shared/utils";

export class CodePageModel extends Observable {

	private _code : string;
	public get code(): string { return this._code; }
	public set code(value: string) { this._code = value; this.notifyPropertyChange('code', value); }
	private confirm_code : string;
	private email : string;
	private userId : string;

	constructor(ctx) {
		super();
		this.code = null;
		this.confirm_code = ctx.confirm_code;
		this.email = ctx.email;
		this.userId = ctx.userId;
	}

	public onSubmit(args: EventData) {
		const button = <Button>args.object;
		const page : Page = button.page;
		if(this.code === this.confirm_code) {
			page.frame.navigate({
				moduleName: 'pages/auth/forgot/change/change-page',
				backstackVisible: true,
				context: {
					userId: this.userId
				}
			});
		} else {
			alert('Codice non valido');
		}
	}

	public onRequestAgain() {
		HTTP.post('users/me/reset', { email: this.email })
			.then( response => {
				console.dir(response);
				if(response.status !== 'success') throw response.message || 'Email non valida';
				this.confirm_code = response.data.code;
				alert("leggi l'email che ti è arrivata e inserisci nuovamente il codice da te richiesto.");

			})
			.catch( err => {
				alert(err);
			});
	}
}

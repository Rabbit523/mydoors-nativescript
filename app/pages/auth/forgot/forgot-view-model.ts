import {Observable, EventData} from 'tns-core-modules/data/observable';
import { HTTP } from '~/shared/utils';
import { alert } from 'tns-core-modules/ui/dialogs';
import { Button, Page } from 'tns-core-modules/ui';

export class ForgotViewModel extends Observable {

	private _email: string;
	private _code: string;
	private _confirmCode: string;

	public get code(): string { return this._code; }
	public get confirmCode(): string { return this._confirmCode; }
	public get email() : string { return this._email; }

	public set code(v: string) { this._code = v; this.notifyPropertyChange('code', v); }
	public set confirmCode(v: string) { this._confirmCode = v; this.notifyPropertyChange('confirmCode', v); }
	public set email(v : string) { this._email = v; this.notifyPropertyChange('email', v); }

	constructor() {
		super();
		this.email = null;
		this.code = null;
		this.confirmCode = null;
	}
	/**
	 * onSubmit
	 */
	public onSubmit(args: EventData) {

		const btn = <Button>args.object;
		const page : Page = btn.page;

		// console.log(this.email);

		HTTP.post('users/me/reset', { email: this.email })
			.then( response => {
				console.dir(response);
				if(response.status !== 'success') throw response.message || 'Email non valida';
				this.code = response.data.code;
				page.frame.navigate({
					moduleName: 'pages/auth/forgot/code/code-page',
					backstackVisible: false,
					context: {
						confirm_code: response.data.code,
						email: this.email,
						userId: response.data.userId
					}
				});
			})
			.catch( err => {
				alert(err);
			});
	}

}

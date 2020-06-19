import { EventData } from 'tns-core-modules/data/observable';
import { Page, View } from 'tns-core-modules/ui/page';
import { LoginViewModel } from './login-view-model';
import { Label } from 'tns-core-modules/ui/label/label';

export function navigatingTo(args: EventData) {
	let page = <Page>args.object;
	page.bindingContext = new LoginViewModel();
}

export function onTap(args: EventData) {
    const btn = <View>args.object;
    btn.page.frame.navigate('pages/auth/register/register-page');
}

export function toForgot(args: EventData) {
    const label = <Label>args.object;
    label.page.frame.navigate('pages/auth/forgot/forgot-page');
}

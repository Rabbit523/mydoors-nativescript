import { EventData } from 'tns-core-modules/data/observable';
import { Page, View, NavigatedData } from 'tns-core-modules/ui/page';
import { ForgotViewModel } from './forgot-view-model';

export function navigatingTo(args: NavigatedData) {
	const page = <Page>args.object;
	page.bindingContext = new ForgotViewModel();
}

export function onTap(args: EventData) {
    const button = <View>args.object;
    button.page.frame.navigate('pages/auth/login/login-page');
}

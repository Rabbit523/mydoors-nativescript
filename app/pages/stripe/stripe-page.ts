import { EventData, NavigatedData, Page } from "tns-core-modules/ui/page";
import { CreditCardView, Card, Source, Stripe, Token } from 'nativescript-stripe';
import { StripePageModel } from "./stripe-model";
import { StripeService, publishableKey } from "../../shared/stripe.service";

let page : Page;
let stripePageModel : StripePageModel;
let stripe: Stripe;
let stripeService: StripeService;

export function navigatingTo(args: NavigatedData) {
	stripeService = new StripeService();
  stripe = new Stripe(publishableKey);
		
	page = args.object as Page;
	stripePageModel = new StripePageModel();

	page.bindingContext = stripePageModel;
}

export function goBack(args: EventData) {
	page.frame.goBack();
}

export function submit(args: EventData) {
  let ccView: CreditCardView = page.getViewById("card");
  stripe.createToken(ccView.card, async (error, token) => {
		let value = error ? error.message : formatToken(token);
		console.log(value);
		let result = await stripeService._postRequest(`${token.id}`, 1200);
		console.log('payment result: ', result);
	});	
}

export function formatToken(token: Token): string {
  return `ID: ${token.id}\nCard: ${token.card.brand} (...${token.card.last4})`;
}

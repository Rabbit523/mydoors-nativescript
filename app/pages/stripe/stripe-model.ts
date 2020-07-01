import { Observable } from "tns-core-modules/ui/page";
import { ObservableProperty } from "~/observable-property-decorator";

export class StripePageModel extends Observable {

	@ObservableProperty() pkg : string;
	@ObservableProperty() price : number;
	@ObservableProperty() item: object;
  @ObservableProperty() isLoading : boolean;
  @ObservableProperty() canBuy: boolean;
  @ObservableProperty() paymentInProgress : boolean;
  @ObservableProperty() paymentType : string;
  @ObservableProperty() paymentImage : object;
  @ObservableProperty() shippingType : string;
  @ObservableProperty() total : number;
  @ObservableProperty() successMessage : string;
  @ObservableProperty() errorMessage : string;
	@ObservableProperty() debugInfo : string;
	constructor(pkg = 'classic') {
		super();
		this.pkg = pkg ? pkg : 'classic';
		this.price = 1200;
		// this.item = { id: 0, name: "Something to buy", price: 1200 };
		// this.isLoading = true;
		// this.canBuy = false;
		// this.paymentInProgress = false;
		// this.paymentType = "Select Payment";
		// this.paymentImage = null;
		// this.shippingType = "Enter Shipping Info";
		// this.total = 1200;
		// this.successMessage = "";
		// this.errorMessage = "";
		// this.debugInfo = "";
	}

	public buyPack() : void {
		// code
	}
}

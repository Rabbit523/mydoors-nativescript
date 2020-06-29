import { Observable } from "tns-core-modules/ui/page";
import { ObservableProperty } from "~/observable-property-decorator";

export class PacksPageModel extends Observable {

	@ObservableProperty() pkg : string;

	constructor(pkg = 'classic') {
		super();
		this.pkg = pkg ? pkg : 'classic';
	}

	public buyPack() : void {
		// code
	}
}

import { EventData, View } from "tns-core-modules/ui/page/page";
import { fromObject } from "tns-core-modules/data/observable/observable";

export function loadedLoader(args: EventData) {
	const loader = args.object as View;
	loader.bindingContext = fromObject({
		tapOnLoader(args: EventData) {
			console.dir(args);
		}
	})
}

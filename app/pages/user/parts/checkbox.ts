import { EventData, View } from "tns-core-modules/ui/page/page";
import { Label } from "tns-core-modules/ui";

class CheckBox extends View {
	public label: string = "";
}

export function getText(args: EventData) {
	const checkbox = <CheckBox>args.object;
	const label = checkbox.getViewById('check_lbl') as Label;
	label.text = checkbox.label;
}

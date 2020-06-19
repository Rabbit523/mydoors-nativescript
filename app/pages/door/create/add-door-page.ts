import { EventData, NavigatedData, Page } from "tns-core-modules/ui/page/page";
import { Button } from "tns-core-modules/ui";
import { AddDoorModel } from "./add-door-model";

export function navigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new AddDoorModel(page.navigationContext);
}

export function goBack(args: EventData) {
    const btn = <Button>args.object;
    btn.page.frame.goBack();
}

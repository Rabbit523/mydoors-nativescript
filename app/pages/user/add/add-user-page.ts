import { NavigatedData, Page } from "tns-core-modules/ui";

export function navigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = page.navigationContext;
}

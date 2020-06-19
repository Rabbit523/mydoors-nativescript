import { EventData, Page, View } from "tns-core-modules/ui/page/page";
import { Button } from "tns-core-modules/ui/button/button";
import * as app from "tns-core-modules/platform";
import { FlexboxLayout, AbsoluteLayout } from "tns-core-modules/ui/layouts";
import { Door } from "~/shared/models/door";
import { NavigationEntry, Image } from "tns-core-modules/ui";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { UserService } from "~/shared/models/user";
import { messageService } from "~/shared/models/message";
import { UserPageModel } from "./user-page-model";

let page : Page;
let nextDoor: Door;
let theta: number[] = [];

let userPageModel : UserPageModel;

export function goToDoor(args: EventData) {
	const btn = <Button>args.object;
	const page = <Page>btn.page;
	page.frame.navigate({
		moduleName: "pages/door/door-page",
		backstackVisible: false,
		transition: { name: "slideRight" },
		context: page.navigationContext
	});
}

export async function navigatingTo(args: EventData) {
	page = <Page>args.object;
	const usrService = new UserService();

	generate(9, 115, page);

	const current_doors = await usrService.getDoors();
	const door_ids = current_doors.map( door => door.id );
	const current_index : number = door_ids.findIndex(val => val === page.navigationContext.door_id);
	const nextDoor_id = current_index < door_ids.length - 1 ? door_ids[current_index + 1] : 'first';

	nextDoor = current_doors.find(el => el.id === nextDoor_id);

	const myBindingContext = page.navigationContext;

	myBindingContext.nextDoor_id = nextDoor.id as string;
	myBindingContext.nextDoor_name = nextDoor.name as string;
	myBindingContext.nextDoor_color = nextDoor.color as string;
	myBindingContext.adduser_modal = false as boolean;
	userPageModel = new UserPageModel(myBindingContext);
	page.bindingContext = userPageModel;
}

export function goBack(args: EventData) {
	const button = <Button>args.object;
	button.page.frame.goBack();
}

export function navigateToNext(args: EventData) {
	const flx = <FlexboxLayout>args.object;
	const page = <Page>flx.page;

	const theNavEntry: NavigationEntry = {
		moduleName: "pages/door/door-page",
		context: {
			door_id: nextDoor.id,
			door_name: nextDoor.name,
			door_color: nextDoor.color
		}
	};

	page.frame.navigate(theNavEntry);
}

function setup(n: number, r: number, page: Page) {
	const absLayout = <AbsoluteLayout>page.getViewById("userActions");
	let counter = 0;
	absLayout.eachChild( (el : View) => {
		el.left = 120 + Math.round(r * Math.cos(theta[counter]));
		el.top = 115 + Math.round(r * Math.sin(theta[counter]));
		counter++;
		return !!el;
	});
}

function generate(n: number, r: number, page: Page) {
	var frags = 360 / n;
	for (var i = 0; i <= n; i++) {
		theta.push((frags / 180) * i * Math.PI);
	}
	setup(n, r, page);
}

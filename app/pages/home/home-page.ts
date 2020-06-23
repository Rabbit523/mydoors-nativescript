import { NavigatedData, Page, EventData } from "tns-core-modules/ui/page";
import { GridLayout, AbsoluteLayout, FlexboxLayout } from 'tns-core-modules/ui/layouts';
import { Button, Label, Image } from "tns-core-modules/ui";
import { NavigationEntry } from "tns-core-modules/ui/frame/frame";
import { GestureTypes, SwipeGestureEventData } from "tns-core-modules/ui/gestures";
import { Door } from '~/shared/models/door';
import { HomePageModel } from './home-page-model';
import * as platform from 'tns-core-modules/platform';
import { UserService } from "~/shared/models/user";
import { messageService } from "~/shared/models/message";
import { showMainLoader, hideMainLoader } from "~/components/main_loader/main_loader";

let theta: Array<number> = [];
let generatedButtons: Array<FlexboxLayout> = [];
let widthDevice = platform.screen.mainScreen.widthDIPs;

let tmpDoorList : any[];
let usrService : UserService;
let msgService : messageService;
let _direct: number = 0;
let _angle: number = 0;
let angle: number = 0;

export async function onNavigatingTo(args: NavigatedData) {
	showMainLoader();
	const page = <Page>args.object;
	const absl = <AbsoluteLayout>page.getViewById('door_container');
	usrService = new UserService();
	msgService = new messageService();

	if (absl.getChildrenCount()) {
		theta = [];
		generatedButtons = [];
		absl.removeChildren();
	}

	tmpDoorList = await usrService.getDoors();
	hideMainLoader();
	// console.log('tmpDoorList');
	// console.dir(tmpDoorList);
	generate(tmpDoorList.length, 100, page);
	renderDoors();
	page.bindingContext = new HomePageModel(page, msgService, usrService, tmpDoorList);

}

// export async function onNavigatedTo(args: EventData) {
export async function renderDoors() {
	// console.log('generatedButtons');
	// console.dir(generatedButtons);
	for (let index = 0; index < generatedButtons.length; index++) {
		const doorButton: FlexboxLayout = generatedButtons[index];
		await doorButton.animate({
			scale: {x: 1.2, y: 1.2},
			opacity: 1,
			duration: 100
		}).then( () => {
			doorButton.animate({
				scale: {x: 1, y: 1},
				duration: 80
			});
		});
	}
}

export async function goToDoor(args: any) {
	const button = <Button>args.object;
	const page = <Page>button.page;

	const theNavEntry: NavigationEntry = {
		moduleName: 'pages/door/door-page',
		// backstackVisible: false,
		context: {
			door_id: button['door-id'],
			door_name: button['door-name'],
			door_color: button['door-color']
		}
	};

	try {
		page.frame.navigate(theNavEntry);
	} catch (error) {
		console.log('errore nav to porta', error);
	}
}

export async function toProfile(args: EventData) {
	let button = <Button>args.object;
	button.page.frame.navigate('pages/profile/profile-page');
}

export async function addDoor(args: EventData) {
	const button = <Button>args.object;
	button.page.frame.navigate({
		moduleName: 'pages/door/create/add-door-page',
		backstackVisible: false,
		context: {
			is_edit: false
		}
	});
}

// ---------------------
// FUNZIONI DI SUPPORTO
// ---------------------
function setup(n: number, r: number, page: Page) {
	const absLayout = <AbsoluteLayout>page.getViewById('door_container');
	for (var i = 0; i < n; i++) {
		const btn = new Image();
		const theDoor : Door = tmpDoorList[i];
		console.log('theDoor');
		console.dir(theDoor);
		// btn.setInlineStyle(`background-color: ${tmpDoorList.getItem(i).color};`);
		btn.src = theDoor.color;
		btn.width = 107;
		btn.height = 107;
		btn['door-id'] = theDoor.id;
		btn['door-name'] = theDoor.name;
		btn['door-color'] = theDoor.color;
		btn.addEventListener('tap', goToDoor);

		const lbl = new Label();
		lbl.text = theDoor.name.charAt(0).toUpperCase() + theDoor.name.slice(1);
		const btnWrapper = new FlexboxLayout();
		btnWrapper.left = (widthDevice / (tmpDoorList.length <= 3 ? 3 : 2.75)) + Math.round(r * (Math.cos(theta[i])));
		btnWrapper.top = Math.round(r * (Math.sin(theta[i])));
		btnWrapper.style.marginTop = 120;
		btnWrapper.className = 'md-door-btn';

		btnWrapper.opacity = 0;
		btnWrapper.scaleX = 0;
		btnWrapper.scaleY = 0;
		btnWrapper.addChild(btn);
		btnWrapper.addChild(lbl);
		absLayout.addChild(btnWrapper);
		generatedButtons.push(btnWrapper);
	}
	const mainLayout = <GridLayout>page.getViewById('full-container');
	const frags = 360 / n;
	mainLayout.on(GestureTypes.swipe, function (args: SwipeGestureEventData) {
		const direct = args.direction == 1 ? 'right' : args.direction == 2 ? 'left' : 'none';
		if (_direct < 4) {
			_direct ++;
		} else {
			_direct = 0;
		}
		if (direct == 'right') {
			_angle += frags;
			angle -= frags;
			absLayout.animate({
				rotate: _angle,
				duration: 2000
			});
			for (let index = 0; index < n; index++) {
				const doorButton: FlexboxLayout = generatedButtons[index];
				doorButton.animate({
					rotate: angle,
					duration: 2000
				});
			}
		} else {
			_angle -= frags;
			angle += frags;
			absLayout.animate({
				rotate: _angle,
				duration: 2000
			});
			for (let index = 0; index < n; index++) {
				const doorButton: FlexboxLayout = generatedButtons[index];
				doorButton.animate({
					rotate: angle,
					duration: 2000
				});
			}
		}
	});
};

function generate(n: number, r: number, page: Page) {
	var frags = 360 / n;
	for (var i = 0; i < n; i++) {
		theta.push((frags / 180) * i * Math.PI);
	}
	setup(n, r, page)
}

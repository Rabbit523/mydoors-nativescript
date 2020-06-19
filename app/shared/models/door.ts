import { User } from "./user";

export class Door {
    id: string;
    name: string;
    color: string;
    users: Array<User>;
}

export const defaultDoorData = {
	first: {
		name: 'Family',
		color: '~/images/doors/red.png',
		users: []
	},
	second: {
		name: 'Basket',
		color: '~/images/doors/blue.png',
		users: []
	},
	third: {
		name: 'School',
		color: '~/images/doors/salmon.png',
		users: []
	},
};


export const doorImages: string[] = [
    '~/images/doors/dark_azure.png',
    '~/images/doors/blue.png',
    '~/images/doors/bright_orange.png',
    '~/images/doors/bright_yellow.png',
    '~/images/doors/dark_orange.png',
    '~/images/doors/lime.png',
    '~/images/doors/raspberry.png',
    '~/images/doors/red.png',
    '~/images/doors/salmon.png',
    '~/images/doors/violet.png',
];

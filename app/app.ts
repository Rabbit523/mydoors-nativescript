import * as app from "tns-core-modules/application";
import { isIOS } from "tns-core-modules/platform";
import { Downloader } from 'nativescript-downloader';

declare var GMSServices: any;

require ("nativescript-local-notifications");
Downloader.init();

if ( isIOS ) GMSServices.provideAPIKey("PUT_API_KEY_HERE");

app.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/

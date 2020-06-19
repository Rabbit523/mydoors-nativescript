import * as appSettings from 'tns-core-modules/application-settings';
import * as http from 'tns-core-modules/http';
import * as camera from "nativescript-camera";
import * as firebase from "nativescript-plugin-firebase";
import { ImageAsset } from 'tns-core-modules/image-asset/image-asset';

export function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export const HTTP = {
    async get(url: string, headers? : any) : Promise<any> {
        const res = await http.request({
            url: url,
            method: "GET",
            headers: headers,
        });
        return res.content.raw;
        // return res;
    },

    async post(url: string, body: any, headers?: any) : Promise<any> {
        const res = await http.request({
            url: url,
            method: "POST",
            headers: headers,
            content: JSON.stringify(body)
		});
        return res.content.raw;
        // return res;
    }
}


export function takePhoto(cb) {
	return camera.requestPermissions()
		.then( function success() {
			camera.takePicture({saveToGallery: false, width: 300, keepAspectRatio: true})
				.then((imageAsset) => {
					console.log("Result is an image asset instance");
					console.dir(imageAsset);
					cb(imageAsset as ImageAsset);
				}).catch((err) => {
					console.log("Error -> " + err.message);
					console.log(err);
				});
		}, function failure() {
			alert({
				title: 'Spiacenti',
				message: 'Non è stato concesso il permesso di effettuare foto',
				okButtonText: 'OK'
			});
		}
	);
}

export const FBserverKey: string = 'AAAASs-X9VU:APA91bGBs0fk0MuCRTmRJGjLtYCNoOlXwTJ4O2zDQSl1fQtP5k9HOML_JFQ8aUqxHhNUHbI4yqs75PoSZGzoEbMDR51dnQ6w8_gY4G8HwY_nrrPIyiQtU4tXS72hvUzEGuKm-Uv_ooyA';
export function sendNotification( token : string, title : string, body : string, data? : any ) {
	return HTTP.post(
		'https://fcm.googleapis.com/fcm/send',
		{
			to: token,
			notification: {
				title: title,
				body: body,
				// mutable_content: true,
				// sound: 'Tri-tone'
			},
			data: data
		},
		{
			"Content-Type": "application/json",
			"Authorization": `key=${FBserverKey}`
		}
	);
}

export function saveToRemoteFile(remote_path: string, file_path: string, contentType: string) : Promise<string> {
	return firebase.storage.uploadFile({
		remoteFullPath: remote_path,
		localFullPath: file_path,
		metadata: {
			contentType: contentType,
			contentLanguage: 'it'
		}
	})
	.then(uploadedFile => {
		console.log("File uploaded: " + JSON.stringify(uploadedFile));
		return firebase.storage.getDownloadUrl({ remoteFullPath: remote_path })
	});
}

export const getBackgroundColor = () : string => appSettings.getString('md_background_color');
export const setBackgroundColor = (v : string) : void => { appSettings.setString('md_background_color', v); };

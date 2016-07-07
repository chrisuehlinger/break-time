'use strict';
const electron = require('electron');
const app = electron.app;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function createOptionsWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400
	});

	win.loadURL(`file://${__dirname}/options.html`);

	return win;
}

function breakTime() {
	const win = new electron.BrowserWindow({
		fullscreen: true
	});

	win.loadURL(`file://${__dirname}/popup.html`);
	setTimeout(function(){
		win.close();
	}, 1000);

	return win;

}


app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createOptionsWindow();
	}
});

app.on('ready', () => {
	createOptionsWindow();
	setInterval(breakTime, 10000);
});

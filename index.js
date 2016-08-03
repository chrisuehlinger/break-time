'use strict';
const electron = require('electron');
const { app, ipcMain } = electron;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let optionsWindow,
	breakWindows = [],
	options = {
		breakTime: 5,
		breakInterval: 10
	},
	breakInterval = null;

function createOptionsWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400
	});

	win.loadURL(`file://${__dirname}/options.html`);
	win.options = options

	return win;
}

function takeABreak() {
	if(breakWindows.length === 0) {
		breakWindows = electron.screen.getAllDisplays().map(function(display){
			console.log(display);
			const win = new electron.BrowserWindow({
				alwaysOnTop: true,
				frame: false,
				transparent: true,
				x: display.bounds.x,
				y: display.bounds.y,
				width: display.bounds.width,
				height: display.bounds.height,
				parent: optionsWindow
			});

			win.loadURL(`file://${__dirname}/popup.html`);
			win.options = options;
			return win;
		});
	}
}

function endBreak(){
	breakWindows.map(function(win){
		win.close();
	});
	breakWindows = [];
}

ipcMain.on('options', (event, newOptions) => {
	if(newOptions.breakInterval !== options.breakInterval) {
		clearInterval(breakInterval);
		breakInterval = setInterval(takeABreak, newOptions.breakInterval * 1000);
	}

	options = newOptions;
});

ipcMain.on('end-break', endBreak);

app.on('activate', () => {
	if (!optionsWindow) {
		optionsWindow = createOptionsWindow();
	}
});

app.on('ready', () => {
	createOptionsWindow();
	breakInterval = setInterval(takeABreak, options.breakInterval * 1000);
});

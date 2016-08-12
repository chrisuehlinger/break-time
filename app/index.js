if(require('electron-squirrel-startup')) return;

'use strict';
const path = require('path');
const electron = require('electron');
const { app, ipcMain, Tray, Menu } = electron;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let optionsWindow,
	breakWindows = [],
	tray = null,
	options = {
		breakTime: 5,
		breakInterval: 10
	},
	breakInterval = null;

function createOptionsWindow() {
	if(!optionsWindow) {
		optionsWindow = new electron.BrowserWindow({
			width: 600,
			height: 400
		});

		optionsWindow.loadURL(`file://${__dirname}/options.html`);
		optionsWindow.options = options;
		optionsWindow.on('close', function(){
			optionsWindow = null;
		});
	}
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
				skipTaskbar: true
			});

			win.loadURL(`file://${__dirname}/popup.html`);
			win.options = options;
			return win;
		})
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
		breakInterval = setInterval(takeABreak, newOptions.breakInterval * 60 * 1000);
	}

	options = newOptions;
});

ipcMain.on('end-break', endBreak);

app.on('activate', createOptionsWindow);

app.on('ready', () => {
	createOptionsWindow();
	breakInterval = setInterval(takeABreak, options.breakInterval * 60 * 1000);

	tray = new Tray(path.join(__dirname, 'icon.jpg'));

	const contextMenu = Menu.buildFromTemplate([
		{label:'Options', click:createOptionsWindow},
		{label:'Quit', click: app.quit}
	]);
	tray.setContextMenu(contextMenu);

	tray.setToolTip('Break Time');

	tray.on('click', createOptionsWindow);
});

app.on('window-all-closed', function() {

});

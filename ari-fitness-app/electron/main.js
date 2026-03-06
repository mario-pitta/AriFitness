const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, '../src/assets/mvk-gym-manager-logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: false // Hides the default Windows menu bar (File, Edit, etc.) for a cleaner app look
    });

    const args = process.argv.slice(1);
    const serve = args.some(val => val === '--serve');

    if (serve) {
        // Development mode: load from the active Angular dev server
        mainWindow.loadURL('http://localhost:8100');
        mainWindow.webContents.openDevTools();
    } else {
        // Production mode: load the compiled Angular index.html file
        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, '../www/index.html'),
                protocol: 'file:',
                slashes: true
            })
        );
        // Force DevTools open in production to debug the white screen
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

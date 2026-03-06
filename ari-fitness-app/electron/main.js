const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let indexPath; // shared so the menu reload handler can use it

function buildAppMenu(serve) {
    const reloadAction = () => {
        if (mainWindow) mainWindow.loadFile(indexPath);
    };

    const template = [
        {
            label: 'Editar',
            submenu: [
                { role: 'undo', label: 'Desfazer' },
                { role: 'redo', label: 'Refazer' },
                { type: 'separator' },
                { role: 'cut', label: 'Recortar' },
                { role: 'copy', label: 'Copiar' },
                { role: 'paste', label: 'Colar' },
                { role: 'selectAll', label: 'Selecionar Tudo' },
            ]
        },
        {
            label: 'Visualizar',
            submenu: [
                {
                    label: 'Recarregar',
                    accelerator: 'CmdOrCtrl+R',
                    click: serve
                        ? () => mainWindow.webContents.reload()  // dev: normal reload
                        : reloadAction                           // prod: always back to index.html
                },
                {
                    label: 'Forçar Recarregamento',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: serve
                        ? () => mainWindow.webContents.reloadIgnoringCache()
                        : reloadAction
                },
                { type: 'separator' },
                serve && { role: 'toggleDevTools', label: 'Abrir DevTools' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Zoom Padrão' },
                { role: 'zoomIn', label: 'Aumentar Zoom' },
                { role: 'zoomOut', label: 'Diminuir zoom' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Tela Cheia' },
            ].filter(Boolean)
        },
        {
            label: 'Janela',
            submenu: [
                { role: 'minimize', label: 'Minimizar' },
                { role: 'close', label: 'Fechar' },
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false,
        backgroundColor: '#1a1b2e',
        icon: path.join(__dirname, '../src/assets/mvk-gym-manager-logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, // Required: allows Angular HashRouter to navigate file:// hash routes
        },
        autoHideMenuBar: false
    });

    const args = process.argv.slice(1);
    const serve = args.some(val => val === '--serve');

    indexPath = path.join(__dirname, '../www/index.html');

    buildAppMenu(serve);

    if (serve) {
        mainWindow.loadURL('http://localhost:8100');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(indexPath);
    }

    // Intercept any navigation that leaves index.html and bring it back
    // This prevents Electron from trying to load #/route as a file
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        if (!serve && !navigationUrl.includes('index.html') && navigationUrl.startsWith('file://')) {
            event.preventDefault();
            mainWindow.loadFile(indexPath);
        }
    });

    // Override F5 / Ctrl+R reload so it always reloads index.html, not the raw current file URL
    // Without this, after hash navigation the reload hits file:///...www/ (directory) instead of index.html  
    mainWindow.webContents.on('before-input-event', (event, input) => {
        const isReload = (input.key === 'F5' && !input.alt) ||
            (input.key === 'r' && input.control && !input.alt && !input.shift);
        if (!serve && isReload) {
            event.preventDefault();
            mainWindow.loadFile(indexPath);
        }
    });

    // Show window only when Angular signals it's ready via IPC (AppComponent.ngOnInit)
    // This is the most accurate timing — after Angular has rendered the DOM
    let windowShown = false;
    const showWindow = () => {
        if (!windowShown) {
            windowShown = true;
            mainWindow.show();
        }
    };

    ipcMain.once('app-ready', showWindow);

    // Fallback: show after 4 seconds no matter what
    setTimeout(showWindow, 4000);

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

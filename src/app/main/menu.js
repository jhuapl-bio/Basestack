const { Menu, shell } = require("electron")
const { spawn, exec, execSync } = require('child_process');


export class ClientMenu {
	constructor(logger, mainWindow, dialog, app, system, spawned_logs, updater){
		this.logger = logger
		this.dialog = dialog
		this.app = app
		this.spawned_logs= spawned_logs
		this.system = system
		this.mainWindow = mainWindow
		this.updater = updater
	}
	async makeMenu(){
		const $this = this
		let bat = undefined; 
		var menu = Menu.buildFromTemplate([
		{
			label: 'Edit',
			submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			...($this.system.isMac ? [
				{ role: 'pasteAndMatchStyle' },
				{ role: 'delete' },
				{ role: 'selectAll' },
				{ type: 'separator' },
				{
				label: 'Speech',
				submenu: [
					{ role: 'startspeaking' },
					{ role: 'stopspeaking' }
				]
				}
			] : [
				{ role: 'delete' },
				{ type: 'separator' },
				{ role: 'selectAll' }
			])
			]
		},
		{
			label: 'System',
			submenu: [
			{ 
				label: 'Refresh Server (current Port)',
				click() {   
					if (process.env.NODE_ENV == 'production'){
						const create_server = require("../../server/index.server.js").create_server
						create_server(process.env.PORT_SERVER);  
					}
				}
			},
			{
				label: 'Print ENV',
				click() {  console.log(JSON.stringify(process.env, null, 4))  }
			},
			{
				label: 'Docker Site',
				click() { 
				shell.openExternal('https://docs.docker.com/get-docker/')
				}        
			},
			{ 
				label: 'Open Desktop',
				click(){
				shell.openPath($this.app.getPath('desktop'))
				}
			}, 
			{
				label: 'Restart $this.app',
				click() {  
				if (process.env.NODE_ENV === 'production'){
					$this.app.relaunch(); $this.app.quit()
				} else { 
					$this.app.quit()
				}  
				}
			},
			{
				label: "Check Docker Installed",
				click(){
				let bat;
				if ($this.system.isWin){
					bat = exec("whereis docker", { cwd: $this.app.getPath('desktop') }); 
				}
				else {
					bat = exec("which docker", { cwd: $this.app.getPath('desktop') })
				}
				$this.spawned_logs(bat, {throwError: true, throwExit: true, process: "Checking Docker installed: "})
				}
			},
			{
				label: "Open Terminal",
				click(){
				let bat;
				if ($this.system.isWin){
					bat = exec("start cmd", { cwd: $this.app.getPath('desktop') }); 
				}
				else if($this.system.isMac){
					bat = exec("open -a Terminal", { cwd: $this.app.getPath('desktop')})
				} else {
					bat = exec("gnome-terminal", { cwd: $this.app.getPath('desktop'), detached:true })
				}
				$this.spawned_logs(bat, {throwError: true, process: "Open Terminal"})
				}
			},
			...($this.system.isWin ? [
			{
				label: 'Windows Services',
				submenu: [
				{
					label: 'Hyper-V',
					submenu:[
					{
						label: 'Disable Hyper-V',
						click() {  
						let bat = exec("powershell -Command \"Start-Process -Verb RunAs cmd.exe \'/K DISM /Online /Disable-Feature:Microsoft-Hyper-V\'\"", { cwd: $this.app.getPath('desktop') }); 
						$this.spawned_logs(bat, {throwError: true, process: "Disable HyperV"})
						}
					},
					{
						label: 'Enable Hyper-V',
						click() {  
						let bat = exec("powershell \"Start-Process -Verb RunAs cmd.exe \' /K DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V\' \"", { cwd: $this.app.getPath('desktop') }); 
						$this.spawned_logs(bat, {throwError: true, process: "Enable HyperV"})
						}
					},
					]
				},
				{
					label: 'WSL2',
					submenu:[
					{
						label: '1. Download WSL2',
						click() { 
						let batDownload = exec("curl.exe https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi -o wsl_update_x64.msi", { cwd: $this.app.getPath('desktop') }); 
						batDownload.stderr.on('data', (data) => {
							console.log(`${data.toString()} err`);
							$this.mainWindow.webContents.send('mainNotification', {
							icon: '',
							loading: false,
							message: data.toString(),
							disable_popup: true
							})
						});
						batDownload.stdout.on('data', (data) => {
							console.log(`${data.toString()} info`)
						});
						batDownload.on('exit', (code) => {
						const text = `<p>WSL2 MSI Download Process complete with code: ${code}.<hr> 0: Success, 1 or more is failure <hr> Next, select 2. Install WSL2</p>`
							console.log(text);
							$this.mainWindow.webContents.send('mainNotification', {
							icon: '',
							loading: false,
							message: text,
							disable_popup: true
							})
						});
						}
					},
					{
						label: '2. Install WSL2',
						click() { 
						let batInstaller = exec("start /wait msiexec /i wsl_installer.msi ", { cwd: $this.app.getPath('desktop') }); 
						$this.spawned_logs(batInstaller, {throwError: true, process: "Install WSL2"})
						}
					},
					{
						label: '3. Turn WSL On',
						click() {  
						let bat = exec("powershell -Command \"Start-Process -Verb RunAs cmd.exe \'/K DISM /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart\'\"", { cwd: $this.app.getPath('desktop') }); 
						$this.spawned_logs(bat, {throwError: true, process: "Disable HyperV"})
						}
					},
					{
						label: '4. Enable Virtualization',
						click() {  
						let bat = exec("powershell -Command \"Start-Process powershell \'Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux\' -Verb runAs \"", { cwd: $this.app.getPath('desktop'), detached:true }); 
						$this.spawned_logs(bat, {throwError: true, process: "Disable HyperV"})
						}
					},
					{
						label: '5. Set WSL2',
						click() {  
						let bat = exec("powershell -Command \"wsl --set-default-version 2\"", { cwd: $this.app.getPath('desktop') }); 
						$this.spawned_logs(bat, {throwError: true, process: "Disable HyperV"})
						}
					},
					
					]
				},
				{
					label: "Add User Docker-Users",
					click(){
					// "net localgroup docker-users %USERNAME% /add"
					let bat = exec("powershell \"Start-Process -Verb RunAs cmd.exe \' /K net localgroup docker-users %USERNAME% /add\' \"  ", { cwd: $this.app.getPath('desktop') }); 
					$this.spawned_logs(bat, {throwError: true, process: "Add docker-users"})
					}
				},
				{
					label: "Enable Hypervisor",
					click(){
					let bat = exec("powershell -Command \"Start-Process powershell \'bcdedit /set hypervisorlaunchtype auto\' -Verb runAs \"", { cwd: $this.app.getPath('desktop'), detached:true }); 
					$this.spawned_logs(bat, {throwError: true, process: "Add docker-users"})
					}
				},
				{
					label: "Show System Info",
					click(){
					// "net localgroup docker-users %USERNAME% /add"
					let bat = exec("start cmd /K systeminfo", { cwd: $this.app.getPath('desktop') }); 
					$this.spawned_logs(bat, {throwError: true, process: "Show System Info"})
					}
				},
				{
					label: "Open Powershell",
					click(){
					let bat = exec("powershell \"Start-Process powershell -Verb runAs\"", { cwd: $this.app.getPath('desktop') }); 
					$this.spawned_logs(bat, {throwError: true, process: "Open Terminal"})
					}
				},
				]
			}, 
			{role: "close"} 
			] : 
			[ 
				{ role: 'close' } 
			]),
			]
		},
		{
			label: 'View',
			submenu: [
			{ role: 'reload' },
			{ role: 'forcereload' },
			{ role: 'close' },
			{ role: 'quit' },
			{ role: 'toggledevtools' },
			{ type: 'separator' },
			{ role: 'resetzoom' },
			{ role: 'zoomin' },
			{ role: 'zoomout' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
			]
		},
		{
			label: 'Window',
			submenu: [
			{ role: 'minimize' },
			{ role: 'zoom' },
			...($this.system.isMac ? [
				{ type: 'separator' },
				{ role: 'front' },
				{ type: 'separator' },
				{ role: 'window' }
			] : [
				{ role: 'close' }
			])
			]
		},
		{
			label: "Check for Updates",
			click() { 
				$this.updater.checkUpdates()
			}
		},
		{
			label: 'Logs and Info',
			submenu: [
			{
				label: 'Open Logs',
				click() {  shell.openPath($this.store.system.logPath )  }
			},
			{
				label: 'View Release Notes',
				click() {  
				console.log("Getting release notes")
				$this.mainWindow.webContents.send('mainNotification', {
					icon: 'info',
					message: `${$this.updater.releaseNotes.releaseNotes}`,
					disable_popup: true,
					patchNotes: true
				})
				$this.mainWindow.webContents.send('releaseNotes', $this.updater.releaseNotes)
				}
			},
			{
				label: 'Open Issue/Feature Tracker',
				click(){shell.openExternal('https://github.com/jhuapl-bio/Basestack/issues')}
			}
			]
		},
		{
			role: 'help',
			submenu: [
			{
				label: 'Learn More',
				click () { shell.openExternal('https://github.com/jhuapl-bio/Basestack') }
			}
			]
		}
		])
		Menu.setApplicationMenu(menu);
		return menu
	}
}
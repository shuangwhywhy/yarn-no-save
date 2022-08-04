# yarn-no-save

Enabling `--no-save` / `-N` option to **Yarn** cli commands. The option prevents saving to package.json when you do `yarn add` stuff.

# How to Use

## Basicly

1. First you should have yarn installed globally. See more at [the official site](https://classic.yarnpkg.com/en/docs/install#mac-stable)

2. install **yarn-no-save** globally:
	```bash
	$ yarn global add yarn-no-save
	```

3. Now you can use **Yarn** with `--no-save` / `-N` option in your command:
	```bash
	$ yarn add --no-save xxxxxxxx
	```

## Advanced

Firstly, let's see how it works. Basically, we are making a *feature injection* to Yarn:

- before saving to the root manifest (package.json), we try to stop the saving operation if `--no-save` / `-N` option is given.

- to prevent yarn to throw an exception when we are trying to remove packages which are not found in the manifest file (package.json).

- to update the help message.

Also, the *"feature injection"* will fail if Yarn in updated or reinstalled, so we need to check if any changes (including file replacement) are made to the file. Therefore, we build a watcher to surveil the changes. In order to ease you up, we register it as a system service at startup. So there is nothing more to do when you reinstall Yarn by default.

In advance, we offered you someway to control the service. Here are the advanced usages (**These commands are ONLY available for MacOS**):

1. Stop watching and reset Yarn to default:
	```bash
	$ yns reset
	```
	This will reinstall Yarn from your current registry. If you want `--no-save` option to come back, you should run the following commands:
	```bash
	$ yns
	$ yns start
	```

2. Start watching service:
	```bash
	$ yns start
	```

3. Stop watching service:
	```bash
	$ yns stop
	```

4. Restart watching service:
	```bash
	$ yns restart
	```

# To Mention

1. The **--no-save / -N** option will be available in help message by typing "`yarn help add`" or "`yarn add --help`".

2. You are free to uninstall any packages installed with `--no-save` / `-N` option by executing "`yarn uninstall xxxxx`" (postuninstall scripts will be executed by doing this, while the same thing won't happen by just deleting the folders from node_modules).

3. Please [contact me](mailto:qyz.yswy@hotmail.com) if you have any problems into this tool.

# Author

[@shuangwhywhy](mailto:qyz.yswy@hotmail.com)

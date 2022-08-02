# yarn-no-save

Enabling `--no-save` / `-N` option to **Yarn** cli commands. The option prevents saving to package.json when you do `yarn add` stuff.

# How to Use

1. First you should have yarn installed globally. [https://classic.yarnpkg.com/en/docs/install#mac-stable](https://classic.yarnpkg.com/en/docs/install#mac-stable)

2. install **yarn-no-save** globally:
	```bash
	$ yarn global add yarn-no-save
	```

3. Now you can use **Yarn** with `--no-save` / `-N` option in your command:
	```bash
	$ yarn add --no-save xxxxxxxx
	```

# To Mention

1. The **--no-save / -N** option will be available in help message by typing "`yarn help add`" or "`yarn add --help`".

2. You are free to uninstall any packages installed with `--no-save` / `-N` option by executing "`yarn uninstall xxxxx`" (postuninstall scripts will be executed by doing this, while the same thing won't happen by just deleting the folders from node_modules).

3. You can reset **Yarn** to default at anytime by reinstall yarn:
	```bash
	$ npm i -g yarn
	```

4. If you want `--no-save` option available again after reinstalling **Yarn**, just run the following command again:
	```bash
	$ yns
	```

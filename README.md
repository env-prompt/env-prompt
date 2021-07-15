# env-prompt
Env-prompt is a Node.js utility that enables teams to seamlessly keep their environment variables in sync.

You simply provide two **.env** files:
 - a **distributed file** (default: **`.env.dist`**) committed to version control
 - a git ignored **local file** (default: **`.env`**)

As new variables are added to the **distributed file**, your team is prompted for their values.

## Getting started
1) Install env-prompt:
```sh
$ npm install -D env-prompt
```

2) Add the `env-prompt` command to a script in your `package.json` file:
```diff
{
  "name": "test",
  "main": "index.js",
+ "scripts": {
+   "start": "env-prompt"
+ },
  "devDependencies": {
    "env-prompt": "^2.0.0"
  }
}
```

3) Create a `.env.dist` file in the same directory as your `package.json` file:
```
API_HOSTNAME=https://example.com
API_USER=api_user
API_PASS=myL1tP4$$w0rd
```

Env-prompt is now set up to diff your `.env` and `.env.dist` files when executing `npm run start`.

## Command-line interface
### Synopsis
```sh
[CI=<true|false>] npx env-prompt
    [--distFile|-d <path>]
    [--localFile|-l <path>]
    [--prompts|-p <true|false>] 
```

### Arguments

| Name | Default | Description |
| --- | --- | ---
| `--distFile`, `-d` | `.env.dist` | This is the .env file that env-prompt will scan for new environment variables. It is recommended that you commit this file to version control.
| `--localFile`, `-l` | `.env` | This is the .env file for your local environment. When prompted for new variables, the input values will be written here. It is recommended that you add this file to the `.gitignore` of your project.
| `--prompts` | `true`  | When setting `--prompts false`, env-prompt will run headlessly and will not prompt the user when new variables are detected. The default value from the distributed file will be written for new variables.

### Shell variables
| Name | Default | Description
| --- | --- | ---
| `CI` | `false` | Tells env-prompt if it's being executed by continuous integration. Setting `CI=true` will make env-prompt run headlessly, and is equivalent to `--prompts false`.

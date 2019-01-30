# env-prompt
A dependency-free utility that prompts you for your project's environment variables.

## How does it work?
On `npm install`, env-prompt reads environment variables from two files in your project:
 - a **distributed** file (default: **`.env.dist`**)
 - a git ignored **local** file (default: **`.env`**)

Envprompt will diff these two files, prompting you for any values that exist in your distributed file but not in your
 local file.  Your newly input values will be written to your local environment file.

## Getting started
1) Install env-prompt:
```sh
$ npm install -D env-prompt
```

2) Add a postinstall hook to your `package.json` file:
```diff
{
  "name": "test",
  "main": "index.js",
+ "scripts": {
+   "postinstall": "env-prompt"
+ },
  "devDependencies": {
    "env-prompt": "^1.0.0"
  }
}
```

3) Create a `.env.dist` file in the same directory as your `package.json` file:
```
DB_USER=root
DB_PASS=root123
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sakila
```

Env-prompt is now setup, and will be triggered when you run `npm install`.

## Options
```sh
-d, --distFile <path>         
       Change the distributed environment file env-prompt reads from. (default: .env.dist)

-l, --localFile <path>
       Change the local environment file env-prompt reads from and writes to. (default: .env)
```

## [Product backlog](https://github.com/env-prompt/env-prompt/issues?q=is%3Aissue+is%3Aopen+label%3Agroomed)
*See an issue not listed in the product backlog?  Feel free to
 [open an issue](https://github.com/env-prompt/env-prompt/issues/new).*

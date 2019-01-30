# env-prompt
A dependency-free utility that prompts you for your project's environment variables.

## How does it work?
On `npm install`, env-prompt reads from two environment files:
 - a distributed version (default: `.env.dist`)
 - a local version (default: `.env`)

Envprompt will diff these two files, prompting you for any values that exist in the distributed version
 but not your local version.

## Getting started
1) Install env-prompt:
```sh
$ npm install -D env-prompt
```

2) Add postinstall hook to `package.json`:
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

3) Create a `.env.dist` file in the same directory as your `package.json`:
```
DB_USER=root
DB_PASS=root123
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sakila
```

Env-prompt is now configured.  On `npm install`, you will now be prompted for any new values in your `.env.dist`
 file that don't exist in `.env`.

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

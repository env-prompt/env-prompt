# envprompt
A dependency-free utility that prompts you for your project's environment variables.

# How does it work?
On `npm install`, envprompt reads from two environment files:
 - a distributed version (default: `.env.dist`)
 - a local version (default `.env`)

Envprompt will diff these two files, prompting you for any values that exist in the distributed version
 but not your local version.

# Getting started
[Coming soon.](https://github.com/envprompt/envprompt/issues/5)

# Product backlog
Our backlog of groomed user stories can be viewed [here](https://github.com/envprompt/envprompt/issues?q=is%3Aissue+is%3Aopen+label%3Agroomed).

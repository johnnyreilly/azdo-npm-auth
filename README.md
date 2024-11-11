<p align="center"><img alt="Logo for project" src="azdo-npm-auth-logo-small.png" /></p>

<h1 align="center">Azure DevOps npm auth</h1>

<p align="center">
	<a href="https://github.com/johnnyreilly/azdo-npm-auth/actions/workflows/release.yml" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://github.com/johnnyreilly/azdo-npm-auth/actions/workflows/release.yml/badge.svg" /></a>
	<a href="https://github.com/johnnyreilly/azdo-npm-auth/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://github.com/johnnyreilly/azdo-npm-auth/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
	<a href="http://npmjs.com/package/azdo-npm-auth"><img alt="📦 npm version" src="https://img.shields.io/npm/v/azdo-npm-auth?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

Simply set up user authentication to Azure DevOps npm feeds, optionally using the Azure CLI for PAT acquisition.

## Usage

To get `azdo-npm-auth` to create the necessary user `.npmrc` file, run the following command:

```shell
npx cross-env npm_config_registry=https://registry.npmjs.org npx azdo-npm-auth
```

You might be wondering what the `cross-env npm_config_registry=https://registry.npmjs.org` part is for. It is a way to ensure that the `npx` command uses the **public** npm registry to install `azdo-npm-auth`. Without this, you might encounter an error like below:

```shell
npm error code E401
npm error Unable to authenticate, your authentication token seems to be invalid.
npm error To correct this please try logging in again with:
npm error npm login
```

The `npx cross-env` at the start is only necessary if you're catering for Windows users that do not use Bash. Otherwise you could simplify to just:

```shell
npm_config_registry=https://registry.npmjs.org npx azdo-npm-auth
```

## Help with `npm error code E401`

When you are attempting to install from private feeds, npm will commonly error out with some form of `npm error code E401`.

This section exists to list some classic errors you might encounter when you try to `npm i`. Regardless of the error, the remedy is generally:

```shell
npm_config_registry=https://registry.npmjs.org npx azdo-npm-auth
```

### User `.npmrc` not found

When you have no user `.npmrc` file you'll encounter an error like this:

```shell
npm error code E401
npm error Unable to authenticate, your authentication token seems to be invalid.
npm error To correct this please try logging in again with:
npm error npm login
```

### Token used in user `.npmrc` file is expired

When your token has expired in your user `.npmrc` file you'll encounter an error like this:

```shell
npm error code E401
npm error Incorrect or missing password.
npm error If you were trying to login, change your password, create an
npm error authentication token or enable two-factor authentication then
npm error that means you likely typed your password in incorrectly.
npm error Please try again, or recover your password at:
npm error https://www.npmjs.com/forgot
npm error
npm error If you were doing some other operation then your saved credentials are
npm error probably out of date. To correct this please try logging in again with:
npm error npm login
```

## Integration with `package.json`

### `preinstall` script

A great way to integrate `azdo-npm-auth` is by using it in a `preinstall` script in your `package.json`:

```json
"scripts": {
  "preinstall": "npx --yes azdo-npm-auth --config ./subdirectory-with-another-package-json/.npmrc"
},
```

The `--yes` flag above skips having npm challenge the user as to whether to download the package; useful in a CI environment.

However, as you're probably noticing, this requires having multiple `package.json`s and only having the `.npmrc` file in the nested one. Assuming that works for you, brilliant. It may not - don't worry. We'll talk about that in a second.

In case you're wondering, the below **won't** work:

```json
"scripts": {
  "preinstall": "npm_config_registry=https://registry.npmjs.org npx --yes azdo-npm-auth"
},
```

Alas, it is not possible to get the `preinstall` script to ignore the project `.npmrc` file when it runs. As a consequence the `preinstall` script results in a `npm error code E401` and much sadness.

### `auth` script

Instead, we generally advise setting up a script like the one below:

```json
"scripts": {
  "auth": "npm_config_registry=https://registry.npmjs.org npx --yes azdo-npm-auth"
},
```

And using `npm run auth` when a `npm error code E401` is encountered. We've called this script `auth` for the example - you can choose any name you like.

## Prerequisites

If you would like `azdo-npm-auth` to acquire a token on your behalf, then it requires that your [Azure DevOps organisation is connected with your Azure account / Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/connect-organization-to-azure-ad?view=azure-devops). Then, assuming you are authenticated with Azure, it can acquire an Azure DevOps Personal Access Token on your behalf. To authenticate, run `az login`. [If you need to install the Azure CLI, follow these instructions](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli). It is not necessary to run `az login` if you are already authenticated with Azure.

If you would like to acquire a PAT token manually, there is a `--pat` option for that very circumstance.

`azdo-npm-auth` requires the project `.npmrc` file exists in order that it can acquire the information to create the content of a user `.npmrc` file. There is an optional `config` parameter; if it is not supplied `azdo-npm-auth` will default to use the `.npmrc` in the current project directory. There will be instructions for creating a project `.npmrc` file in Azure DevOps, for connecting to the Azure Artifacts npm feed. A project `.npmrc` file will look something like this:

```shell
registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/

always-auth=true
```

## What about CI?

You might be worried about `azdo-npm-auth` trying to create user `.npmrc` files when running CI builds. Happily this does not happen; it detects whether it is running in a CI environment and does **not** create a user `.npmrc` file in that case.

## Why Azure DevOps npm auth?

Azure DevOps provides a mechanism for publishing npm packages for private use. This package sets up the necessary authentication to access those packages; particularly for non Windows users.

Consider the onboarding process for a Windows user for consuming an Azure Artifact npm feed:

![screenshot of the onboarding process for Windows users](screenshot-onboarding-with-windows.png)

Now consider the onboarding process for a non Windows user:

![screenshot of the onboarding process for non Windows users](screenshot-onboarding-with-other.png)

As we can see, there is a significant difference in the onboarding experience between operating systems. Windows users can use a tool named [`vsts-npm-auth`](https://www.npmjs.com/package/vsts-npm-auth) which automates onboarding. Non windows users have a longer road to follow. The instructions walk through manually creating an `.npmrc` file in a users home directory which contains information including a base 64 encoded Azure DevOps Personal Access Token with the Packaging read and write scopes. It is tedious to do.

`azdo-npm-auth` aims to automate the toil, and make the onboarding experience for non Windows users as simple as it is for Windows users.

There is an official package named [`ado-npm-auth`](https://github.com/microsoft/ado-npm-auth). However, [due to issues I experienced in using the `ado-npm-auth` package](https://github.com/microsoft/ado-npm-auth/issues/50), I found myself creating `azdo-npm-auth`.

## Options

`-c` | `--config` (`string`): The location of the .npmrc file. Defaults to current directory

`-e` | `--email` (`string`): Allows users to supply an explicit email - if not supplied, the example ADO value will be used

`-p` | `--pat` (`string`): Allows users to supply an explicit Personal Access Token (which must include the Packaging read and write scopes) - if not supplied, will be acquired from the Azure CLI

`-h` | `--help`: Show help

`-v` | `--version`: Show version

## Credits

> 💙 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app).

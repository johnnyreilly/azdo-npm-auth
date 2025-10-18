<p align="center"><img alt="Logo for project" src="azdo-npm-auth-logo-small.png" /></p>

<h1 align="center">Azure DevOps npm auth</h1>

<p align="center">
	<a href="https://github.com/johnnyreilly/azdo-npm-auth/actions/workflows/release.yml" target="_blank"><img alt="Release" src="https://github.com/johnnyreilly/azdo-npm-auth/actions/workflows/release.yml/badge.svg" /></a>
	<a href="https://github.com/johnnyreilly/azdo-npm-auth/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://github.com/johnnyreilly/azdo-npm-auth/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
	<a href="http://npmjs.com/package/azdo-npm-auth"><img alt="📦 npm version" src="https://img.shields.io/npm/v/azdo-npm-auth?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

Simply set up user authentication to Azure DevOps npm feeds, optionally using the Azure CLI for Personal Access Token (PAT) acquisition.

## Usage

There are three ways to use `azdo-npm-auth`.

### `parse` mode

The simplest way to use `azdo-npm-auth` is to run it without any arguments. In this mode, `azdo-npm-auth` will parse the project `.npmrc` file in the current working directory and use the values it finds there to create a user `.npmrc` file. To get `azdo-npm-auth` to create the necessary user `.npmrc` file in `parse` mode, run the following command:

```shell
npx -y --registry https://registry.npmjs.org azdo-npm-auth
```

You might be wondering what the `--registry https://registry.npmjs.org` part is for. It is a way to ensure that the `npx` command uses the **public** npm registry to install `azdo-npm-auth`. Without this, you might encounter an error like below, as `npx` attempts to install `azdo-npm-auth` from the **private** Azure DevOps npm registry:

```shell
npm error code E401
npm error Unable to authenticate, your authentication token seems to be invalid.
npm error To correct this please try logging in again with:
npm error npm login
```

It is possible to use environment variables to control the `registry` setting as well; consider the following (non-Windows compatible) example:

```shell
npm_config_registry=https://registry.npmjs.org npx azdo-npm-auth
```

But passing the `--registry` flag directly is the recommended approach.

### `registry` mode

The `parse` mode works by reading the `registry` value from the project `.npmrc` file. If you would like to manually supply the `registry` value, you can do so. In this mode of operation `azdo-npm-auth` will not attempt to parse the **project** `.npmrc` file, and will use the supplied `registry` value to build a **user** `.npmrc` file.

```shell
npx -y --registry https://registry.npmjs.org azdo-npm-auth --registry https://pkgs.dev.azure.com/johnnyreilly/_packaging/organization-feed-name/npm/registry/
```

There's two `--registry` values in the above command. The first is the public npm registry which is where we want to access `azdo-npm-auth`. The second is the registry to use to create the user `.npmrc` file. You will need to change this second value to match your private npm registry feed URL. (This can be found in `Azure DevOps` > `Artifacts` > `Connect to feed` > `npm` or in a local `.npmrc` file).

### `make` mode

The `make` mode allows you to supply the the `organization`, `feed` and (optionally) `project` values to create a user `.npmrc` file. In this mode of operation `azdo-npm-auth` will not attempt to parse the **project** `.npmrc` file, and will use the supplied values to build a **user** `.npmrc` file.

If your feed is organization-scoped, you will **not** need to supply the `project` value:

```shell
npx -y --registry https://registry.npmjs.org azdo-npm-auth --organization johnnyreilly --feed organization-feed-name
```

If your feed is project-scoped, you will need to supply the `project` value:

```shell
npx -y --registry https://registry.npmjs.org azdo-npm-auth --organization johnnyreilly --project my-project --feed project-feed-name
```

## Pre-requisites

If you would like `azdo-npm-auth` to acquire a token on your behalf, then it requires that your [Azure DevOps organization is connected with your Azure account / Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/connect-organization-to-azure-ad?view=azure-devops). Then, assuming you are authenticated with Azure, it can acquire an Azure DevOps Personal Access Token on your behalf. To authenticate, run `az login`. [If you need to install the Azure CLI, follow these instructions](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli). It is not necessary to run `az login` if you are already authenticated with Azure.

If you would like to acquire a PAT token manually and supply it, there is a `--pat` option for that very need.

## Integration with `package.json`

### Custom npm script

We generally advise setting up a custom npm script like the one below:

```json
"scripts": {
  "auth": "npx -y --registry https://registry.npmjs.org azdo-npm-auth"
},
```

Users should `npm run auth` when a `npm error code E401` is encountered. We've called this script `auth` - you can choose any name you like.

You might be wondering why we do not recommend using a `preinstall` script. It's possible but there are gotchas. Read on.

### `preinstall` script

First the bad news. The below **won't** work:

```json
"scripts": {
  "preinstall": "npx -y --registry https://registry.npmjs.org azdo-npm-auth"
},
```

Alas, it is not possible to get the `preinstall` script to ignore the project `.npmrc` file when it runs. As a consequence the `preinstall` script results in a `npm error code E401` and much sadness. Read more about E401s [here](#help-with-npm-error-code-e401).

It is still possible to integrate `azdo-npm-auth` in a `preinstall` script in your `package.json`:

```json
"scripts": {
  "preinstall": "npx --yes azdo-npm-auth --config ./subdir-with-package-json/.npmrc"
},
```

However, as you're probably noticing, this approach requires having multiple `package.json`s and only having the `.npmrc` file in the nested one. Assuming that works for you, brilliant. It may not.

The `--yes` flag above skips having npm challenge the user as to whether to download the package; useful in a CI environment.

## What about CI?

You might be worried about `azdo-npm-auth` trying to create user `.npmrc` files when running CI builds. Happily this does not happen; it detects whether it is running in a CI environment and does **not** create a user `.npmrc` file in that case.

## Why does Azure DevOps npm auth exist?

Azure DevOps provides a mechanism for publishing npm packages for private use. This package sets up the necessary authentication to access those packages; particularly for non Windows users.

Consider the onboarding process for a Windows user for consuming an Azure Artifact npm feed:

![screenshot of the onboarding process for Windows users](screenshot-onboarding-with-windows.png)

Now consider the onboarding process for a non Windows user:

![screenshot of the onboarding process for non Windows users](screenshot-onboarding-with-other.png)

As we can see, there is a significant difference in the onboarding experience between operating systems. Windows users can use a tool named [`vsts-npm-auth`](https://www.npmjs.com/package/vsts-npm-auth) which automates onboarding. Non windows users have a longer road to follow. The instructions walk through manually creating an `.npmrc` file in a users home directory which contains information including a base 64 encoded Azure DevOps Personal Access Token with the Packaging read and write scopes. It is tedious to do.

`azdo-npm-auth` aims to automate the toil, and make the onboarding experience for non Windows users as simple as it is for Windows users.

There is an official package named [`ado-npm-auth`](https://github.com/microsoft/ado-npm-auth). However, [due to issues I experienced in using the `ado-npm-auth` package](https://github.com/microsoft/ado-npm-auth/issues/50), I found myself creating `azdo-npm-auth`.

## Options

| Short | Long             | Type     | Description                                                                                                                                                              |
| ----- | ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `-c`  | `--config`       | `string` | The location of the .npmrc file. Defaults to current directory                                                                                                           |
| `-o`  | `--organization` | `string` | The Azure DevOps organization - only required if not parsing from the .npmrc file                                                                                        |
| `-p`  | `--project`      | `string` | The Azure DevOps project - only required if not parsing from the .npmrc file and the feed is project-scoped                                                              |
| `-f`  | `--feed`         | `string` | The Azure Artifacts feed - only required if not parsing from the .npmrc file                                                                                             |
| `-r`  | `--registry`     | `string` | The registry to use, eg 'https://pkgs.dev.azure.com/johnnyreilly/_packaging/organization-feed-name/npm/registry/' - only required if not parsing from the .npmrc file    |
| `-e`  | `--email`        | `string` | Allows users to supply an explicit email - if not supplied, the example ADO value will be used                                                                           |
| `-d`  | `--daysToExpiry` | `number` | Allows users to supply an explicit number of days to expiry - if not supplied, then ADO will determine the expiry date                                                   |
| `-t`  | `--pat`          | `string` | Allows users to supply an explicit Personal Access Token (which must include the Packaging read and write scopes) - if not supplied, will be acquired from the Azure CLI |
| `-w`  | `--what-if`      |          | Do not write output to user .npmrc file; rather output to terminal                                                                                                       |
| `-h`  | `--help`         |          | Show help                                                                                                                                                                |
| `-v`  | `--version`      |          | Show version                                                                                                                                                             |

## Help with `npm error code E401`

When you are attempting to install from private feeds, npm will commonly error out with some form of `npm error code E401`.

This section exists to list some classic errors you might encounter when you try to `npm i`. Regardless of the error, the remedy is generally:

```shell
npx -y --registry https://registry.npmjs.org azdo-npm-auth
```

### User `.npmrc` not found

When you have no user `.npmrc` file you'll encounter an error like this:

```shell
npm error code E401
npm error Unable to authenticate, your authentication token seems to be invalid.
npm error To correct this please try logging in again with:
npm error npm login
```

You need to run `npx -y --registry https://registry.npmjs.org azdo-npm-auth` to create the user `.npmrc` file.

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

You need to run `npx -y --registry https://registry.npmjs.org azdo-npm-auth` to get a new PAT and create or update the user `.npmrc` file.

## Credits

> 💙 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app).

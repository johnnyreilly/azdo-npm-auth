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
npx --yes azdo-npm-auth --config .npmrc
```

Should you encounter the following message when you try to `npm i`:

```shell
npm error code E401
npm error Unable to authenticate, your authentication token seems to be invalid.
npm error To correct this please try logging in again with:
npm error npm login
```

That means either:

- You have no user `.npmrc` file **OR**
- The token in your user `.npmrc` file is out of date

In either case, running `azdo-npm-auth` should resolve the issue.

## Integration with `package.json`

A great way to use `azdo-npm-auth` is as part of a `preinstall` script in your `package.json`:

```json
"scripts": {
  "preinstall": "npx --yes azdo-npm-auth"
},
```

With the above `preinstall` script in place, when the user performs `npm i` or similar, before attempting to install, the relevant user `.npmrc` file will be put in place so that installation for private feed packages just works™️. This is a **great** developer experience.

## Prerequisites

If you would like `azdo-npm-auth` to acquire a token on your behalf, then it requires that your [Azure DevOps organisation is connected with your Azure account / Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/connect-organization-to-azure-ad?view=azure-devops). Then, assuming you are authenticated with Azure, it can acquire an Azure DevOps Personal Access Token on your behalf. To authenticate, run `az login`. [If you need to install the Azure CLI, follow these instructions](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli). It is not necessary to run `az login` if you are already authenticated with Azure.

You might be worried about `azdo-npm-auth` trying to create user `.npmrc` files when running CI builds. Happily this does not happen; it detects whether it is running in a CI environment and does **not** create a user `.npmrc` file in that case.

`azdo-npm-auth` requires the project `.npmrc` file exists in order that it can acquire the information to create the content of a user `.npmrc` file. There is an optional `config` parameter; if it is not supplied `azdo-npm-auth` will default to use the `.npmrc` in the current project directory. There will be instructions for creating a project `.npmrc` file in Azure DevOps, for connecting to the Azure Artifacts npm feed. A project `.npmrc` file will look something like this:

```shell
registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/

always-auth=true
```

## Why Azure DevOps npm auth?

Azure DevOps provides a mechanism for publishing npm packages for private use. This package sets up the necessary authentication to access those packages; particularly for non Windows users.

Consider the onboarding process for a Windows user for consuming an Azure Artifact npm feed:

![screenshot of the onboarding process for Windows users](screenshot-onboarding-with-windows.png)

Now consider the onboarding process for a non Windows user:

![screenshot of the onboarding process for non Windows users](screenshot-onboarding-with-other.png)

As we can see, there is a significant difference in the onboarding experience between operating systems. Windows users can use a tool named [`vsts-npm-auth`](https://www.npmjs.com/package/vsts-npm-auth) which automates onboarding. Non windows users have a longer road to follow. The instructions walk through manually creating an `.npmrc` file in a users home directory which contains information including a base 64 encoded Azure DevOps Personal Access Token with the Packaging read and write scopes. It is tedious to do.

`azdo-npm-auth` aims to automate the toil, and make the onboarding experience for non Windows users as simple as it is for Windows users.

There is an official package named [`ado-npm-auth`](https://github.com/microsoft/ado-npm-auth). However, [due to issues I experienced in using the `ado-npm-auth` package](https://github.com/microsoft/ado-npm-auth/issues/50), I found myself creating `azdo-npm-auth`. By the way, the "lite" in `azdo-npm-auth` doesn't represent anything in particular; I just couldn't think of another good name.

## Options

`-c` | `--config` (`string`): The location of the .npmrc file. Defaults to current directory

`-e` | `--email` (`string`): Allows users to supply an explicit email - if not supplied, the example ADO value will be used

`-p` | `--pat` (`string`): Allows users to supply an explicit Personal Access Token (which must include the Packaging read and write scopes) - if not supplied, will be acquired from the Azure CLI

`-h` | `--help`: Show help

`-v` | `--version`: Show version

## Credits

> 💙 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app).

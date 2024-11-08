<h1 align="center">Azure DevOps npm auth-lite</h1>

<p align="center">Set up local authentication to Azure DevOps npm feeds</p>

<p align="center">
	<a href="https://github.com/johnnyreilly/ado-npm-auth-lite/actions/workflows/release.yml" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://github.com/johnnyreilly/ado-npm-auth-lite/actions/workflows/release.yml/badge.svg" /></a>
	<a href="https://github.com/johnnyreilly/ado-npm-auth-lite/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://github.com/johnnyreilly/ado-npm-auth-lite/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
	<a href="http://npmjs.com/package/ado-npm-auth-lite"><img alt="📦 npm version" src="https://img.shields.io/npm/v/ado-npm-auth-lite?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Usage

You know that you need to create a user `.npmrc` file if you encounter the following message when you try to `npm i`:

```sh
npm error code E401
npm error Unable to authenticate, your authentication token seems to be invalid.
npm error To correct this please try logging in again with:
npm error npm login
```

To get `ado-npm-auth-lite` to create the necessary user `.npmrc` file on your behalf, run the following command:

```shell
npx --yes ado-npm-auth-lite --config .npmrc
```

This requires that you are authenticated with Azure. To authenticate, run `az login`. [Follow these instructions to install the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli). The `az login` command will prompt you to log in to Azure, so that a token may be acquired by `ado-npm-auth-lite`. It is not necessary to run `az login` if you are already authenticated with Azure.

Typically `ado-npm-auth-lite` will be used as part of a `preinstall` script in your `package.json`:

```json
"scripts": {
  "preinstall": "npx --yes ado-npm-auth-lite"
},
```

`ado-npm-auth-lite` detects whether it is running in a CI environment and does not create a users `.npmrc` file in that situation. It uses the [ci-info](https://github.com/watson/ci-info) library to achieve this.

The `config` parameter is optional, and if not supplied will default to the `.npmrc` in the project directory. Crucially, `ado-npm-auth-lite` requires the project `.npmrc` file exists in order that it can acquire the information to run.

## Why Azure DevOps npm auth-lite?

Azure DevOps provides a mechanism for publishing npm packages for private use. This package sets up the necessary authentication to access those packages; particularly for non Windows users.

Consider the onboarding process for a Windows user:

![screenshot of the onboarding process for Windows users](screenshot-onboarding-with-windows.png)

Now consider the onboarding process for a non Windows user:

![screenshot of the onboarding process for non Windows users](screenshot-onboarding-with-other.png)

This is a significant difference in the onboarding experience. `ado-npm-auth-lite` aims to make the onboarding experience for non Windows users as simple as it is for Windows users.

There is an official package named [`ado-npm-auth`](https://github.com/microsoft/ado-npm-auth). However, due to issues experienced in using that package, this was created.

## Options

`-c` | `--config` (`string`): The location of the .npmrc file. Defaults to current directory

`-e` | `--email` (`string`): Allows users to supply an explicit email - if not supplied, will be inferred from git user.config

`-h` | `--help`: Show help

`-v` | `--version`: Show version

<!-- You can remove this notice if you don't want it 🙂 no worries! -->

> 💙 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app).

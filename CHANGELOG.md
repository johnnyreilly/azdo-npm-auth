# Changelog

## 1.8.2

### Patch Changes

- 5a87531: It's not obvious we are publishing with [trusted publishing](https://docs.npmjs.com/trusted-publishers) - this release removes the npm token; this way if we succeed in publishing it must mean we are using trusted publishing.

  I'm not certain if changesets is calling `npm publish` under the bonnet, this should hopefully determine if it is.

## 1.8.1

### Patch Changes

- 7ea1853: We're moving away from release-it and towards using Changsets instead for versioning. See context here: https://github.com/johnnyreilly/azdo-npm-auth/issues/46

  All versions prior to this one were published using release-it. From this version onwards, versions will be published using Changesets.

  Versions 1.6.0 - 1.8.0 had issues in their publishing process and are being skipped from the version history as they did not contain app code changes.

# [1.5.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/1.4.0...1.5.0) (2025-10-14)

### Features

- cater for pnpm with scope ([#36](https://github.com/johnnyreilly/azdo-npm-auth/issues/36)) ([68d8560](https://github.com/johnnyreilly/azdo-npm-auth/commit/68d8560cf0d133d930bf18e9617f5168a4bddc6d)), closes [#35](https://github.com/johnnyreilly/azdo-npm-auth/issues/35)

# [1.4.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/1.3.0...1.4.0) (2025-05-14)

### Features

- cater for multiple registry entries in a .npmrc file ([#33](https://github.com/johnnyreilly/azdo-npm-auth/issues/33)) ([c14310c](https://github.com/johnnyreilly/azdo-npm-auth/commit/c14310c66630ae7aef2f9860540cdf6e41a2cd5b)), closes [#32](https://github.com/johnnyreilly/azdo-npm-auth/issues/32)

# [1.3.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/1.2.0...1.3.0) (2024-12-19)

### Features

- provide scope as parameter ([#28](https://github.com/johnnyreilly/azdo-npm-auth/issues/28)) ([822b1c2](https://github.com/johnnyreilly/azdo-npm-auth/commit/822b1c254e120c59fbdfae9f1dba72f816cdd418)), closes [#27](https://github.com/johnnyreilly/azdo-npm-auth/issues/27)

# [1.2.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/1.1.2...1.2.0) (2024-12-10)

### Features

- support org scoped npmrc ([#26](https://github.com/johnnyreilly/azdo-npm-auth/issues/26)) ([54ef22d](https://github.com/johnnyreilly/azdo-npm-auth/commit/54ef22d18dde3af0625179c9f3e4e28dfbd1a940)), closes [#25](https://github.com/johnnyreilly/azdo-npm-auth/issues/25) [#25](https://github.com/johnnyreilly/azdo-npm-auth/issues/25)

## [1.1.2](https://github.com/johnnyreilly/azdo-npm-auth/compare/1.1.1...1.1.2) (2024-12-08)

### Bug Fixes

- refine docs ([#24](https://github.com/johnnyreilly/azdo-npm-auth/issues/24)) ([5b93351](https://github.com/johnnyreilly/azdo-npm-auth/commit/5b9335162fe8c225315c69c37f200e10a1f05ba0)), closes [#000](https://github.com/johnnyreilly/azdo-npm-auth/issues/000)

## [1.1.1](https://github.com/johnnyreilly/azdo-npm-auth/compare/1.1.0...1.1.1) (2024-12-08)

### Bug Fixes

- clearer docs ([#23](https://github.com/johnnyreilly/azdo-npm-auth/issues/23)) ([85939f7](https://github.com/johnnyreilly/azdo-npm-auth/commit/85939f7f5d76b0cd37ab347078489836bf42fc7d)), closes [#000](https://github.com/johnnyreilly/azdo-npm-auth/issues/000)

# [1.1.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.12.0...1.1.0) (2024-12-07)

### Features

- 1.0.0 or maybe 1.1.0 once the release automation does its thing ([8161607](https://github.com/johnnyreilly/azdo-npm-auth/commit/8161607481b0f00c712d4270ba69e2316785f461))

# [0.12.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.11.0...0.12.0) (2024-12-07)

### Features

- Cross platform usage docs and attempt to fix post release permissions ([#19](https://github.com/johnnyreilly/azdo-npm-auth/issues/19)) ([282a53c](https://github.com/johnnyreilly/azdo-npm-auth/commit/282a53c1c1ea3cac8798c38efdd6bae981a22895)), closes [#000](https://github.com/johnnyreilly/azdo-npm-auth/issues/000) [/github.com/apexskier/github-release-commenter/issues/545#issuecomment-2513388057](https://github.com//github.com/apexskier/github-release-commenter/issues/545/issues/issuecomment-2513388057)

# [0.11.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.10.0...0.11.0) (2024-12-01)

### Features

- noparse mode ([#17](https://github.com/johnnyreilly/azdo-npm-auth/issues/17)) ([aaa5c2f](https://github.com/johnnyreilly/azdo-npm-auth/commit/aaa5c2f70bc8869a4a604c314e95f1114d842e3f)), closes [#18](https://github.com/johnnyreilly/azdo-npm-auth/issues/18)

# [0.10.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.9.0...0.10.0) (2024-11-15)

### Features

- daysToExpiry option ([#15](https://github.com/johnnyreilly/azdo-npm-auth/issues/15)) ([8c23d20](https://github.com/johnnyreilly/azdo-npm-auth/commit/8c23d2075d8d7dcf81bcf9ad67febc18182153d9)), closes [#16](https://github.com/johnnyreilly/azdo-npm-auth/issues/16)

# [0.9.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.8.0...0.9.0) (2024-11-11)

### Features

- clarify E401 handling ([#14](https://github.com/johnnyreilly/azdo-npm-auth/issues/14)) ([39dbb1f](https://github.com/johnnyreilly/azdo-npm-auth/commit/39dbb1f2f86fe78960f11036a0a9fb7b70149a07)), closes [#000](https://github.com/johnnyreilly/azdo-npm-auth/issues/000)

# [0.8.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.7.0...0.8.0) (2024-11-11)

### Features

- rename github ado-npm-auth-lite to azdo-npm-auth ([#13](https://github.com/johnnyreilly/azdo-npm-auth/issues/13)) ([a587073](https://github.com/johnnyreilly/azdo-npm-auth/commit/a5870738bf06e49c457ad95f17ae8353cadb8440)), closes [#000](https://github.com/johnnyreilly/azdo-npm-auth/issues/000)

# [0.7.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.6.0...0.7.0) (2024-11-11)

### Features

- rename azdo-npm-auth to azdo-npm-auth ([#12](https://github.com/johnnyreilly/azdo-npm-auth/issues/12)) ([650adb1](https://github.com/johnnyreilly/azdo-npm-auth/commit/650adb1a5f86438ebc3a50577c59e5ae80591cdc)), closes [#000](https://github.com/johnnyreilly/azdo-npm-auth/issues/000)

# [0.6.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.5.0...0.6.0) (2024-11-10)

### Features

- fallback to using the Azure CLI ([#11](https://github.com/johnnyreilly/azdo-npm-auth/issues/11)) ([1e10db2](https://github.com/johnnyreilly/azdo-npm-auth/commit/1e10db2c99fab6275dc8ab16c233b7b2d59a955a)), closes [#10](https://github.com/johnnyreilly/azdo-npm-auth/issues/10)

# [0.5.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.4.0...0.5.0) (2024-11-09)

### Features

- allow manual supplying pat ([#9](https://github.com/johnnyreilly/azdo-npm-auth/issues/9)) ([1d7ab17](https://github.com/johnnyreilly/azdo-npm-auth/commit/1d7ab170ae23f1e3271fa023c5ab16d617a297d3)), closes [#8](https://github.com/johnnyreilly/azdo-npm-auth/issues/8)

# [0.4.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.3.0...0.4.0) (2024-11-09)

### Features

- logos ([#6](https://github.com/johnnyreilly/azdo-npm-auth/issues/6)) ([bab6094](https://github.com/johnnyreilly/azdo-npm-auth/commit/bab6094116350ac3d9969572e271b9786a997027)), closes [#7](https://github.com/johnnyreilly/azdo-npm-auth/issues/7)

# [0.3.0](https://github.com/johnnyreilly/azdo-npm-auth/compare/0.2.0...0.3.0) (2024-11-08)

### Features

- don't run on ci servers ([#3](https://github.com/johnnyreilly/azdo-npm-auth/issues/3)) ([c2f745f](https://github.com/johnnyreilly/azdo-npm-auth/commit/c2f745f93d4bb21173669d8a5a76c241aaca1254)), closes [#2](https://github.com/johnnyreilly/azdo-npm-auth/issues/2)

# 0.2.0 (2024-11-07)

### Features

- Initial implementation ([51a8a29](https://github.com/johnnyreilly/azdo-npm-auth/commit/51a8a2958be10a7cbf3d04a325c02ec2bf0a7b3a))
- initialized repo ✨ ([5a155fc](https://github.com/johnnyreilly/azdo-npm-auth/commit/5a155fcc1ef7e4efa712b59fb56cc76ec2d29961))

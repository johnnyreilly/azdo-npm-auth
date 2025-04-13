import { describe, expect, it, vi } from "vitest";

import { parseNpmrcContent, projectNpmrcParse } from "./projectNpmrcParse.js";

const mockReadFile = vi.fn();

vi.mock("./shared/readFileSafe.js", () => ({
	get readFileSafe() {
		return mockReadFile;
	},
}));

describe("projectNpmrcParse", () => {
	it("outputs the expected structure on successful parse", async () => {
		mockReadFile.mockResolvedValue(`registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/ 
                        
always-auth=true`);
		const result = await projectNpmrcParse({
			npmrcPath: "/home/john/code/github/azdo-npm-auth/.npmrc",
		});
		expect(result).toEqual([
			{
				organization: "johnnyreilly",
				urlWithoutRegistryAtEnd:
					"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/",
				urlWithoutRegistryAtStart:
					"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
			},
		]);
	});

	it("outputs the expected structure on successful parse with org scope", async () => {
		mockReadFile.mockResolvedValue(`@myorg:registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/ 
                        
always-auth=true`);
		const result = await projectNpmrcParse({
			npmrcPath: "/home/john/code/github/azdo-npm-auth/.npmrc",
		});
		expect(result).toEqual([
			{
				organization: "johnnyreilly",
				scope: "@myorg",
				urlWithoutRegistryAtEnd:
					"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/",
				urlWithoutRegistryAtStart:
					"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
			},
		]);
	});

	// introduce later
	it.skip("outputs the expected structure on successful parse of multiple organisations and combined organisation and project feeds", async () => {
		mockReadFile.mockResolvedValue(`engine-strict=true
node-options=--max-old-space-size=8192

registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/organization-feed-name/npm/registry/
@myorg:registry=https://pkgs.dev.azure.com/johnnyreilly/project-name1/_packaging/project-feed-name/npm/registry/
@myorg-other:registry=https://pkgs.dev.azure.com/johnnyreilly/another-project-name/_packaging/different-project-feed-name/npm/registry/
                        
always-auth=true`);
		const result = await projectNpmrcParse({
			npmrcPath: "/home/john/code/github/azdo-npm-auth/.npmrc",
		});
		expect(result).toEqual([
			{
				organization: "johnnyreilly",
				urlWithoutRegistryAtEnd:
					"//pkgs.dev.azure.com/johnnyreilly/_packaging/organization-feed-name/npm/",
				urlWithoutRegistryAtStart:
					"//pkgs.dev.azure.com/johnnyreilly/_packaging/organization-feed-name/npm/registry/",
			},
		]);
	});

	// I haven't worked out whether I want to support this yet
	it.skip("outputs the expected structure when expected last `/` is not there", async () => {
		mockReadFile.mockResolvedValue(`registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry 
                        
always-auth=true`);
		const result = await projectNpmrcParse({
			npmrcPath: "/home/john/code/github/azdo-npm-auth/.npmrc",
		});
		expect(result).toEqual({
			organization: "johnnyreilly",
			urlWithoutRegistryAtEnd:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/",
			urlWithoutRegistryAtStart:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
		});
	});

	it("errors on invalid content", async () => {
		mockReadFile.mockResolvedValue(`stuff`);
		await expect(() =>
			projectNpmrcParse({
				npmrcPath: "/home/john/code/github/azdo-npm-auth/.npmrc",
			}),
		).rejects.toThrowError("Unable to extract information from project .npmrc");
	});
});

describe("parseNpmrcContent", () => {
	it("outputs the expected registry on successful parse", () => {
		const result =
			parseNpmrcContent(`registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/ 
                        
always-auth=true`);
		expect(result).toEqual([
			{
				registry:
					"https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
			},
		]);
	});

	it("outputs the expected registry on successful parse with org scope", () => {
		const result =
			parseNpmrcContent(`@myorg:registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/ 
                        
always-auth=true`);
		expect(result).toEqual([
			{
				registry:
					"https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
				scope: "@myorg",
			},
		]);
	});

	it("errors on invalid content", () => {
		expect(() => parseNpmrcContent(`stuff`)).toThrowError(
			"Unable to extract information from project .npmrc",
		);
	});
});

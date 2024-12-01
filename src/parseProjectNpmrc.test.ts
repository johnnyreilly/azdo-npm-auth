import { describe, expect, it, vi } from "vitest";

import { parseProjectNpmrc } from "./parseProjectNpmrc.js";

const mockReadFile = vi.fn();

vi.mock("./shared/readFileSafe.js", () => ({
	get readFileSafe() {
		return mockReadFile;
	},
}));
/*

always-auth=true
 */
describe("parseProjectNpmrc", () => {
	it("outputs the expected structure on successful parse", async () => {
		mockReadFile.mockResolvedValue(`registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/ 
                        
always-auth=true`);
		const result = await parseProjectNpmrc({
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

	it("outputs the expected structure when expected last `/` is not there", async () => {
		mockReadFile.mockResolvedValue(`registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry 
                        
always-auth=true`);
		const result = await parseProjectNpmrc({
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
			parseProjectNpmrc({
				npmrcPath: "/home/john/code/github/azdo-npm-auth/.npmrc",
			}),
		).rejects.toThrowError("Unable to extract information from project .npmrc");
	});
});

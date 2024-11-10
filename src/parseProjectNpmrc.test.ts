import { describe, expect, it, vi } from "vitest";

import { parseProjectNpmrc } from "./parseProjectNpmrc.js";

const mockReadFile = vi.fn();

vi.mock("./shared/readFileSafe.js", () => ({
	get readFileSafe() {
		return mockReadFile;
	},
}));

describe("parseProjectNpmrc", () => {
	it("outputs the expected structure on successful parse", async () => {
		mockReadFile.mockResolvedValue(`registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/ 
                        
always-auth=true`);
		const result = await parseProjectNpmrc({
			npmrcPath: "/home/john/code/github/ado-npm-auth-lite/.npmrc",
		});
		expect(result).toEqual({
			organisation: "johnnyreilly",
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
				npmrcPath: "/home/john/code/github/ado-npm-auth-lite/.npmrc",
			}),
		).rejects.toThrowError("Unable to extract information from project .npmrc");
	});
});

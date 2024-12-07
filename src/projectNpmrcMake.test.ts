import { describe, expect, it } from "vitest";

import { makeParsedProjectNpmrc } from "./projectNpmrcMake.js";

describe("makeParsedProjectNpmrc", () => {
	it("given no project it constructs an organisation feed ParsedProjectNpmrc", () => {
		const result = makeParsedProjectNpmrc({
			organization: "johnnyreilly",
			feed: "npmrc-script-organization",
		});
		expect(result).toEqual({
			organization: "johnnyreilly",
			urlWithoutRegistryAtEnd:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/",
			urlWithoutRegistryAtStart:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
		});
	});

	it("given a project it constructs a project feed ParsedProjectNpmrc", () => {
		const result = makeParsedProjectNpmrc({
			organization: "johnnyreilly",
			project: "azure-static-web-apps",
			feed: "npmrc-script-demo",
		});
		expect(result).toEqual({
			organization: "johnnyreilly",
			urlWithoutRegistryAtEnd:
				"//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/",
			urlWithoutRegistryAtStart:
				"//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/registry/",
		});
	});
});

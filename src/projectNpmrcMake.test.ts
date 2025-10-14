import { describe, expect, it } from "vitest";

import { projectNpmrcMake } from "./projectNpmrcMake.js";

describe("projectNpmrcMake", () => {
	it("given no project it constructs an organization feed ParsedProjectNpmrc", () => {
		const result = projectNpmrcMake({
			organization: "johnnyreilly",
			feed: "npmrc-script-organization",
		});
		expect(result).toMatchInlineSnapshot(`
			{
			  "fullRegistryMatch": undefined,
			  "organization": "johnnyreilly",
			  "scope": undefined,
			  "urlWithoutRegistryAtEnd": "//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/",
			  "urlWithoutRegistryAtStart": "//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
			}
		`);
	});

	it("given a project it constructs a project feed ParsedProjectNpmrc", () => {
		const result = projectNpmrcMake({
			organization: "johnnyreilly",
			project: "azure-static-web-apps",
			feed: "npmrc-script-demo",
		});
		expect(result).toMatchInlineSnapshot(`
			{
			  "fullRegistryMatch": undefined,
			  "organization": "johnnyreilly",
			  "scope": undefined,
			  "urlWithoutRegistryAtEnd": "//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/",
			  "urlWithoutRegistryAtStart": "//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/registry/",
			}
		`);
	});
});

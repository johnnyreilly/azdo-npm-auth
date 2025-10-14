import { describe, expect, it } from "vitest";

import type { ParsedProjectNpmrc } from "./types.js";

import { createUserNpmrc } from "./createUserNpmrc.js";

describe("createUserNpmrc", () => {
	it("creates a properly formatted user .npmrc with organization feed", () => {
		// Arrange
		const parsedProjectNpmrc: ParsedProjectNpmrc = {
			scope: undefined,
			fullRegistryMatch: undefined,
			organization: "johnnyreilly",
			urlWithoutRegistryAtEnd:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/",
			urlWithoutRegistryAtStart:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
		};
		const pat = "test-pat-token";

		// Act
		const result = createUserNpmrc({
			parsedProjectNpmrc,
			pat,
		});

		// Assert
		expect(result).toMatchInlineSnapshot(`
			"; begin auth token
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:username=johnnyreilly
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:_password=dGVzdC1wYXQtdG9rZW4=
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:email=npm requires email to be set but doesn't use the value
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:username=johnnyreilly
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:_password=dGVzdC1wYXQtdG9rZW4=
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:email=npm requires email to be set but doesn't use the value
			; end auth token
			"
		`);
	});

	it("creates a user .npmrc with project-specific feed", () => {
		// Arrange
		const parsedProjectNpmrc: ParsedProjectNpmrc = {
			scope: undefined,
			fullRegistryMatch: undefined,
			organization: "johnnyreilly",
			urlWithoutRegistryAtEnd:
				"//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/",
			urlWithoutRegistryAtStart:
				"//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/registry/",
		};
		const pat = "test-pat-token";

		// Act
		const result = createUserNpmrc({
			parsedProjectNpmrc,
			pat,
		});

		// Assert
		expect(result).toMatchInlineSnapshot(`
			"; begin auth token
			//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/registry/:username=johnnyreilly
			//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/registry/:_password=dGVzdC1wYXQtdG9rZW4=
			//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/registry/:email=npm requires email to be set but doesn't use the value
			//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/:username=johnnyreilly
			//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/:_password=dGVzdC1wYXQtdG9rZW4=
			//pkgs.dev.azure.com/johnnyreilly/azure-static-web-apps/_packaging/npmrc-script-demo/npm/:email=npm requires email to be set but doesn't use the value
			; end auth token
			"
		`);
	});

	it("uses custom email when provided", () => {
		// Arrange
		const parsedProjectNpmrc: ParsedProjectNpmrc = {
			scope: undefined,
			fullRegistryMatch: undefined,
			organization: "johnnyreilly",
			urlWithoutRegistryAtEnd:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/",
			urlWithoutRegistryAtStart:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
		};
		const pat = "test-pat-token";
		const customEmail = "test@example.com";

		// Act
		const result = createUserNpmrc({
			parsedProjectNpmrc,
			pat,
			email: customEmail,
		});

		// Assert
		expect(result).toMatchInlineSnapshot(`
			"; begin auth token
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:username=johnnyreilly
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:_password=dGVzdC1wYXQtdG9rZW4=
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:email=test@example.com
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:username=johnnyreilly
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:_password=dGVzdC1wYXQtdG9rZW4=
			//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:email=test@example.com
			; end auth token
			"
		`);
	});

	it("handles parsed project npmrc with a scope property", () => {
		// Arrange
		const parsedProjectNpmrc: ParsedProjectNpmrc = {
			organization: "johnnyreilly",
			scope: "@myorg",
			fullRegistryMatch:
				"@myorg:registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
			urlWithoutRegistryAtEnd:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/",
			urlWithoutRegistryAtStart:
				"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",
		};
		const pat = "test-pat-token";

		// Act
		const result = createUserNpmrc({
			parsedProjectNpmrc,
			pat,
		});

		// Assert
		// Verify the scope doesn't affect the .npmrc format
		expect(result).toContain("; begin auth token");
		expect(result).toContain(
			"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:username=johnnyreilly",
		);
		expect(result).toContain(
			"//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:username=johnnyreilly",
		);

		// Even though parsedProjectNpmrc has a scope property, it should not appear in the .npmrc output
		// as it's not used by the createUserNpmrc function
		const base64EncodedPAT = Buffer.from(pat).toString("base64");
		const expectedNpmrcWithScope = `; begin auth token
@myorg:registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:_password=${base64EncodedPAT}
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:email=npm requires email to be set but doesn't use the value
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:_password=${base64EncodedPAT}
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:email=npm requires email to be set but doesn't use the value
; end auth token
`;
		expect(result).toEqual(expectedNpmrcWithScope);
	});
});

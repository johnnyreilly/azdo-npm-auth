import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { logHelpText } from "./help.js";

function makeProxy<T extends object>(receiver: T): T {
	return new Proxy(receiver, {
		get: () => makeProxy((input: string) => input),
	});
}

vi.mock("chalk", () => ({
	default: makeProxy({}),
}));

let mockConsoleLog: MockInstance;

describe("logHelpText", () => {
	beforeEach(() => {
		mockConsoleLog = vi
			.spyOn(console, "log")
			.mockImplementation(() => undefined);
	});

	it("logs help text when called", () => {
		logHelpText([]);

		expect(mockConsoleLog.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Configure local development environments for Azure apps with one command",
			  ],
			  [
			    " ",
			  ],
			  [
			    "Core options:",
			  ],
			  [
			    "
			  -h | --help: Show help",
			  ],
			  [
			    "
			  -v | --version: Show version",
			  ],
			  [],
			  [
			    " ",
			  ],
			  [
			    "Optional options:",
			  ],
			  [
			    "
			  -c | --config (string): The location of the .npmrc file. Defaults to current directory",
			  ],
			  [
			    "
			  -e | --email (string): Allows users to supply an explicit email - if not supplied, the example ADO value will be used",
			  ],
			  [
			    "
			  -d | --daysToExpiry (string): Allows users to supply an explicit number of days to expiry - if not supplied, then ADO will determine the expiry date",
			  ],
			  [
			    "
			  -p | --pat (string): Allows users to supply an explicit Personal Access Token (which must include the Packaging read and write scopes) - if not supplied, will be acquired from the Azure CLI",
			  ],
			  [],
			]
		`);
	});
});

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
        -l | --appLocation (string): The location of the app, and the directory where the settings file will be generated eg ../OurFunctionApp/",
        ],
        [
          "
        -h | --help: Show help",
        ],
        [
          "
        -k | --keyVaultName (string): [explicit]: Allows users to supply an explicit key vault name - if not supplied when in resource group mode, the key vault name will be inferred from the branch resources - required if mode is explicit",
        ],
        [
          "
        -m | --mode (string): explicit | resourcegroup - whether to pass explicit resource names, or look for resources in the resource group matching the branch name",
        ],
        [
          "
        -n | --name (string): The name of the explicit Azure resource eg ourapp (the type of resource is determined by the type option) - required if mode is explicit",
        ],
        [
          "
        -r | --resourceGroupName (string): [resourcegroup]: The name of the resource group where the resources are located",
        ],
        [
          "
        -s | --subscriptionName (string): The name of the subscription where the resources are located",
        ],
        [
          "
        -t | --type (string): The type of resource to generate settings for - either functionapp or containerapp",
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
        -b | --branchName (string): [resourcegroup]: Allows users to supply an explicit branch name - if not supplied, the current branch will be used",
        ],
        [],
      ]
    `);
	});
});

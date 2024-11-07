import { describe, expect, it } from "vitest";

import type { TokenResult } from "./types.js";

import { tokenResultSchema } from "./schemas.js";

describe("schemas", () => {
	it("successfully parses a valid token result", () => {
		const tokenResult: TokenResult = {
			patToken: {
				displayName: "with cli",
				validTo: "2024-11-05T23:46:23.32Z",
				scope: "vso.packaging",
				targetAccounts: ["a5a177e6-6a30-4db2-bc31-9e9153e7b947"],
				validFrom: "2024-11-03T07:19:13.7933333Z",
				authorizationId: "1230f77a-ca45-4196-97ee-3b017d31e798",
				token: "[TOKEN HERE]",
			},
			patTokenError: "none",
		};

		const tokenParseResult = tokenResultSchema.safeParse(tokenResult);

		expect(tokenParseResult.success).toBe(true);
		expect(tokenParseResult.data).toMatchObject(tokenResult);
	});

	it("successfully errors on an invalid token result", () => {
		const tokenResult = {
			patToken: {
				displayName: "with cli",
				token: "[TOKEN HERE]",
			},
			patTokenError: "none",
		};

		const tokenParseResult = tokenResultSchema.safeParse(tokenResult);

		expect(tokenParseResult.success).toBe(false);
	});
});

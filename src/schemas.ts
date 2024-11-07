import { z } from "zod";
import type { TokenResult } from "./types.js";

const patTokenSchema = z.object({
	displayName: z.string(),
	validTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: "Invalid date format for validTo",
	}),
	scope: z.string(),
	targetAccounts: z.array(z.string().uuid()),
	validFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: "Invalid date format for validFrom",
	}),
	authorizationId: z.string().uuid(),
	token: z.string(),
});

export const tokenResultSchema: z.ZodType<TokenResult> = z.object({
	patToken: patTokenSchema,
	patTokenError: z.string(),
});

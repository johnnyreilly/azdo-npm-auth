import { z } from "zod";

export const optionsSchema = z.object({
	pat: z.string().optional(),
	config: z.string().optional(),
	email: z.string().optional(),
	daysToExpiry: z.number().optional(),
});

import { z } from "zod";

export const optionsSchema = z.object({
	config: z.string().optional(),
	email: z.string().optional(),
});

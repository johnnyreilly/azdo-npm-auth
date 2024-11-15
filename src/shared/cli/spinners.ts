import * as prompts from "@clack/prompts";
import chalk from "chalk";

import {
	type Logger,
	makeLogger,
	makeSpinnerLogger,
	type SpinnerLogger,
} from "./logger.js";
import { lowerFirst } from "./lowerFirst.js";

const spinner = prompts.spinner();

export type SpinnerTask<Return> = (logger: SpinnerLogger) => Promise<Return>;

export type LabeledSpinnerTask<Return> = [string, SpinnerTask<Return>];

export async function withSpinner<Return>(
	label: string,
	logger: Logger,
	task: SpinnerTask<Return>,
) {
	logger.info(chalk.green(`🎬 Starting ${lowerFirst(label)}.`));

	const spinnerLogger = makeSpinnerLogger(makeLogger());

	spinner.start(`${label}...`);

	try {
		const result = await task(spinnerLogger);

		spinner.stop(chalk.green(`✅ Passed ${lowerFirst(label)}.`));

		spinnerLogger.flush();

		return result;
	} catch (error) {
		spinner.stop(chalk.red(`❌ Error ${lowerFirst(label)}.`));

		spinnerLogger.flush();

		throw new Error(`Failed ${lowerFirst(label)}`, { cause: error });
	}
}

import * as prompts from "@clack/prompts";
import chalk from "chalk";
import ci from "ci-info";
import { parseArgs } from "node:util";
import { fromZodError } from "zod-validation-error";

import {
	createPat,
	createUserNpmrc,
	parseProjectNpmrc,
	writeNpmrc,
} from "../index.js";
import { logLine } from "../shared/cli/lines.js";
import { withSpinner } from "../shared/cli/spinners.js";
import { StatusCodes } from "../shared/codes.js";
import { options } from "../shared/options/args.js";
import { optionsSchema } from "../shared/options/optionsSchema.js";
import { logHelpText } from "./help.js";
import { getVersionFromPackageJson } from "./packageJson.js";

const operationMessage = (verb: string) =>
	`Operation ${verb}. Exiting - maybe another time? 👋`;

export async function bin(args: string[]) {
	console.clear();

	const version = await getVersionFromPackageJson();

	const introPrompts = `${chalk.blueBright(`📦🔑 Welcome to`)} ${chalk.bgBlueBright.black(`ado-npm-auth-lite`)} ${chalk.blueBright(`${version}! 📦🔑`)}`;
	const outroPrompts = `${chalk.blueBright(`📦🔑 Thanks for using`)} ${chalk.bgBlueBright.black(`ado-npm-auth-lite`)} ${chalk.blueBright(`${version}! 📦🔑`)}`;

	const { values } = parseArgs({
		args,
		options,
		strict: false,
	});

	if (values.help) {
		logHelpText([introPrompts]);
		return StatusCodes.Success;
	}

	if (values.version) {
		console.log(version);
		return StatusCodes.Success;
	}

	prompts.intro(introPrompts);
	logLine();

	const mappedOptions = {
		pat: values.pat,
		config: values.config,
		email: values.email,
	};

	const optionsParseResult = optionsSchema.safeParse(mappedOptions);

	if (!optionsParseResult.success) {
		logLine(
			chalk.red(
				fromZodError(optionsParseResult.error, {
					issueSeparator: "\n    - ",
				}),
			),
		);
		logLine();

		prompts.cancel(operationMessage("failed"));
		prompts.outro(outroPrompts);

		return StatusCodes.Failure;
	}

	const { config, email, pat } = optionsParseResult.data;

	// TODO: this will prevent this file from running tests on the server after this - create an override parameter
	if (ci.isCI) {
		logLine(
			`Detected that you are running on a CI server (${ci.name ?? ""}) and so will not generate a user .npmrc file`,
		);
		prompts.outro(outroPrompts);

		return StatusCodes.Success;
	}

	prompts.log.info(`options:
- pat: ${pat ? "supplied" : "[NONE SUPPLIED - WILL ACQUIRE FROM AZURE API]"}
- config: ${config ?? "[NONE SUPPLIED - WILL USE DEFAULT]"}
- email: ${email ?? "[NONE SUPPLIED - WILL USE DEFAULT]"}`);

	const logger = {
		info: prompts.log.info,
		error: prompts.log.error,
	};

	try {
		const parsedProjectNpmrc = await withSpinner(`Parsing project .npmrc`, () =>
			parseProjectNpmrc({
				config,
				logger,
			}),
		);

		const personalAccessToken = pat
			? {
					patToken: {
						token: pat,
					},
				}
			: await withSpinner(`Creating Personal Access Token`, () =>
					createPat({ logger, organisation: parsedProjectNpmrc.organisation }),
				);

		const npmrc = await withSpinner(`Constructing user .npmrc`, () =>
			Promise.resolve(
				createUserNpmrc({
					parsedProjectNpmrc,
					email,
					logger,
					pat: personalAccessToken.patToken.token,
				}),
			),
		);

		await withSpinner(`Writing user .npmrc`, () =>
			writeNpmrc({
				npmrc,
				logger,
			}),
		);

		prompts.outro(outroPrompts);

		return StatusCodes.Success;
	} catch (error) {
		prompts.log.error(
			`Error: ${error instanceof Error && error.cause instanceof Error ? error.cause.message : ""}`,
		);
		prompts.cancel(operationMessage("failed"));
		prompts.outro(outroPrompts);

		return StatusCodes.Failure;
	}
}

import * as prompts from "@clack/prompts";
import chalk from "chalk";
import ci from "ci-info";
import path from "node:path";
import { parseArgs } from "node:util";
import { fromZodError } from "zod-validation-error";

import {
	createPat,
	createUserNpmrc,
	projectNpmrcMake,
	projectNpmrcParse,
	writeNpmrc,
} from "../index.js";
import { projectNpmrcRegistry } from "../projectNpmrcRegistry.js";
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

	const logger = {
		info: (message = "") => {
			prompts.log.info(message);
		},
		error: (message = "") => {
			prompts.log.error(message);
		},
	};

	const version = await getVersionFromPackageJson();

	const introPrompts = `${chalk.blueBright(`📦🔑 Welcome to`)} ${chalk.bgBlueBright.black(`azdo-npm-auth`)} ${chalk.blueBright(`${version}! 📦🔑`)}`;
	const outroPrompts = `${chalk.blueBright(`📦🔑 Thanks for using`)} ${chalk.bgBlueBright.black(`azdo-npm-auth`)} ${chalk.blueBright(`${version}! 📦🔑`)}`;

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

	const mappedOptions = {
		pat: values.pat,
		config: values.config,
		organization: values.organization,
		project: values.project,
		feed: values.feed,
		registry: values.registry,
		email: values.email,
		daysToExpiry: values.daysToExpiry ? Number(values.daysToExpiry) : undefined,
	};

	const optionsParseResult = optionsSchema.safeParse(mappedOptions);

	if (!optionsParseResult.success) {
		logger.error(
			chalk.red(
				fromZodError(optionsParseResult.error, {
					issueSeparator: "\n    - ",
				}),
			),
		);

		prompts.cancel(operationMessage("failed"));
		prompts.outro(outroPrompts);

		return StatusCodes.Failure;
	}

	const {
		config,
		organization,
		project,
		feed,
		registry,
		email,
		pat,
		daysToExpiry,
	} = optionsParseResult.data;

	// TODO: this will prevent this file from running tests on the server after this - create an override parameter?
	if (ci.isCI) {
		logger.error(
			`Detected that you are running on a CI server (${ci.name ?? ""}) and so will not generate a user .npmrc file`,
		);
		prompts.outro(outroPrompts);

		return StatusCodes.Success;
	}

	const projectNpmrcMode = registry
		? "registry"
		: !organization && !feed
			? "parse"
			: "make";

	const optionsSuffix =
		`- mode: ${projectNpmrcMode}\n` +
		(projectNpmrcMode === "registry"
			? `- registry: ${registry ?? ""}`
			: projectNpmrcMode === "parse"
				? `- config: ${config ?? "[NONE SUPPLIED - WILL USE DEFAULT LOCATION]"}`
				: `- organization: ${organization ?? ""}\n- project: ${project ?? ""}\n- feed: ${feed ?? ""}`);

	prompts.log.info(
		`options:
- pat: ${pat ? "supplied" : "[NONE SUPPLIED - WILL ACQUIRE FROM AZURE]"}
- email: ${email ?? "[NONE SUPPLIED - WILL USE DEFAULT VALUE]"}
- daysToExpiry: ${daysToExpiry ? daysToExpiry.toLocaleString() : "[NONE SUPPLIED - API WILL DETERMINE EXPIRY]"}
${optionsSuffix}`,
	);

	try {
		const parsedProjectNpmrcs = await withSpinner(
			projectNpmrcMode === "registry"
				? `Using supplied registry`
				: projectNpmrcMode === "parse"
					? `Parsing project .npmrc`
					: "Making parsed project .npmrc",
			logger,
			async (logger) => {
				return projectNpmrcMode === "registry"
					? [projectNpmrcRegistry({ registry: registry ?? "", logger })]
					: projectNpmrcMode === "parse"
						? await projectNpmrcParse({
								npmrcPath: config
									? path.resolve(config)
									: path.resolve(process.cwd(), ".npmrc"),
								logger,
							})
						: [
								projectNpmrcMake({
									organization: organization ?? "",
									project,
									feed: feed ?? "",
								}),
							];
			},
		);

		const personalAccessToken = pat
			? {
					patToken: {
						token: pat,
					},
				}
			: await withSpinner(`Creating Personal Access Token`, logger, (logger) =>
					createPat({
						logger,
						organisation: parsedProjectNpmrcs[0].organization,
						daysToExpiry,
					}),
				);

		const npmrc = await withSpinner(
			`Constructing user .npmrc`,
			logger,
			(logger) =>
				Promise.resolve(
					createUserNpmrc({
						parsedProjectNpmrc: parsedProjectNpmrcs[0],
						email,
						logger,
						pat: personalAccessToken.patToken.token,
					}),
				),
		);

		await withSpinner(`Writing user .npmrc`, logger, (logger) =>
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

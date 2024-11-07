import chalk from "chalk";

import { allArgOptions } from "../shared/options/args.js";

interface HelpTextSection {
	sectionHeading: string;
	subsections: {
		flags: SubsectionFlag[];
		subheading?: string;
		warning?: string;
	}[];
}

interface SubsectionFlag {
	description: string;
	flag: string;
	short: string;
	type: string;
}

function logHelpTextSection(section: HelpTextSection): void {
	console.log(" ");

	console.log(chalk.black.bgGreenBright(section.sectionHeading));

	for (const subsection of section.subsections) {
		if (subsection.warning) {
			console.log(chalk.yellow(subsection.warning));
		}

		if (subsection.subheading) {
			console.log(chalk.green(subsection.subheading));
		}

		for (const { description, flag, short, type } of subsection.flags) {
			console.log(
				chalk.cyan(
					`
  -${short} | --${flag}${
		type !== "boolean" ? ` (${chalk.cyanBright(type)})` : ""
	}: ${description}`,
				),
			);
		}
	}
}

function createHelpTextSections(): HelpTextSection[] {
	const core: HelpTextSection = {
		sectionHeading: "Core options:",
		subsections: [
			{
				flags: [],
			},
		],
	};

	const optional: HelpTextSection = {
		sectionHeading: "Optional options:",
		subsections: [
			{
				flags: [],
			},
		],
	};

	const subsections = {
		core: core.subsections[0],
		optional: optional.subsections[0],
	};

	for (const [option, data] of Object.entries(allArgOptions)) {
		subsections[data.docsSection].flags.push({
			description: data.description,
			flag: option,
			short: data.short,
			type: data.type,
		});
	}

	return [core, optional];
}

export function logHelpText(introLogs: string[]): void {
	const helpTextSections = createHelpTextSections();

	for (const log of introLogs) {
		console.log(log);
		console.log(" ");
	}

	console.log(
		chalk.cyan(
			`Configure local development environments for Azure apps with one command`,
		),
	);

	for (const section of helpTextSections) {
		logHelpTextSection(section);

		console.log();
	}
}

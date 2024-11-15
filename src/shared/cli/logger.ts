import chalk from "chalk";
import { EOL } from "node:os";

export const fallbackLogger: Logger = {
	error: console.error.bind(console),
	info: console.log.bind(console),
};

export interface Logger {
	error: (message?: string) => void;
	info: (message?: string) => void;
}

export function makeLogger(indent = 5): Logger {
	const prefix = chalk.gray("│") + " ".repeat(indent);

	function colourMessage(message: string, messageType: MessageType) {
		return messageType === "error"
			? chalk.red(message)
			: chalk.blueBright(message);
	}

	function formatMessage(message = "", messageType: MessageType) {
		return message.includes(EOL)
			? message
					.split(EOL)
					.map((line) => `${prefix}${colourMessage(line, messageType)}`)
					.join(EOL)
			: `${prefix}${colourMessage(message, messageType)}`;
	}
	return {
		error: (message) => {
			console.error(formatMessage(message, "error"));
		},
		info: (message) => {
			console.log(formatMessage(message, "info"));
		},
	};
}

export interface SpinnerLogger extends Logger {
	flush: () => void;
}

type MessageType = "error" | "info";

export function makeSpinnerLogger(logger: Logger): SpinnerLogger {
	const logs: {
		message: string | undefined;
		type: MessageType;
	}[] = [];

	return {
		info: (message) => logs.push({ type: "info", message }),
		error: (message) => logs.push({ type: "error", message }),
		flush: () => {
			logger.info();
			logs.forEach((log) => {
				if (log.type === "error") {
					logger.error(log.message);
				} else {
					logger.info(log.message);
				}
			});
		},
	};
}

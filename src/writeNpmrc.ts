import * as fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { fallbackLogger, type Logger } from "./shared/cli/logger.js";

const AUTH_BLOCK_REGEX = /; begin auth token[\s\S]*?; end auth token\n?/g;

/**
 * Merges new auth token blocks into existing .npmrc content.
 * Existing auth blocks for the same registry are replaced in place.
 * New auth blocks for registries not already present are appended.
 * All other content is preserved unchanged.
 */
export function mergeNpmrcContent(
	existingContent: string,
	newContent: string,
): string {
	const newBlocks = [...newContent.matchAll(AUTH_BLOCK_REGEX)].map((m) => m[0]);

	if (newBlocks.length === 0) {
		return existingContent;
	}

	const remainingBlocks = [...newBlocks];

	let result = existingContent.replace(AUTH_BLOCK_REGEX, (existingBlock) => {
		const matchIndex = remainingBlocks.findIndex((newBlock) =>
			blocksMatchSameRegistry(existingBlock, newBlock),
		);
		if (matchIndex !== -1) {
			const replacement = remainingBlocks.splice(matchIndex, 1)[0];
			return replacement;
		}
		return existingBlock;
	});

	for (const block of remainingBlocks) {
		if (result.length > 0) {
			result += "\n";
		}
		result += block;
	}

	return result;
}

export async function writeNpmrc({
	npmrc,
	logger = fallbackLogger,
}: {
	npmrc: string;
	logger?: Logger;
}): Promise<void> {
	// Get the home directory
	const homeDirectory = os.homedir();

	// // Define the path for the .npmrc file
	const userNpmrcPath = path.join(homeDirectory, ".npmrc");

	logger.info(`Writing users .npmrc to: ${userNpmrcPath}`);

	try {
		let existingContent = "";
		try {
			existingContent = await fs.readFile(userNpmrcPath, "utf-8");
		} catch {
			// File does not exist yet; start with empty content
		}

		const merged = mergeNpmrcContent(existingContent, npmrc);

		// Write the content to the .npmrc file
		await fs.writeFile(userNpmrcPath, merged);
	} catch (error) {
		const errorMessage = `Error writing users .npmrc to ${userNpmrcPath}: ${error instanceof Error ? error.message : ""}`;
		throw new Error(errorMessage, { cause: error });
	}
}

function blocksMatchSameRegistry(block1: string, block2: string): boolean {
	const urls1 = getRegistryUrls(block1);
	const urls2 = getRegistryUrls(block2);
	for (const url of urls1) {
		if (urls2.has(url)) {
			return true;
		}
	}
	return false;
}

function getRegistryUrls(block: string): Set<string> {
	const urls = new Set<string>();
	for (const line of block.split("\n")) {
		const match = /^(\/\/[^:]+):/.exec(line);
		if (match?.[1]) {
			urls.add(match[1]);
		}
	}
	return urls;
}

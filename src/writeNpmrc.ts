import * as fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { fallbackLogger, type Logger } from "./shared/cli/logger.js";

const BEGIN_MARKER = "; begin auth token";
const END_MARKER = "; end auth token";

/**
 * Merges new auth token blocks into existing .npmrc content.
 * Existing auth blocks for the same registry are replaced in place.
 * New auth blocks for registries not already present are appended.
 * All other content (including auth blocks for other registries) is preserved unchanged.
 * Only auth token blocks (delimited by "; begin auth token" / "; end auth token") from
 * newContent are processed; any other text in newContent outside those delimiters is ignored.
 * A blank line is inserted before each appended block when the existing content is non-empty.
 */
export function mergeNpmrcContent(
	existingContent: string,
	newContent: string,
): string {
	const newBlocks = extractAuthBlocks(newContent);

	if (newBlocks.length === 0) {
		return existingContent;
	}

	const remainingBlocks = [...newBlocks];

	// Replace matching existing blocks with their updated counterparts.
	const existingBlocks = extractAuthBlocks(existingContent);
	let result = existingContent;
	for (const existingBlock of existingBlocks) {
		const matchIndex = remainingBlocks.findIndex((newBlock) =>
			blocksMatchSameRegistry(existingBlock, newBlock),
		);
		if (matchIndex !== -1) {
			const replacement = remainingBlocks.splice(matchIndex, 1)[0];
			const idx = result.indexOf(existingBlock);
			if (idx !== -1) {
				result =
					result.slice(0, idx) +
					replacement +
					result.slice(idx + existingBlock.length);
			}
		}
	}

	// Append any remaining new blocks that didn't match an existing one.
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

/** Extracts all auth token blocks (including delimiters) from a string. */
function extractAuthBlocks(content: string): string[] {
	const blocks: string[] = [];
	let searchStart = 0;
	for (;;) {
		const beginIdx = content.indexOf(BEGIN_MARKER, searchStart);
		if (beginIdx === -1) {
			break;
		}
		const endIdx = content.indexOf(END_MARKER, beginIdx + BEGIN_MARKER.length);
		if (endIdx === -1) {
			break;
		}
		const blockEnd = endIdx + END_MARKER.length;
		// Include the trailing newline if present so blocks are self-contained.
		const end =
			blockEnd < content.length && content[blockEnd] === "\n"
				? blockEnd + 1
				: blockEnd;
		blocks.push(content.slice(beginIdx, end));
		searchStart = end;
	}
	return blocks;
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

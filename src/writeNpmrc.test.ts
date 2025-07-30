import * as fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Logger } from "./shared/cli/logger.js";

import { writeNpmrc } from "./writeNpmrc.js";

vi.mock("node:fs/promises", () => ({
	appendFile: vi.fn(),
}));

vi.mock("node:os", () => ({
	default: {
		homedir: vi.fn(),
	},
}));

vi.mock("node:path", () => ({
	default: {
		join: vi.fn(),
	},
}));

// Typed mocks for better TypeScript integration
const mockAppendFile = vi.mocked(fs.appendFile);
const mockHomedir = vi.mocked(os.homedir);
const mockPathJoin = vi.spyOn(path, "join");

describe("writeNpmrc", () => {
	// Test constants
	const TEST_HOME_DIRECTORY = "/Users/testuser";
	const TEST_NPMRC_PATH = "/Users/testuser/.npmrc";
	const TEST_NPMRC_CONTENT = `//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/`;

	function createMockLogger(): Logger {
		return {
			info: vi.fn(),
			error: vi.fn(),
		};
	}

	function setupSuccessfulMocks(): void {
		mockHomedir.mockReturnValue(TEST_HOME_DIRECTORY);
		mockPathJoin.mockReturnValue(TEST_NPMRC_PATH);
		mockAppendFile.mockResolvedValue(undefined);
	}

	let mockLogger: Logger;

	beforeEach(() => {
		setupSuccessfulMocks();
		mockLogger = createMockLogger();
	});

	describe("successful scenarios", () => {
		it("should append npmrc content to user's home directory with proper logging", async () => {
			await writeNpmrc({
				npmrc: TEST_NPMRC_CONTENT,
				logger: mockLogger,
			});

			expect(mockHomedir).toHaveBeenCalledOnce();
			expect(mockPathJoin).toHaveBeenCalledWith(TEST_HOME_DIRECTORY, ".npmrc");
			expect(mockAppendFile).toHaveBeenCalledWith(
				TEST_NPMRC_PATH,
				TEST_NPMRC_CONTENT,
				"utf8",
			);
			expect(mockLogger.info).toHaveBeenCalledWith(
				`Writing users .npmrc to: ${TEST_NPMRC_PATH}`,
			);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Successfully wrote .npmrc file",
			);
			expect(mockLogger.info).toHaveBeenCalledTimes(2);
		});

		it("should work with fallback logger when no custom logger provided", async () => {
			await writeNpmrc({
				npmrc: TEST_NPMRC_CONTENT,
			});

			expect(mockAppendFile).toHaveBeenCalledWith(
				TEST_NPMRC_PATH,
				TEST_NPMRC_CONTENT,
				"utf8",
			);
		});
	});

	describe("error scenarios", () => {
		it("should throw descriptive error when fs.appendFile fails", async () => {
			const fileSystemError = new Error("Permission denied");
			mockAppendFile.mockRejectedValue(fileSystemError);

			await expect(
				writeNpmrc({
					npmrc: TEST_NPMRC_CONTENT,
					logger: mockLogger,
				}),
			).rejects.toThrow(
				`Error writing users .npmrc to ${TEST_NPMRC_PATH}: Permission denied`,
			);

			expect(mockLogger.info).toHaveBeenCalledWith(
				`Writing users .npmrc to: ${TEST_NPMRC_PATH}`,
			);
			expect(mockLogger.info).not.toHaveBeenCalledWith(
				"Successfully wrote .npmrc file",
			);
		});

		it("should handle non-Error objects thrown by fs.appendFile", async () => {
			const nonErrorObject = "String error";
			mockAppendFile.mockRejectedValue(nonErrorObject);

			await expect(
				writeNpmrc({
					npmrc: TEST_NPMRC_CONTENT,
					logger: mockLogger,
				}),
			).rejects.toThrow(`Error writing users .npmrc to ${TEST_NPMRC_PATH}: `);
		});
	});
});

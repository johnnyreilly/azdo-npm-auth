import * as fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Logger } from "./shared/cli/logger.js";

import { appendAuthBlockContent, writeNpmrc } from "./writeNpmrc.js";

vi.mock("node:fs/promises", () => ({
	readFile: vi.fn(),
	writeFile: vi.fn(),
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
const mockReadFile = vi.mocked(fs.readFile);
const mockWriteFile = vi.mocked(fs.writeFile);
const mockHomedir = vi.mocked(os.homedir);
const mockPathJoin = vi.spyOn(path, "join");

describe("appendAuthBlockContent", () => {
	const TEST_NPMRC_CONTENT = `; begin auth token
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:email=npm requires email to be set but doesn't use the value
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:email=npm requires email to be set but doesn't use the value
; end auth token
`;

	function createMockLogger(): Logger {
		return {
			info: vi.fn(),
			error: vi.fn(),
		};
	}

	let mockLogger: Logger;

	beforeEach(() => {
		mockLogger = createMockLogger();
	});

	describe("empty existing content", () => {
		it("should return npmrc content when existingContent is empty string", () => {
			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent: "",
				logger: mockLogger,
			});

			expect(result).toBe(TEST_NPMRC_CONTENT);
		});

		it("should return npmrc content when existingContent is undefined", () => {
			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				logger: mockLogger,
			});

			expect(result).toBe(TEST_NPMRC_CONTENT);
		});

		it("should return npmrc content when existingContent is whitespace only", () => {
			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent: "   \n  \t  ",
				logger: mockLogger,
			});

			expect(result).toBe("   \n  \t  \n" + TEST_NPMRC_CONTENT);
		});
	});

	describe("existing content with single auth block", () => {
		it("should replace single auth block when it's the only content", () => {
			const existingAuthBlock = `; begin auth token
//old.registry.com/:username=olduser
//old.registry.com/:_password=oldpassword
//old.registry.com/:email=old@example.com
; end auth token
`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent: existingAuthBlock,
				logger: mockLogger,
			});

			expect(result).toBe(TEST_NPMRC_CONTENT);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Found existing auth token block(s), replacing all of them",
			);
		});

		it("should replace single auth block and preserve other content", () => {
			const existingAuthBlock = `; begin auth token
//old.registry.com/:username=olduser
//old.registry.com/:_password=oldpassword
; end auth token
`;
			const existingContent = `registry=https://registry.npmjs.org/
proxy=http://proxy.company.com:8080
${existingAuthBlock}
some-other-config=value
final-config=another-value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			const expectedContent = `registry=https://registry.npmjs.org/
proxy=http://proxy.company.com:8080
${TEST_NPMRC_CONTENT}
some-other-config=value
final-config=another-value`;

			expect(result).toBe(expectedContent);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Found existing auth token block(s), replacing all of them",
			);
		});

		it("should replace auth block at the beginning of content", () => {
			const existingAuthBlock = `; begin auth token
//old.registry.com/:username=olduser
; end auth token
`;
			const existingContent = `${existingAuthBlock}registry=https://registry.npmjs.org/
some-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			const expectedContent = `${TEST_NPMRC_CONTENT}registry=https://registry.npmjs.org/
some-config=value`;

			expect(result).toBe(expectedContent);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Found existing auth token block(s), replacing all of them",
			);
		});

		it("should replace auth block at the end of content", () => {
			const existingAuthBlock = `; begin auth token
//old.registry.com/:username=olduser
; end auth token`;
			const existingContent = `registry=https://registry.npmjs.org/
some-config=value
${existingAuthBlock}`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			const expectedContent = `registry=https://registry.npmjs.org/
some-config=value
${TEST_NPMRC_CONTENT}`;

			expect(result).toBe(expectedContent);
		});
	});

	describe("existing content with multiple auth blocks", () => {
		it("should replace all auth blocks with single new block", () => {
			const authBlock1 = `; begin auth token
//old1.registry.com/:username=olduser1
//old1.registry.com/:_password=oldpass1
; end auth token
`;
			const authBlock2 = `; begin auth token
//old2.registry.com/:username=olduser2
//old2.registry.com/:_password=oldpass2
; end auth token
`;
			const existingContent = `${authBlock1}${authBlock2}`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			// Should replace all auth blocks with exactly one new block
			expect(result).toBe(TEST_NPMRC_CONTENT);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Found existing auth token block(s), replacing all of them",
			);
		});

		it("should replace multiple auth blocks and preserve other content", () => {
			const authBlock1 = `; begin auth token
//old1.registry.com/:username=olduser1
; end auth token
`;
			const authBlock2 = `; begin auth token
//old2.registry.com/:username=olduser2
; end auth token
`;
			const existingContent = `registry=https://registry.npmjs.org/
${authBlock1}proxy=http://proxy.company.com:8080
some-config=value
${authBlock2}final-config=another-value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			// Should replace all auth blocks with exactly one new block at the position of the first block
			const expectedContent = `registry=https://registry.npmjs.org/
${TEST_NPMRC_CONTENT}proxy=http://proxy.company.com:8080
some-config=value
final-config=another-value`;

			expect(result).toBe(expectedContent);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Found existing auth token block(s), replacing all of them",
			);
		});

		it("should handle three auth blocks interspersed with other content", () => {
			const authBlock1 = `; begin auth token
//registry1.com/:username=user1
; end auth token
`;
			const authBlock2 = `; begin auth token
//registry2.com/:username=user2
; end auth token
`;
			const authBlock3 = `; begin auth token
//registry3.com/:username=user3
; end auth token
`;
			const existingContent = `# Global npm config
${authBlock1}registry=https://registry.npmjs.org/
${authBlock2}proxy=http://proxy.example.com:8080
${authBlock3}# End of config`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			// Should replace all three auth blocks with exactly one new block at the position of the first block
			const expectedContent = `# Global npm config
${TEST_NPMRC_CONTENT}registry=https://registry.npmjs.org/
proxy=http://proxy.example.com:8080
# End of config`;

			expect(result).toBe(expectedContent);
		});

		it("should replace five auth blocks with exactly one new block to avoid duplicates", () => {
			const authBlocks = Array.from(
				{ length: 5 },
				(_, i) => `; begin auth token
//registry${(i + 1).toString()}.com/:username=user${(i + 1).toString()}
//registry${(i + 1).toString()}.com/:_password=password${(i + 1).toString()}
; end auth token
`,
			);

			const existingContent = `# Start of config
${authBlocks[0]}some-config=value1
${authBlocks[1]}another-config=value2
${authBlocks[2]}middle-config=value3
${authBlocks[3]}more-config=value4
${authBlocks[4]}# End of config`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			// All five auth blocks should be replaced with exactly one new block
			// at the position of the first auth block
			const expectedContent = `# Start of config
${TEST_NPMRC_CONTENT}some-config=value1
another-config=value2
middle-config=value3
more-config=value4
# End of config`;

			expect(result).toBe(expectedContent);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Found existing auth token block(s), replacing all of them",
			);
		});
	});

	describe("existing content without auth blocks", () => {
		it("should append to existing content ending with newline", () => {
			const existingContent = `registry=https://registry.npmjs.org/
proxy=http://proxy.company.com:8080
some-config=value
`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			expect(result).toBe(existingContent + TEST_NPMRC_CONTENT);
		});

		it("should append with newline separator when existing content doesn't end with newline", () => {
			const existingContent = `registry=https://registry.npmjs.org/
proxy=http://proxy.company.com:8080
some-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			expect(result).toBe(existingContent + "\n" + TEST_NPMRC_CONTENT);
		});

		it("should handle existing content with comments and various configurations", () => {
			const existingContent = `# This is my npmrc file
registry=https://registry.npmjs.org/
# Proxy settings
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080
# Package lock settings
package-lock=true
save-exact=true`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			expect(result).toBe(existingContent + "\n" + TEST_NPMRC_CONTENT);
		});
	});

	describe("edge cases and malformed content", () => {
		it("should handle malformed auth block (missing end marker)", () => {
			const existingContent = `registry=https://registry.npmjs.org/
; begin auth token
//old.registry.com/:username=olduser
//old.registry.com/:_password=oldpass
some-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			expect(result).toBe(existingContent + "\n" + TEST_NPMRC_CONTENT);
		});

		it("should handle malformed auth block (missing begin marker)", () => {
			const existingContent = `registry=https://registry.npmjs.org/
//old.registry.com/:username=olduser
//old.registry.com/:_password=oldpass
; end auth token
some-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			expect(result).toBe(existingContent + "\n" + TEST_NPMRC_CONTENT);
		});

		it("should handle auth block markers in comments", () => {
			const existingContent = `registry=https://registry.npmjs.org/
# This is not a real auth block: ; begin auth token
some-config=value
# Also not real: ; end auth token
another-config=another-value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			expect(result).toBe(existingContent + "\n" + TEST_NPMRC_CONTENT);
		});

		it("should handle empty auth block", () => {
			const existingContent = `registry=https://registry.npmjs.org/
; begin auth token

; end auth token
some-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			const expectedContent = `registry=https://registry.npmjs.org/
${TEST_NPMRC_CONTENT}some-config=value`;

			expect(result).toBe(expectedContent);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Found existing auth token block(s), replacing all of them",
			);
		});

		it("should handle auth block with extra whitespace", () => {
			const existingContent = `registry=https://registry.npmjs.org/
; begin auth token  
//old.registry.com/:username=olduser
//old.registry.com/:_password=oldpass
; end auth token   
some-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			// The regex pattern is strict about no whitespace after the markers
			// so this won't match and will be treated as no auth block found
			const expectedContent = existingContent + "\n" + TEST_NPMRC_CONTENT;

			expect(result).toBe(expectedContent);
		});

		it("should not match malformed auth block missing required newlines", () => {
			const existingContent = `registry=https://registry.npmjs.org/
; begin auth token
; end auth token
some-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			// This doesn't match the strict regex pattern because there's no newline
			// between begin and end markers, so it's treated as no auth block found
			const expectedContent = existingContent + "\n" + TEST_NPMRC_CONTENT;

			expect(result).toBe(expectedContent);
		});

		it("should handle case-sensitive auth block markers", () => {
			const existingContent = `registry=https://registry.npmjs.org/
; BEGIN AUTH TOKEN
//old.registry.com/:username=olduser
; END AUTH TOKEN
some-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			// Case-sensitive regex won't match uppercase markers
			const expectedContent = existingContent + "\n" + TEST_NPMRC_CONTENT;

			expect(result).toBe(expectedContent);
		});

		it("should handle partial auth block markers", () => {
			const existingContent = `registry=https://registry.npmjs.org/
; begin auth
//old.registry.com/:username=olduser
; end auth
some-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			// Partial markers won't match the exact pattern
			const expectedContent = existingContent + "\n" + TEST_NPMRC_CONTENT;

			expect(result).toBe(expectedContent);
		});
	});

	describe("logger behavior", () => {
		it("should use fallback logger when no logger provided", () => {
			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent: "",
			});

			expect(result).toBe(TEST_NPMRC_CONTENT);
		});
	});

	describe("newline handling", () => {
		it("should preserve exact newline structure when replacing auth blocks", () => {
			const authBlock = `; begin auth token
//old.registry.com/:username=olduser
; end auth token`;
			const existingContent = `config1=value1\n${authBlock}\nconfig2=value2`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			// TEST_NPMRC_CONTENT ends with a newline, so the result will be:
			// config1=value1\n + TEST_NPMRC_CONTENT + config2=value2
			const expectedContent = `config1=value1\n${TEST_NPMRC_CONTENT}config2=value2`;
			expect(result).toBe(expectedContent);
		});

		it("should handle mixed line endings consistently", () => {
			const existingContent = "config1=value1\r\nconfig2=value2\n";

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			expect(result).toBe(existingContent + TEST_NPMRC_CONTENT);
		});

		it("should handle content with only carriage returns", () => {
			const existingContent = "config1=value1\rconfig2=value2";

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			expect(result).toBe(existingContent + "\n" + TEST_NPMRC_CONTENT);
		});

		it("should handle very large existing content efficiently", () => {
			const largeConfig = Array.from(
				{ length: 1000 },
				(_, i) => `config${i.toString()}=value${i.toString()}`,
			).join("\n");
			const authBlock = `; begin auth token
//old.registry.com/:username=olduser
; end auth token
`;
			const existingContent = `${largeConfig}\n${authBlock}more-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			const expectedContent = `${largeConfig}\n${TEST_NPMRC_CONTENT}more-config=value`;
			expect(result).toBe(expectedContent);
			expect(mockLogger.info).toHaveBeenCalledWith(
				"Found existing auth token block(s), replacing all of them",
			);
		});

		it("should handle nested comment-like structures", () => {
			const existingContent = `registry=https://registry.npmjs.org/
# This is a comment with auth token keywords
; some comment with begin auth token text
more-config=value
# another comment with end auth token text
final-config=value`;

			const result = appendAuthBlockContent({
				npmrc: TEST_NPMRC_CONTENT,
				existingContent,
				logger: mockLogger,
			});

			expect(result).toBe(existingContent + "\n" + TEST_NPMRC_CONTENT);
		});
	});
});

describe("writeNpmrc", () => {
	const TEST_HOME_DIRECTORY = "/Users/testuser";
	const TEST_NPMRC_PATH = "/Users/testuser/.npmrc";
	const TEST_NPMRC_CONTENT = `; begin auth token
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:email=npm requires email to be set but doesn't use the value
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:email=npm requires email to be set but doesn't use the value
; end auth token
`;

	function createMockLogger(): Logger {
		return {
			info: vi.fn(),
			error: vi.fn(),
		};
	}

	function setupSuccessfulMocks(): void {
		mockHomedir.mockReturnValue(TEST_HOME_DIRECTORY);
		mockPathJoin.mockReturnValue(TEST_NPMRC_PATH);
		mockWriteFile.mockResolvedValue(undefined);
	}

	let mockLogger: Logger;

	beforeEach(() => {
		setupSuccessfulMocks();
		mockLogger = createMockLogger();
	});

	describe("successful scenarios", () => {
		it("should create new .npmrc file when it doesn't exist", async () => {
			// Mock file doesn't exist (ENOENT error)
			const enoentError = new Error("File not found") as NodeJS.ErrnoException;
			enoentError.code = "ENOENT";
			mockReadFile.mockRejectedValue(enoentError);

			await writeNpmrc({
				npmrc: TEST_NPMRC_CONTENT,
				logger: mockLogger,
			});

			expect(mockHomedir).toHaveBeenCalledOnce();
			expect(mockPathJoin).toHaveBeenCalledWith(TEST_HOME_DIRECTORY, ".npmrc");
			expect(mockReadFile).toHaveBeenCalledWith(TEST_NPMRC_PATH, "utf8");
			expect(mockWriteFile).toHaveBeenCalledWith(
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
		});

		it("should append to existing .npmrc file when no auth token block exists", async () => {
			const existingContent = "registry=https://registry.npmjs.org/\n";
			mockReadFile.mockResolvedValue(existingContent);

			await writeNpmrc({
				npmrc: TEST_NPMRC_CONTENT,
				logger: mockLogger,
			});

			expect(mockWriteFile).toHaveBeenCalledWith(
				TEST_NPMRC_PATH,
				existingContent + TEST_NPMRC_CONTENT,
				"utf8",
			);
		});

		it("should work with fallback logger when no custom logger provided", async () => {
			const enoentError = new Error("File not found") as NodeJS.ErrnoException;
			enoentError.code = "ENOENT";
			mockReadFile.mockRejectedValue(enoentError);

			await writeNpmrc({
				npmrc: TEST_NPMRC_CONTENT,
			});

			expect(mockWriteFile).toHaveBeenCalledWith(
				TEST_NPMRC_PATH,
				TEST_NPMRC_CONTENT,
				"utf8",
			);
		});
	});

	describe("error scenarios", () => {
		it("should throw descriptive error when fs.writeFile fails", async () => {
			const enoentError = new Error("File not founds") as NodeJS.ErrnoException;
			enoentError.code = "ENOENT";
			mockReadFile.mockRejectedValue(enoentError);

			const fileSystemError = new Error("Permission denied");
			mockWriteFile.mockRejectedValue(fileSystemError);

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
				"Successfully wrote .npmrc fileadfadfasj",
			);
		});

		it("should throw error when reading existing file fails with non-ENOENT error", async () => {
			const permissionError = new Error(
				"Permission denied",
			) as NodeJS.ErrnoException;
			permissionError.code = "EACCES";
			mockReadFile.mockRejectedValue(permissionError);

			await expect(
				writeNpmrc({
					npmrc: TEST_NPMRC_CONTENT,
					logger: mockLogger,
				}),
			).rejects.toThrow(
				`Error writing users .npmrc to ${TEST_NPMRC_PATH}: Permission denied`,
			);
		});

		it("should handle non-Error objects thrown by fs operations", async () => {
			const enoentError = new Error("File not found") as NodeJS.ErrnoException;
			enoentError.code = "ENOENT";
			mockReadFile.mockRejectedValue(enoentError);

			const nonErrorObject = "String error";
			mockWriteFile.mockRejectedValue(nonErrorObject);

			await expect(
				writeNpmrc({
					npmrc: TEST_NPMRC_CONTENT,
					logger: mockLogger,
				}),
			).rejects.toThrow(`Error writing users .npmrc to ${TEST_NPMRC_PATH}: `);
		});
	});
});

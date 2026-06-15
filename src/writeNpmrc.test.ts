import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { mergeNpmrcContent, writeNpmrc } from "./writeNpmrc.js";

// ── mergeNpmrcContent (pure) ─────────────────────────────────────────────────

describe("mergeNpmrcContent", () => {
	const authBlock = `; begin auth token
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:_password=dGVzdA==
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:email=test@example.com
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:_password=dGVzdA==
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:email=test@example.com
; end auth token
`;

	const updatedAuthBlock = `; begin auth token
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:_password=bmV3dG9rZW4=
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:email=test@example.com
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:_password=bmV3dG9rZW4=
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:email=test@example.com
; end auth token
`;

	const otherRegistryAuthBlock = `; begin auth token
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/registry/:username=otherorg
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/registry/:_password=b3RoZXI=
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/registry/:email=test@example.com
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/:username=otherorg
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/:_password=b3RoZXI=
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/:email=test@example.com
; end auth token
`;

	it("returns new content unchanged when existing content is empty", () => {
		const result = mergeNpmrcContent("", authBlock);

		expect(result).toBe(authBlock);
	});

	it("replaces matching auth block in existing content", () => {
		const result = mergeNpmrcContent(authBlock, updatedAuthBlock);

		expect(result).toBe(updatedAuthBlock);
	});

	it("replaces matching auth block when existing file has other content too", () => {
		const existing = `engine-strict=true\n\n${authBlock}`;
		const result = mergeNpmrcContent(existing, updatedAuthBlock);

		expect(result).toBe(`engine-strict=true\n\n${updatedAuthBlock}`);
	});

	it("appends new auth block when no matching registry exists", () => {
		const result = mergeNpmrcContent(otherRegistryAuthBlock, authBlock);

		expect(result).toBe(`${otherRegistryAuthBlock}\n${authBlock}`);
	});

	it("appends new auth block when existing content has no auth blocks", () => {
		const existing = "engine-strict=true\nalways-auth=true\n";
		const result = mergeNpmrcContent(existing, authBlock);

		expect(result).toBe(`${existing}\n${authBlock}`);
	});

	it("preserves unrelated auth blocks and updates matching one", () => {
		const existing = `${otherRegistryAuthBlock}\n${authBlock}`;
		const result = mergeNpmrcContent(existing, updatedAuthBlock);

		expect(result).toBe(`${otherRegistryAuthBlock}\n${updatedAuthBlock}`);
	});

	it("handles multiple new blocks - replacing matching and appending new", () => {
		const newContent = `${updatedAuthBlock}\n${otherRegistryAuthBlock}`;
		const result = mergeNpmrcContent(authBlock, newContent);

		expect(result).toBe(`${updatedAuthBlock}\n${otherRegistryAuthBlock}`);
	});

	it("returns existing content unchanged when newContent contains no auth blocks", () => {
		const existing = "engine-strict=true\n";
		const result = mergeNpmrcContent(existing, "some-other-config=true\n");

		expect(result).toBe(existing);
	});

	it("handles existing content ending without a newline before append", () => {
		const existingNoTrailingNewline = "engine-strict=true";
		const result = mergeNpmrcContent(existingNoTrailingNewline, authBlock);

		expect(result).toBe(`${existingNoTrailingNewline}\n${authBlock}`);
	});

	it("handles auth block with scope line correctly", () => {
		const scopedBlock = `; begin auth token
@myorg:registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:_password=dGVzdA==
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:email=test@example.com
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:_password=dGVzdA==
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:email=test@example.com
; end auth token
`;

		const updatedScopedBlock = `; begin auth token
@myorg:registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:_password=bmV3dG9rZW4=
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:email=test@example.com
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:_password=bmV3dG9rZW4=
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:email=test@example.com
; end auth token
`;

		const result = mergeNpmrcContent(scopedBlock, updatedScopedBlock);

		expect(result).toBe(updatedScopedBlock);
	});

	it("replaces matching auth block when existing content uses CRLF line endings", () => {
		// Existing .npmrc with Windows-style CRLF line endings
		const existingCRLF =
			"; begin auth token\r\n" +
			"//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:username=johnnyreilly\r\n" +
			"//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:_password=dGVzdA==\r\n" +
			"//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:email=test@example.com\r\n" +
			"//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:username=johnnyreilly\r\n" +
			"//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:_password=dGVzdA==\r\n" +
			"//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:email=test@example.com\r\n" +
			"; end auth token\r\n";

		const result = mergeNpmrcContent(existingCRLF, updatedAuthBlock);

		// The new block (LF) replaces the old block (CRLF) in place
		expect(result).toBe(updatedAuthBlock);
	});

	it("preserves non-auth content and appends when existing content uses CRLF line endings", () => {
		const existingCRLF = "engine-strict=true\r\n";

		const result = mergeNpmrcContent(existingCRLF, authBlock);

		// CRLF is normalised to LF in the output
		expect(result).toBe(`engine-strict=true\n\n${authBlock}`);
	});

	it("handles auth block at end of existing content without trailing newline", () => {
		// A block without a trailing newline (e.g. file saved without final newline)
		const authBlockNoTrailingNewline = authBlock.replace(/\n$/, "");

		const result = mergeNpmrcContent(
			authBlockNoTrailingNewline,
			updatedAuthBlock,
		);

		// The block is replaced in place; result uses the new block (which has a trailing newline)
		expect(result).toBe(updatedAuthBlock);
	});

	it("leaves unrecognised legacy-style auth blocks untouched and appends new block", () => {
		// Some tools use '# begin auth token' instead of '; begin auth token'.
		// These are not managed by azdo-npm-auth and must not be disturbed.
		const legacyBlock =
			"# begin auth token\n" +
			"//registry.npmjs.org/:_authToken=legacy-token\n" +
			"# end auth token\n";

		const result = mergeNpmrcContent(legacyBlock, authBlock);

		// Legacy block preserved; new block appended
		expect(result).toBe(`${legacyBlock}\n${authBlock}`);
	});
});

// ── writeNpmrc (integration, fs mocked) ─────────────────────────────────────

const mockReadFile =
	vi.fn<(path: string, encoding: string) => Promise<string>>();
const mockWriteFile = vi.fn<(path: string, content: string) => Promise<void>>();

vi.mock("node:fs/promises", () => ({
	readFile: (filePath: string, encoding: string) =>
		mockReadFile(filePath, encoding),
	writeFile: (filePath: string, content: string) =>
		mockWriteFile(filePath, content),
}));

const homeDir = "/home/testuser";
vi.mock("node:os", () => ({
	default: { homedir: () => homeDir },
}));

const userNpmrcPath = path.join(homeDir, ".npmrc");

describe("writeNpmrc", () => {
	const authBlock = `; begin auth token
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:_password=dGVzdA==
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:email=test@example.com
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:_password=dGVzdA==
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:email=test@example.com
; end auth token
`;

	it("writes new content when .npmrc does not exist", async () => {
		mockReadFile.mockRejectedValue(
			Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
		);
		mockWriteFile.mockResolvedValue(undefined);

		await writeNpmrc({ npmrc: authBlock });

		expect(mockWriteFile).toHaveBeenCalledWith(userNpmrcPath, authBlock);
	});

	it("replaces matching auth block in existing .npmrc", async () => {
		const existingContent = `engine-strict=true\n\n${authBlock}`;
		const updatedBlock = `; begin auth token
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:_password=bmV3dG9rZW4=
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/registry/:email=test@example.com
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:username=johnnyreilly
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:_password=bmV3dG9rZW4=
//pkgs.dev.azure.com/johnnyreilly/_packaging/my-feed/npm/:email=test@example.com
; end auth token
`;

		mockReadFile.mockResolvedValue(existingContent);
		mockWriteFile.mockResolvedValue(undefined);

		await writeNpmrc({ npmrc: updatedBlock });

		expect(mockWriteFile).toHaveBeenCalledWith(
			userNpmrcPath,
			`engine-strict=true\n\n${updatedBlock}`,
		);
	});

	it("appends auth block when existing .npmrc has no matching registry", async () => {
		const otherBlock = `; begin auth token
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/registry/:username=otherorg
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/registry/:_password=b3RoZXI=
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/registry/:email=test@example.com
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/:username=otherorg
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/:_password=b3RoZXI=
//pkgs.dev.azure.com/otherorg/_packaging/other-feed/npm/:email=test@example.com
; end auth token
`;

		mockReadFile.mockResolvedValue(otherBlock);
		mockWriteFile.mockResolvedValue(undefined);

		await writeNpmrc({ npmrc: authBlock });

		expect(mockWriteFile).toHaveBeenCalledWith(
			userNpmrcPath,
			`${otherBlock}\n${authBlock}`,
		);
	});

	it("throws a descriptive error when writeFile fails", async () => {
		mockReadFile.mockResolvedValue("");
		mockWriteFile.mockRejectedValue(new Error("disk full"));

		await expect(writeNpmrc({ npmrc: authBlock })).rejects.toThrow(
			`Error writing users .npmrc to ${userNpmrcPath}: disk full`,
		);
	});

	it("throws when readFile fails with a non-ENOENT error", async () => {
		mockReadFile.mockRejectedValue(
			Object.assign(new Error("EACCES: permission denied"), {
				code: "EACCES",
			}),
		);

		await expect(writeNpmrc({ npmrc: authBlock })).rejects.toThrow(
			`Error writing users .npmrc to ${userNpmrcPath}: EACCES: permission denied`,
		);
	});

	it("logs the path being written to", async () => {
		mockReadFile.mockResolvedValue("");
		mockWriteFile.mockResolvedValue(undefined);

		const logger = { info: vi.fn(), error: vi.fn() };
		await writeNpmrc({ npmrc: authBlock, logger });

		expect(logger.info).toHaveBeenCalledWith(
			`Writing users .npmrc to: ${userNpmrcPath}`,
		);
	});
});

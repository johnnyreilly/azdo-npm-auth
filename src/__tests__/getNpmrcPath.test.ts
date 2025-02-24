import os from "os";
import path from "path";
import { vi } from "vitest";
import { getNpmrcPath } from "../getNpmrcPath.js";

const mockHomedir = vi.spyOn(os, "homedir");

describe("getNpmrcPath", () => {
	beforeEach(() => {
		mockHomedir.mockReturnValue("/mock/home/dir");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns default home directory npmrc path when no custom path provided", () => {
		const result = getNpmrcPath();

		expect(result).toBe("/mock/home/dir/.npmrc");
		expect(mockHomedir).toHaveBeenCalledTimes(1);
	});

	it("returns resolved custom path when provided", () => {
		const customPath = "./custom/.npmrc";
		const result = getNpmrcPath(customPath);

		expect(result).toBe(path.resolve(customPath));
		expect(mockHomedir).not.toHaveBeenCalled();
	});
});

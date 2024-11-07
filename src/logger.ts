export const fallbackLogger: Logger = {
	info: console.log.bind(console),
	error: console.error.bind(console),
};

export interface Logger {
	info: (message: string) => void;
	error: (message: string) => void;
}

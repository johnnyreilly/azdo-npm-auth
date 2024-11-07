export const fallbackLogger: Logger = {
	error: console.error.bind(console),
	info: console.log.bind(console),
};

export interface Logger {
	error: (message: string) => void;
	info: (message: string) => void;
}

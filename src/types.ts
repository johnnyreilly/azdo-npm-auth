export interface TokenResult {
	patToken: {
		displayName: string;
		validTo: string;
		scope: string;
		targetAccounts: string[];
		validFrom: string;
		authorizationId: string;
		token: string;
	};
	patTokenError: string;
}
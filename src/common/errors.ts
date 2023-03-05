export class RequestError extends Error {
	status: number;
	constructor(message?: string, status = 500) {
		super(message);
		Object.setPrototypeOf(this, RequestError.prototype);
		this.status = status;
	}
}

export class NextMiddleware extends Error {
	constructor(message?: string) {
		super(message);
		Object.setPrototypeOf(this, NextMiddleware.prototype);
	}
}

export const throwError = (message?: string) => {
	throw new Error(message);
};

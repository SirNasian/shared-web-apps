export class RequestError extends Error {
	status: number;
	constructor(message: string, status = 500) {
		super(message);
		Object.setPrototypeOf(this, RequestError.prototype);
		this.status = status;
	}
}

import { ErrorResponse, ErrorType } from "./types";

export class AppError extends Error {
  private statusCode: number;

  constructor(errorType: keyof typeof ErrorType, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = ErrorType[errorType];

    // eslint-disable-next-line no-console
    console.error({ errorType, message });
  }

  get StatusCode() {
    return this.statusCode;
  }

  get JSON(): ErrorResponse {
    return {
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

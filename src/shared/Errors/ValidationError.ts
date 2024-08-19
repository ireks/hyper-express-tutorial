
export default class ValidationError extends Error {
    constructor(public errors: string[]) {
      super();
      this.name = "ValidationError";
      this.errors = errors;

    }
  }
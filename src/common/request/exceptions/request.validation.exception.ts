import { ValidationError } from 'class-validator';

export class RequestValidationException extends Error {
    private readonly errors: ValidationError[];

    constructor(errors: ValidationError[]) {
        super('RequestValidationException');

        this.name = 'RequestValidationException';
        this.message = 'request.validation';
        this.errors = errors;
    }

    getErrors(): ValidationError[] {
        return this.errors;
    }
}

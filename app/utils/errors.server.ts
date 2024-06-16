
export class EnvLoadingError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}

export class InvalidCredentialsError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}

// HTTP Related:
export class InternalServerError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}

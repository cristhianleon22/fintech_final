import { Request, Response, NextFunction } from 'express';
import {
    DomainError,
    InvalidPropValueError,
    UserInactiveError,
    UserAlreadyExistsError,
    InvalidCredentialsError,
} from '../../domain/exceptions/DomainError';
import {
    AccountNotFoundError,
    AccountFrozenError,
    InsufficientBalanceError,
    InvalidAmountError,
} from '../../domain/exceptions/FinancialError';

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof AccountNotFoundError) {
        res.status(404).json({
            status: 'error',
            code: 'ACCOUNT_NOT_FOUND',
            message: err.message,
        });
        return;
    }

    if (err instanceof InvalidCredentialsError) {
        res.status(401).json({
            status: 'error',
            code: 'INVALID_CREDENTIALS',
            message: err.message,
        });
        return;
    }

    if (err instanceof UserInactiveError || err instanceof AccountFrozenError) {
        res.status(403).json({
            status: 'error',
            code: 'OPERATION_FORBIDDEN',
            message: err.message,
        });
        return;
    }

    if (err instanceof UserAlreadyExistsError) {
        res.status(409).json({
            status: 'error',
            code: 'USER_ALREADY_EXISTS',
            message: err.message,
        });
        return;
    }

    if (
        err instanceof InvalidAmountError ||
        err instanceof InsufficientBalanceError ||
        err instanceof InvalidPropValueError
    ) {
        res.status(400).json({
            status: 'error',
            code: 'BAD_REQUEST',
            message: err.message,
        });
        return;
    }

    if (err instanceof DomainError) {
        res.status(400).json({
            status: 'error',
            code: 'DOMAIN_ERROR',
            message: err.message,
        });
        return;
    }

    // Errores no controlados
    console.error('Unhandled internal server error:', err);
    res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ocurrió un error inesperado en el servidor.',
    });
}


import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware';
import { CreateAccountUseCase } from '../../use-cases/CreateAccountUseCase';
import { GetUserAccountsUseCase } from '../../use-cases/GetUserAccountsUseCase';
import { GetBalanceUseCase } from '../../use-cases/GetBalanceUseCase';
import { FreezeAccountUseCase } from '../../use-cases/FreezeAccountUseCase';
import { UnfreezeAccountUseCase } from '../../use-cases/UnfreezeAccountUseCase';

export class AccountController {
    constructor(
        private readonly createAccountUseCase: CreateAccountUseCase,
        private readonly getUserAccountsUseCase: GetUserAccountsUseCase,
        private readonly getBalanceUseCase: GetBalanceUseCase,
        private readonly freezeAccountUseCase: FreezeAccountUseCase,
        private readonly unfreezeAccountUseCase: UnfreezeAccountUseCase
    ) { }

    createAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const newAccount = await this.createAccountUseCase.execute({
                userId,
                initialBalance: req.body?.initialBalance,
            });

            res.status(201).json({
                status: 'success',
                data: newAccount,
            });
        } catch (error) {
            next(error);
        }
    };

    getUserAccounts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const accounts = await this.getUserAccountsUseCase.execute(userId);

            res.status(200).json({
                status: 'success',
                data: accounts,
            });
        } catch (error) {
            next(error);
        }
    };

    getBalance = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const accountId = req.params.accountId as string;
            const balanceInfo = await this.getBalanceUseCase.execute({ accountId });

            res.status(200).json({
                status: 'success',
                data: balanceInfo,
            });
        } catch (error) {
            next(error);
        }
    };

    freeze = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const accountId = req.params.accountId as string;
            const result = await this.freezeAccountUseCase.execute({ accountId });

            res.status(200).json({
                status: 'success',
                message: 'Cuenta congelada exitosamente.',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    unfreeze = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const accountId = req.params.accountId as string;
            const result = await this.unfreezeAccountUseCase.execute({ accountId });

            res.status(200).json({
                status: 'success',
                message: 'Cuenta reactivada exitosamente.',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}

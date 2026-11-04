import { z } from 'zod';

export const TransferMoneySchema = z.object({
    sourceAccountId: z.string().uuid('El ID de cuenta de origen debe ser un UUID válido.'),
    destinationAccountId: z.string().uuid('El ID de cuenta de destino debe ser un UUID válido.'),
    amount: z.number().positive('El monto a transferir debe ser estrictamente mayor a cero.'),
    description: z.string().max(100, 'La descripción no puede exceder 100 caracteres.').optional(),
});

export const DepositSchema = z.object({
    accountId: z.string().uuid('El ID de cuenta debe ser un UUID válido.'),
    amount: z.number().positive('El monto a depositar debe ser estrictamente mayor a cero.'),
});

export const WithdrawalSchema = z.object({
    accountId: z.string().uuid('El ID de cuenta debe ser un UUID válido.'),
    amount: z.number().positive('El monto a retirar debe ser estrictamente mayor a cero.'),
});

export type TransferMoneyDTO = z.infer<typeof TransferMoneySchema>;
export type DepositDTO = z.infer<typeof DepositSchema>;
export type WithdrawalDTO = z.infer<typeof WithdrawalSchema>;


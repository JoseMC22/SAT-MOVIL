import { Module } from '@nestjs/common';
import { DebtController } from './infrastructure/debt.controller.js';
import { GetDebtUseCase } from './application/get-debt.use-case.js';
import { GetSubOptionsUseCase } from './application/get-sub-options.use-case.js';
import { SqlServerDebtRepository } from './infrastructure/sql-server-debt.repository.js';

@Module({
    controllers: [DebtController],
    providers: [
        GetDebtUseCase,
        GetSubOptionsUseCase,
        {
            provide: 'DebtRepository',
            useClass: SqlServerDebtRepository,
        },
    ],
    exports: [GetDebtUseCase, GetSubOptionsUseCase],
})
export class DebtModule { }

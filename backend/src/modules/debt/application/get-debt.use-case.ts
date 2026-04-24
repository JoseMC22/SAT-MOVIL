import { Inject, Injectable } from '@nestjs/common';
import { Debt } from '../domain/debt.entity';
import type { DebtRepository } from '../domain/debt.entity';

@Injectable()
export class GetDebtUseCase {
    constructor(
        @Inject('DebtRepository')
        private readonly debtRepository: DebtRepository,
    ) { }

    async execute(codigo: string, tipo: string, anno?: string, predio?: string): Promise<Debt[]> {
        return this.debtRepository.findDebt(codigo, tipo, anno, predio);
    }
}

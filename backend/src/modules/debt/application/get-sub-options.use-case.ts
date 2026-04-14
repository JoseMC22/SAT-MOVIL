import { Inject, Injectable } from '@nestjs/common';
import type { DebtRepository, SubOption } from '../domain/debt.entity';

@Injectable()
export class GetSubOptionsUseCase {
    constructor(
        @Inject('DebtRepository')
        private readonly debtRepository: DebtRepository,
    ) { }

    async execute(codigo: string, anno: string, tipo: string): Promise<SubOption[]> {
        return this.debtRepository.findSubOptions(codigo, anno, tipo);
    }
}

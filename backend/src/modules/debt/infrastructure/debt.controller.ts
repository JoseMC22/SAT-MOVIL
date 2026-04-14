import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { GetDebtUseCase } from '../application/get-debt.use-case';
import { GetSubOptionsUseCase } from '../application/get-sub-options.use-case';
import { z } from 'zod';
import { ZodValidationPipe } from 'nestjs-zod';

const GetDebtSchema = z.object({
    codigo: z.string().min(1),
    anno: z.string().min(4).max(4),
    tipo: z.string().min(1),
    predio: z.string().optional(),
});

type GetDebtDto = z.infer<typeof GetDebtSchema>;

@Controller('debt')
export class DebtController {
    constructor(
        private readonly getDebtUseCase: GetDebtUseCase,
        private readonly getSubOptionsUseCase: GetSubOptionsUseCase,
    ) { }

    @Get('consult')
    @UsePipes(new ZodValidationPipe(GetDebtSchema))
    async consult(@Query() query: GetDebtDto) {
        return this.getDebtUseCase.execute(query.codigo, query.anno, query.tipo, query.predio);
    }

    @Get('sub-options')
    @UsePipes(new ZodValidationPipe(GetDebtSchema)) // Reuse same schema (codigo, anno, tipo)
    async getSubOptions(@Query() query: GetDebtDto) {
        return this.getSubOptionsUseCase.execute(query.codigo, query.anno, query.tipo);
    }
}

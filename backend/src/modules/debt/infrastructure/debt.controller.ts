import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { GetDebtUseCase } from '../application/get-debt.use-case';
import { GetSubOptionsUseCase } from '../application/get-sub-options.use-case';
import { z } from 'zod';
import { ZodValidationPipe } from 'nestjs-zod';

const GetDebtSchema = z.object({
    codigo: z.string().min(1),
    anno: z.string().min(4).max(4).optional(),
    tipo: z.string().min(1),
    predio: z.string().optional(),
});

const GetSubOptionsSchema = z.object({
    codigo: z.string().min(1),
    anno: z.string().min(4).max(4).optional(),
    tipo: z.string().min(1),
});

type GetDebtDto = z.infer<typeof GetDebtSchema>;
type GetSubOptionsDto = z.infer<typeof GetSubOptionsSchema>;

@Controller('debt')
export class DebtController {
    constructor(
        private readonly getDebtUseCase: GetDebtUseCase,
        private readonly getSubOptionsUseCase: GetSubOptionsUseCase,
    ) { }

    @Get('consult')
    @UsePipes(new ZodValidationPipe(GetDebtSchema))
    async consult(@Query() query: GetDebtDto) {
        return this.getDebtUseCase.execute(query.codigo, query.tipo, query.anno, query.predio);
    }

    @Get('sub-options')
    @UsePipes(new ZodValidationPipe(GetSubOptionsSchema))
    async getSubOptions(@Query() query: GetSubOptionsDto) {
        return this.getSubOptionsUseCase.execute(query.codigo, query.tipo, query.anno);
    }
}

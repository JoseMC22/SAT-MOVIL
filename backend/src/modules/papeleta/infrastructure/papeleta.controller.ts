import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetPapeletasUseCase } from '../application/get-papeletas.use-case.js';
import { GuestLimitGuard } from '../../auth/infrastructure/guest-limit.guard.js';

@Controller('papeleta')
export class PapeletaController {
    constructor(
        private readonly getPapeletasUseCase: GetPapeletasUseCase,
    ) { }

    @UseGuards(GuestLimitGuard)
    @Get('consult')
    async consult(
        @Query('anno') anno?: string,
        @Query('placa') placa?: string,
        @Query('dni') dni?: string,
        @Query('nroPapeleta') nroPapeleta?: string,
    ) {
        return this.getPapeletasUseCase.execute(anno, placa, dni, nroPapeleta);
    }
}

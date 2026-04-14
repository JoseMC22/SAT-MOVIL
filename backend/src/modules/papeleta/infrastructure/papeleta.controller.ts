import { Controller, Get, Query } from '@nestjs/common';
import { GetPapeletasUseCase } from '../application/get-papeletas.use-case.js';

@Controller('papeleta')
export class PapeletaController {
    constructor(
        private readonly getPapeletasUseCase: GetPapeletasUseCase,
    ) { }

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

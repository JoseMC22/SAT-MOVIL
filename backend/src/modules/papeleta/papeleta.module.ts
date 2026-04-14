import { Module } from '@nestjs/common';
import { PapeletaController } from './infrastructure/papeleta.controller.js';
import { GetPapeletasUseCase } from './application/get-papeletas.use-case.js';
import { SqlServerPapeletaRepository } from './infrastructure/sql-server-papeleta.repository.js';

@Module({
    controllers: [PapeletaController],
    providers: [
        GetPapeletasUseCase,
        {
            provide: 'PapeletaRepository',
            useClass: SqlServerPapeletaRepository,
        },
    ],
    exports: [GetPapeletasUseCase],
})
export class PapeletaModule { }

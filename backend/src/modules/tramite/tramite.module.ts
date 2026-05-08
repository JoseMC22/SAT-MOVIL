import { Module } from '@nestjs/common';
import { TramiteController } from './infrastructure/tramite.controller.js';
import { GetTramitesUseCase } from './application/get-tramites.use-case.js';
import { GetTramitesByNumUseCase } from './application/get-tramites-by-num.use-case.js';
import { SqlServerTramiteRepository } from './infrastructure/sql-server-tramite.repository.js';

@Module({
    controllers: [TramiteController],
    providers: [
        GetTramitesUseCase,
        GetTramitesByNumUseCase,
        {
            provide: 'TramiteRepository',
            useClass: SqlServerTramiteRepository,
        },
    ],
    exports: [GetTramitesUseCase, GetTramitesByNumUseCase],
})
export class TramiteModule { }

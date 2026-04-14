import { Module } from '@nestjs/common';
import { TramiteController } from './infrastructure/tramite.controller.js';
import { GetTramitesUseCase } from './application/get-tramites.use-case.js';
import { SqlServerTramiteRepository } from './infrastructure/sql-server-tramite.repository.js';

@Module({
    controllers: [TramiteController],
    providers: [
        GetTramitesUseCase,
        {
            provide: 'TramiteRepository',
            useClass: SqlServerTramiteRepository,
        },
    ],
    exports: [GetTramitesUseCase],
})
export class TramiteModule { }

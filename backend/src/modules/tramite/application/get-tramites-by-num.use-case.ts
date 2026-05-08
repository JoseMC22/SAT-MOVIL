import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../domain/tramite.entity.js';
import type { TramiteRepository } from '../domain/tramite.entity.js';

@Injectable()
export class GetTramitesByNumUseCase {
    constructor(
        @Inject('TramiteRepository')
        private readonly tramiteRepository: TramiteRepository
    ) { }

    async execute(numTramite: string): Promise<Tramite[]> {
        return this.tramiteRepository.getTramitesByNumTramite(numTramite);
    }
}

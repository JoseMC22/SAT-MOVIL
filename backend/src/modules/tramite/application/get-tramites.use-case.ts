import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../domain/tramite.entity.js';
import type { TramiteRepository } from '../domain/tramite.entity.js';

@Injectable()
export class GetTramitesUseCase {
    constructor(
        @Inject('TramiteRepository')
        private readonly tramiteRepository: TramiteRepository
    ) { }

    async execute(dni: string): Promise<Tramite[]> {
        return this.tramiteRepository.getTramitesByDni(dni);
    }
}

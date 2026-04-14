import { Inject, Injectable } from '@nestjs/common';
import { Papeleta } from '../domain/papeleta.entity.js';
import type { PapeletaRepository } from '../domain/papeleta.entity.js';

@Injectable()
export class GetPapeletasUseCase {
    constructor(
        @Inject('PapeletaRepository')
        private readonly papeletaRepository: PapeletaRepository,
    ) { }

    async execute(anno?: string, placa?: string, dni?: string, nroPapeleta?: string): Promise<Papeleta[]> {
        return this.papeletaRepository.findPapeletas(anno, placa, dni, nroPapeleta);
    }
}

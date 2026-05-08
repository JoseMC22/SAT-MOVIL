export class Tramite {
    constructor(
        public readonly id: string,
        public readonly expediente: string,
        public readonly asunto: string,
        public readonly oficina: string,
        public readonly fechaRegistro: Date,
        public readonly flagEstado: number,
        public readonly estadoMovimiento: number,
        public readonly etiquetaEstado: string,
        public readonly diasTranscurridos: number,
        public readonly estaFinalizado: boolean,
        public readonly porcentajeProgreso: number,
        public readonly dias: number
    ) { }
}

export interface TramiteRepository {
    getTramitesByDni(dni: string): Promise<Tramite[]>;
    getTramitesByNumTramite(numTramite: string): Promise<Tramite[]>;
}

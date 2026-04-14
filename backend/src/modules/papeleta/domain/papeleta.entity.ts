export interface PapeletaAttachment {
  nombre_archivo: string;
  url_nas: string;
}

export class Papeleta {
  constructor(
    public readonly nombre: string,
    public readonly tipode1: string,
    public readonly cod_pred: string,
    public readonly cod_pred1: string,
    public readonly fecapli: string,
    public readonly infracc: string,
    public readonly imp_insol: number,
    public readonly imp_reaj: number,
    public readonly total_deuda: number,
    public readonly codigo: string,
    public readonly tipo: string,
    public readonly attachments: PapeletaAttachment[] = []
  ) { }
}

export interface PapeletaRepository {
  findPapeletas(anno?: string, placa?: string, dni?: string, nroPapeleta?: string): Promise<Papeleta[]>;
}

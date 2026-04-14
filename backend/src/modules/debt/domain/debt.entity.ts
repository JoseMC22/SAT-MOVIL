export class Debt {
  constructor(
    public readonly idrecibo: string,
    public readonly codigo: string,
    public readonly tipo: string,
    public readonly anno: string,
    public readonly cod_pred: string,
    public readonly anexo: string,
    public readonly sub_anexo: string,
    public readonly tipo_rec: string,
    public readonly periodo: string,
    public readonly imp_reaj: number,
    public readonly mora: number,
    public readonly costo_emis: number,
    public readonly estado: string,
    public readonly des_tipo: string,
    public readonly des_cabecera: string,
    public readonly ubica: string,
    public readonly total: number,
    public readonly tot_pagado?: number,
    public readonly descuento?: number,
    public readonly fec_venc?: string,
  ) { }
}

export interface SubOption {
  label: string;
  value: string;
}

export interface DebtRepository {
  findDebt(codigo: string, anno: string, tipo: string, predio?: string): Promise<Debt[]>;
  findSubOptions(codigo: string, anno: string, tipo: string): Promise<SubOption[]>;
}

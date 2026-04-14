import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { Debt, DebtRepository, SubOption } from '../domain/debt.entity';

@Injectable()
export class SqlServerDebtRepository implements DebtRepository {
    constructor(private readonly configService: ConfigService) { }

    private get config() {
        return {
            user: this.configService.get<string>('DB_USER'),
            password: this.configService.get<string>('DB_PASSWORD'),
            server: this.configService.get<string>('DB_SERVER'),
            database: this.configService.get<string>('DB_NAME'),
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        };
    }

    async findDebt(codigo: string, anio: string, tributo: string, predio?: string): Promise<Debt[]> {
        try {

            const anioFormatted = `*${anio}*`;
            const tributoFormatted = `*${tributo}*`;
            const predioFormatted = `*${predio}*`;

            const pool = await sql.connect(this.config);
            const result = await pool.request()
                .input('codigo', sql.VarChar, codigo)
                .input('annos', sql.VarChar, anioFormatted)
                .input('tipos', sql.VarChar, tributoFormatted)
                .input('criterio', sql.VarChar, '0')
                .input('estado', sql.VarChar, '0')
                .input('predio', sql.VarChar, predioFormatted || '')
                .execute('Caja.sp_EstCta_Rentas');

            return result.recordset.map(row => new Debt(
                row.idrecibo,
                row.codigo,
                row.tipo,
                row.anno,
                row.cod_pred,
                row.anexo,
                row.sub_anexo,
                row.tipo_rec,
                row.periodo,
                row.imp_reaj,
                row.mora,
                row.costo_emis,
                row.estado,
                row.des_tipo,
                row.des_cabecera,
                row.ubica,
                row.total,
                row.tot_pagado,
                row.descuento,
                row.fec_venc
            ));
        } catch (err) {
            console.error('SQL Server error', err);
            return [];
        }
    }

    async findSubOptions(codigo: string, anno: string, tipo: string): Promise<SubOption[]> {
        try {
            const pool = await sql.connect(this.config);
            let query = '';

            if (tipo === '11.00' || tipo === '00.38') {
                // Arbitrios o Alcabala
                query = `SELECT cod_pred as value, Rentas.getDirpred_sinurb(m.codigo ,m.cod_pred ,m.anexo ,m.sub_anexo, m.anno ) as label
                         FROM Rentas.MPUpred m 
                         WHERE m.codigo = @codigo AND m.anno = @anno AND m.nestado=1`;
            } else if (tipo === '00.30') {
                // Vehicular
                query = `SELECT ltrim(rtrim(cod_pred)) as value, ltrim(rtrim(cod_pred)) as label 
                         FROM Caja.MRecibos with (nolock) 
                         WHERE codigo=@codigo and tipo='00.30' and ESTADO = 0 group by cod_pred`;
            } else {
                return [];
            }

            const result = await pool.request()
                .input('codigo', sql.VarChar, codigo)
                .input('anno', sql.VarChar, anno)
                .query(query);

            return result.recordset.map(row => ({
                label: row.label?.toString().trim() || 'Sin descripción',
                value: row.value?.toString().trim() || ''
            }));
        } catch (err) {
            console.error('SQL Server error in findSubOptions', err);
            return [];
        }
    }
}

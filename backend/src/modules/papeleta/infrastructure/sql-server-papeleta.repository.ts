import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { Papeleta, PapeletaRepository } from '../domain/papeleta.entity';

@Injectable()
export class SqlServerPapeletaRepository implements PapeletaRepository {
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

    async findPapeletas(anno?: string, placa?: string, dni?: string, nroPapeleta?: string): Promise<Papeleta[]> {
        try {
            const pool = await sql.connect(this.config);
            const request = pool.request();
            request.input('msquery', sql.VarChar, '2');
            request.input('infracanio', sql.VarChar, anno || '');
            request.input('placa', sql.VarChar, placa || '');
            request.input('dniconduc', sql.VarChar, dni || '');
            request.input('infrac', sql.VarChar, nroPapeleta || '');

            const initialResult = await request.execute('papeleta.consultainfractor');
            const initialRows = initialResult.recordset;

            const detailedResults = await Promise.all(initialRows
                .filter(row => row.estado !== '9')
                .map(async (row) => {
                    const innerRequest = pool.request();
                    const fracciona = `*${row.numapap}-${row.talonario.trim()}-${row.numnpap}*`;

                    innerRequest.input('buscar', sql.Int, 2);
                    innerRequest.input('codigo', sql.VarChar, row.codigocond || '');
                    innerRequest.input('resumen', sql.VarChar, '1');
                    innerRequest.input('detalle', sql.VarChar, '0');
                    innerRequest.input('agrupar', sql.VarChar, '0');
                    innerRequest.input('annos', sql.VarChar, '');
                    innerRequest.input('tipos', sql.VarChar, '*10.86*,*25.30*,*30.98*,*46.34*');
                    innerRequest.input('tiporec', sql.VarChar, '');
                    innerRequest.input('perio', sql.VarChar, '');
                    innerRequest.input('predio', sql.VarChar, '');
                    innerRequest.input('estado', sql.VarChar, '');
                    innerRequest.input('criterio', sql.VarChar, '0');
                    innerRequest.input('vehiculo', sql.VarChar, '');
                    innerRequest.input('fracciona', sql.VarChar, fracciona);

                    const innerResult = await innerRequest.execute('Caja.sp_Imprime_EstCta_pape');
                    return innerResult.recordset[0]; // Assuming one record per fine
                }));

            // Filter out any undefined/null results and map to Papeleta entity
            const papeletas = await Promise.all(detailedResults
                .filter(row => !!row)
                .map(async (row) => {

                    return new Papeleta(
                        row.nombre?.toString() || '',
                        row.tipode1 || '',
                        row.cod_pred || '',
                        row.cod_pred1?.trim() || '',
                        row.fecapli || '',
                        row.infracc || '',
                        row.imp_insol || 0,
                        row.imp_reaj || 0,
                        row.total_deuda || 0,
                        row.codigo || '',
                        row.tipo || '',

                    );
                }));

            return papeletas;
        } catch (err) {
            console.error('SQL Server error in findPapeletas', err);
            return [];
        }
    }
}

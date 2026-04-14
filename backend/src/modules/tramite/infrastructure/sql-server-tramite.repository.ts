import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { Tramite, TramiteRepository } from '../domain/tramite.entity.js';

@Injectable()
export class SqlServerTramiteRepository implements TramiteRepository {
    constructor(private readonly configService: ConfigService) { }

    private get config() {
        const dbConfig = {
            user: this.configService.get<string>('DB_STD_USER'),
            password: this.configService.get<string>('DB_STD_PASSWORD'),
            server: this.configService.get<string>('DB_STD_SERVER'),
            database: this.configService.get<string>('DB_STD_NAME'),
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        };

        if (!dbConfig.database) {
            console.error('CRITICAL: DB_STD_NAME is not defined in .env! This will cause "Invalid object name" errors.');
        }

        return dbConfig;
    }

    private calculateBusinessDays(startDate: Date, endDate: Date): number {
        let count = 0;
        const curDate = new Date(startDate.getTime());
        while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
                count++;
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    }

    private getStatusLabel(flagEstado: number, estadoMovimiento: number): string {
        if (flagEstado === 3) return 'Finalizado';

        switch (estadoMovimiento) {
            case 1: return 'Pendiente';
            case 2: return 'Derivado';
            case 3: return 'Delegado';
            case 4: return 'Respondido';
            case 5: return 'Finalizado';
            default: return flagEstado === 2 ? 'En Proceso' : 'Pendiente';
        }
    }

    async getTramitesByDni(dni: string): Promise<Tramite[]> {
        let pool;
        try {
            const config = this.config;
            // console.log(`[STD DB] Attempting connection to ${config.server} / Database: ${config.database} as User: ${config.user}`);
            // console.log(`[STD DB] Querying for DNI: "${dni}"`);

            pool = await new sql.ConnectionPool(config).connect();
            const result = await pool.request()
                .input('dni', sql.VarChar, dni)
                .query(`
                    SELECT *
                    FROM (
                        SELECT 
                            t.iCodTramite AS codtramite,
                            m.fFecDerivar AS fec_deriva,
                            t.cAsunto AS asunto,
                            t.cCodificacion AS exp,
                            trim(o.cNomOficina) AS oficina,
                            m.nEstadoMovimiento AS estado_mov,
                            t.fFecRegistro,
                            t.nFlgEstado,
                            ROW_NUMBER() OVER (
                                PARTITION BY t.iCodTramite 
                                ORDER BY m.fFecDerivar DESC
                            ) AS rn
                        FROM dbo.Tra_M_Tramite t
                        INNER JOIN dbo.Tra_M_Remitente r 
                            ON t.iCodRemitente = r.iCodRemitente 
                        INNER JOIN dbo.Tra_M_Tramite_Movimientos m 
                            ON t.iCodTramite = m.iCodTramite
                        INNER JOIN dbo.Tra_M_Oficinas o 
                            ON m.iCodOficinaDerivar = o.iCodOficina
                        WHERE LTRIM(RTRIM(r.nNumDocumento)) = @dni
                    ) AS x
                    WHERE rn = 1
                `);

            console.log(`[STD DB] Query successful. Found ${result.recordset.length} tramites.`);
            const today = new Date();

            return result.recordset.map(row => {
                const fechaRegistro = new Date(row.fFecRegistro);
                const diasTranscurridos = this.calculateBusinessDays(fechaRegistro, today);

                // Logic provided by user: flagEstado 3 = finished
                const estaFinalizado = row.nFlgEstado === 3;

                return new Tramite(
                    String(row.codtramite),
                    row.exp,
                    row.asunto,
                    row.oficina,
                    fechaRegistro,
                    row.nFlgEstado,
                    row.estado_mov,
                    this.getStatusLabel(row.nFlgEstado, row.estado_mov),
                    diasTranscurridos,
                    estaFinalizado,
                    estaFinalizado ? 100 : Math.min(Math.round((diasTranscurridos / 45) * 100), 100)
                );
            });
        } catch (err) {
            console.error('SQL Server Tramite Repository Error:', err);
            return [];
        }
    }
}

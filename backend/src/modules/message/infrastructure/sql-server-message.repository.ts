import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { Message, Attachment, MessageRepository } from '../domain/message.entity.js';

@Injectable()
export class SqlServerMessageRepository implements MessageRepository {
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

    async getMessagesByUserId(userId: string): Promise<Message[]> {
        try {
            const nasBase = this.configService.get<string>('NAS_BASE_PATH') || '';
            const pool = await sql.connect(this.config);

            // Get messages
            const msgResult = await pool.request()
                .input('id_usuario', sql.Int, parseInt(userId))
                .query(`
                    SELECT id_mensaje, asunto, cuerpo, id_usuario as id_usuario_receptor, fecha_envio, leido
                    FROM movil.mensajes
                    WHERE id_usuario = @id_usuario
                    ORDER BY fecha_envio DESC
                `);

            const messages: Message[] = [];

            for (const row of msgResult.recordset) {
                // Get attachments for each message
                const adjResult = await pool.request()
                    .input('id_mensaje', sql.Int, row.id_mensaje)
                    .query(`
                        SELECT id_adjunto, nombre_archivo, url_nas as ruta_archivo, tipo_mime
                        FROM movil.mensajes_adjuntos
                        WHERE id_mensaje = @id_mensaje
                    `);

                const attachments = adjResult.recordset.map(adj => {
                    const fullPath = adj.ruta_archivo.startsWith('\\\\')
                        ? adj.ruta_archivo
                        : `${nasBase}\\${adj.ruta_archivo.replace(/^\/+/, '')}`;

                    return new Attachment(
                        String(adj.id_adjunto),
                        adj.nombre_archivo,
                        fullPath,
                        adj.tipo_mime
                    );
                });

                messages.push(new Message(
                    String(row.id_mensaje),
                    row.asunto,
                    row.cuerpo,
                    String(row.id_usuario_receptor),
                    row.fecha_envio,
                    row.leido,
                    attachments
                ));
            }

            return messages;
        } catch (err) {
            console.error('SQL Server Message Repository Error:', err);
            return [];
        }
    }

    async getMessageById(messageId: string): Promise<Message | null> {
        try {
            const nasBase = this.configService.get<string>('NAS_BASE_PATH') || '';
            const pool = await sql.connect(this.config);
            const result = await pool.request()
                .input('id_mensaje', sql.Int, parseInt(messageId))
                .query(`
                    SELECT id_mensaje, asunto, cuerpo, id_usuario as id_usuario_receptor, fecha_envio, leido
                    FROM movil.mensajes
                    WHERE id_mensaje = @id_mensaje
                `);

            if (result.recordset.length === 0) return null;

            const row = result.recordset[0];

            const adjResult = await pool.request()
                .input('id_mensaje', sql.Int, row.id_mensaje)
                .query(`
                    SELECT id_adjunto, nombre_archivo, url_nas as ruta_archivo, tipo_mime
                    FROM movil.mensajes_adjuntos
                    WHERE id_mensaje = @id_mensaje
                `);

            const attachments = adjResult.recordset.map(adj => {
                const fullPath = adj.ruta_archivo.startsWith('\\\\')
                    ? adj.ruta_archivo
                    : `${nasBase}\\${adj.ruta_archivo.replace(/^\/+/, '')}`;

                return new Attachment(
                    String(adj.id_adjunto),
                    adj.nombre_archivo,
                    fullPath,
                    adj.tipo_mime
                );
            });

            return new Message(
                String(row.id_mensaje),
                row.asunto,
                row.cuerpo,
                String(row.id_usuario_receptor),
                row.fecha_envio,
                row.leido,
                attachments
            );
        } catch (err) {
            console.error('Error fetching message details:', err);
            return null;
        }
    }

    async getAttachmentById(attachmentId: string): Promise<Attachment | null> {
        try {
            const nasBase = this.configService.get<string>('NAS_BASE_PATH') || '';
            const pool = await sql.connect(this.config);
            const result = await pool.request()
                .input('id_adjunto', sql.Int, parseInt(attachmentId))
                .query(`
                    SELECT id_adjunto, nombre_archivo, url_nas as ruta_archivo, tipo_mime
                    FROM movil.mensajes_adjuntos
                    WHERE id_adjunto = @id_adjunto
                `);

            if (result.recordset.length === 0) return null;

            const adj = result.recordset[0];
            const fullPath = adj.ruta_archivo.startsWith('\\\\')
                ? adj.ruta_archivo
                : `${nasBase}\\${adj.ruta_archivo.replace(/^\/+/, '')}`;

            return new Attachment(
                String(adj.id_adjunto),
                adj.nombre_archivo,
                fullPath,
                adj.tipo_mime
            );
        } catch (err) {
            console.error('Error fetching attachment details:', err);
            return null;
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        try {
            const pool = await sql.connect(this.config);
            const result = await pool.request()
                .input('id_usuario', sql.Int, parseInt(userId))
                .query(`
                    SELECT COUNT(*) as count
                    FROM movil.mensajes
                    WHERE id_usuario = @id_usuario AND leido = 0
                `);
            return result.recordset[0].count;
        } catch (err) {
            console.error('Error getting unread count:', err);
            return 0;
        }
    }

    async markAsRead(messageId: string): Promise<void> {
        try {
            const pool = await sql.connect(this.config);
            await pool.request()
                .input('id_mensaje', sql.Int, parseInt(messageId))
                .query(`
                    UPDATE movil.mensajes
                    SET leido = 1
                    WHERE id_mensaje = @id_mensaje
                `);
        } catch (err) {
            console.error('Error marking message as read:', err);
        }
    }
}

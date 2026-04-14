import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { AuthRepository, User } from '../domain/auth.entity.js';

@Injectable()
export class SqlServerAuthRepository implements AuthRepository {
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

    async validateUser(username: string, pass: string): Promise<User | null> {
        try {
            const secret = this.configService.get<string>('AUTH_SECRET_PHRASE');
            const pool = await sql.connect(this.config);
            const result = await pool.request()
                .input('codigo', sql.Char(7), username)
                .input('password', sql.VarChar(100), pass)
                .input('frase_secreta', sql.VarChar(255), secret)
                .execute('movil.sp_AutenticarUsuario');

            if (result.recordset && result.recordset.length > 0) {
                const userData = result.recordset[0];
                if (userData.RC === '0') {
                    return new User(
                        String(userData.id_usuario),
                        userData.codigo,
                        userData.rol,
                        userData.correo,
                        userData.nombre,
                        userData.dni,
                        userData.celular || 0,
                    );
                }
            }
            return null;
        } catch (err) {
            console.error('Auth SQL Error Details:', err);
            return null;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const pool = await sql.connect(this.config);
            const result = await pool.request()
                .input('email', sql.VarChar, email)
                .query('SELECT TOP 1 id_usuario, codigo FROM movil.usuarios WHERE correo = @email AND estado = 1');

            if (result.recordset && result.recordset.length > 0) {
                const userData = result.recordset[0];
                return new User(
                    String(userData.id_usuario),
                    userData.codigo,
                    userData.rol,
                    userData.correo,
                    userData.nombre,
                    userData.dni,
                    userData.celular || 0,
                );
            }
            return null;
        } catch (err) {
            console.error('Error finding user by email:', err);
            return null;
        }
    }

    async updatePassword(id_usuario: string, newPassword: string): Promise<void> {
        try {
            const secret = this.configService.get<string>('AUTH_SECRET_PHRASE');
            const pool = await sql.connect(this.config);

            // First get the username/codigo for the id_usuario
            const userResult = await pool.request()
                .input('id', sql.Int, parseInt(id_usuario))
                .query('SELECT codigo FROM movil.usuarios WHERE id_usuario = @id');

            if (userResult.recordset.length === 0) throw new Error('Usuario no encontrado');
            const codigo = userResult.recordset[0].codigo;

            await pool.request()
                .input('codigo', sql.Char(7), codigo)
                .input('password', sql.VarChar(100), newPassword)
                .input('frase_secreta', sql.VarChar(255), secret)
                .execute('movil.sp_CambiarPassword');
        } catch (err) {
            console.error('Error updating password:', err);
            throw new Error('No se pudo actualizar la contraseña');
        }
    }

    async updateProfile(codigo: string, dni: string, correo: string, celular: number): Promise<void> {
        try {
            const pool = await sql.connect(this.config);
            const result = await pool.request()
                .input('codigo', sql.Char(7), codigo)
                .input('dni', sql.Char(12), dni)
                .input('correo', sql.VarChar(255), correo)
                .input('celuar', sql.Int, celular) // Matches procedure typo @celuar
                .execute('movil.sp_ActualizarUsuario');

            if (result.recordset && result.recordset.length > 0) {
                if (result.recordset[0].RC !== '0') {
                    throw new Error(result.recordset[0].RCDescription || 'Error al actualizar perfil');
                }
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            throw new Error(err.message || 'No se pudo actualizar el perfil');
        }
    }
}

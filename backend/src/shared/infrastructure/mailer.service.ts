import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: this.configService.get<boolean>('MAIL_SECURE', false),
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
        });
    }

    async sendRegistrationEmail(data: any, files: Express.Multer.File[]) {
        const mailOptions = {
            from: `"SAT-MOVIL" <${this.configService.get<string>('MAIL_USER')}>`,
            to: 'saticamovil@satica.gob.pe',
            subject: 'Nueva Solicitud de Registro - SAT MOVIL',
            text: `
                Nueva solicitud de registro recibida:
                
                Nombres: ${data.nombres}
                Apellidos: ${data.apellidos}
                DNI: ${data.dni}
                Código de Contribuyente: ${data.codigoContribuyente}
                
                Correo Electrónico: ${data.email || 'No proporcionado'}
                Celular: ${data.celular || 'No proporcionado'}
                
                Se adjuntan fotos solicitadas:
                1. Persona con cara ANTERIOR del DNI (Medio cuerpo)
                2. Persona con cara POSTERIOR del DNI (Medio cuerpo)
                3. Copia de DNI (PNG, JPG o PDF)
            `,
            attachments: files.map((file, index) => {
                let filename = file.originalname;
                if (index === 0) filename = 'SELFIE_DNI_ANTERIOR.jpg';
                else if (index === 1) filename = 'SELFIE_DNI_POSTERIOR.jpg';
                else if (index === 2) {
                    const ext = file.originalname.split('.').pop();
                    filename = `COPIA_DNI.${ext}`;
                }
                return {
                    filename: filename,
                    content: file.buffer,
                };
            }),
        };

        return await this.transporter.sendMail(mailOptions);
    }

    async sendResetCodeEmail(email: string, code: string) {
        const mailOptions = {
            from: `"SAT-MOVIL" <${this.configService.get<string>('MAIL_USER')}>`,
            to: email,
            subject: 'Código de Recuperación de Contraseña - SAT MOVIL',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #005696;">Recuperación de Contraseña</h2>
                    <p>Has solicitado restablecer tu contraseña en la aplicación <b>SAT-ICA MOVIL</b>.</p>
                    <p>Usa el siguiente código de verificación:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #005696; margin: 20px 0;">
                        ${code}
                    </div>
                    <p>Este código expirará en 15 minutos.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777;">Servicio de Administración Tributaria de Ica</p>
                </div>
            `,
        };

        return await this.transporter.sendMail(mailOptions);
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            return { success: true, message: 'SMTP connection verified successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async sendSupportEmail(data: any, files: Express.Multer.File[], user: any) {
        const mailOptions = {
            from: `"SAT-MOVIL Soporte" <${this.configService.get<string>('MAIL_USER')}>`,
            to: 'saticamovil@satica.gob.pe',
            subject: `Soporte: ${data.asunto} - ${user.username}`,
            text: `
                Nuevo mensaje de soporte recibido de la App:

                Usuario: ${user.username}
                DNI: ${user.dni}
                Asunto: ${data.asunto}

                Mensaje:
                ${data.mensaje}
            `,
            attachments: files.map(file => ({
                filename: file.originalname,
                content: file.buffer,
            })),
        };

        return await this.transporter.sendMail(mailOptions);
    }
}

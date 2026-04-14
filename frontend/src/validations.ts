import { z } from 'zod';

export const DebtQuerySchema = z.object({
    codigo: z.string().min(1, 'El código es requerido'),
    anio: z.string().regex(/^\d{4}$/, 'Año debe ser de 4 dígitos'),
    tributo: z.string().min(1, 'El tributo es requerido'),
});

export type DebtQuery = z.infer<typeof DebtQuerySchema>;

export const LoginSchema = z.object({
    username: z.string().min(1, 'Usuario es requerido'),
    password: z.string().min(1, 'Contraseña es requerida'),
});

export type Login = z.infer<typeof LoginSchema>;

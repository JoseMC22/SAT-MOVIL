export class User {
    constructor(
        public readonly id_usuario: string,
        public readonly codigo: string,
        public readonly rol: string,
        public readonly correo: string,
        public readonly nombre: string,
        public readonly dni: string,
        public readonly celular?: number,
    ) { }
}

export interface AuthRepository {
    validateUser(username: string, pass: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    updatePassword(id_usuario: string, newPassword: string): Promise<void>;
    updateProfile(codigo: string, dni: string, correo: string, celular: number): Promise<void>;
}

import axios from 'axios';
import { Platform } from 'react-native';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
});

export const authService = {
    login: async (username: string, pass: string) => {
        const response = await api.post('/auth/login', { username, password: pass });
        return response.data;
    },
    logout: async (token: string) => {
        const response = await api.post('/auth/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    register: async (data: {
        nombres: string,
        apellidos: string,
        dni: string,
        codigoContribuyente: string,
        email: string,
        celular: string,
        selfieFrontUri: string,
        selfieBackUri: string,
        dniCopyUri: string
    }) => {
        const formData = new FormData();
        formData.append('nombres', data.nombres);
        formData.append('apellidos', data.apellidos);
        formData.append('dni', data.dni);
        formData.append('codigoContribuyente', data.codigoContribuyente);
        formData.append('email', data.email || '');
        formData.append('celular', data.celular || '');

        const appendFile = async (uri: string, name: string) => {
            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                const blob = await response.blob();
                formData.append('files', blob, name);
            } else {
                // @ts-ignore
                const filename = uri.split('/').pop() || name;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                // For PDF support, check the extension
                const isPdf = filename.toLowerCase().endsWith('.pdf');

                // @ts-ignore
                formData.append('files', {
                    uri: uri,
                    type: isPdf ? 'application/pdf' : type,
                    name: filename,
                });
            }
        };

        await appendFile(data.selfieFrontUri, 'selfie_front.jpg');
        await appendFile(data.selfieBackUri, 'selfie_back.jpg');
        await appendFile(data.dniCopyUri, 'dni_copy');

        const response = await api.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    requestResetCode: async (email: string) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    resetPassword: async (email: string, code: string, newPassword: string) => {
        const response = await api.post('/auth/reset-password', { email, code, newPassword });
        return response.data;
    },
    changePassword: async (currentPassword: string, newPassword: string, token: string) => {
        const response = await api.post('/auth/change-password', 
            { currentPassword, newPassword },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },
    updateProfile: async (data: { dni: string, correo: string, celular: string }, token: string) => {
        const response = await api.put('/auth/profile', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
};

export const debtService = {
    getDebt: async (codigo: string, anno: string, tipo: string, predio: string, token: string) => {
        const response = await api.get('/debt/consult', {
            params: { codigo, anno, tipo, predio },
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
    getSubOptions: async (codigo: string, anno: string, tipo: string, token: string) => {
        const response = await api.get('/debt/sub-options', {
            params: { codigo, anno, tipo },
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};

export const papeletaService = {
    getPapeletas: async (params: { anno?: string, placa?: string, dni?: string, nroPapeleta?: string }, token: string) => {
        const response = await api.get('/papeleta/consult', {
            params: params,
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};

export const messageService = {
    getMyMessages: async (token: string) => {
        const response = await api.get('/messages', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
    downloadAttachment: async (attachmentId: string, token: string) => {
        const response = await api.get(`/messages/download/${attachmentId}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
        });
        return response.data;
    },
    getUnreadCount: async (token: string) => {
        const response = await api.get('/messages/unread-count', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data; // { count: number }
    },
    markAsRead: async (messageId: string, token: string) => {
        const response = await api.patch(`/messages/${messageId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};

export const tramiteService = {
    getMyTramites: async (token: string) => {
        const response = await api.get('/tramite', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};

export default api;

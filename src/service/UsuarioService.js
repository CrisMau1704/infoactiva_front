// src/service/UsuarioService.js
import { apiRequest, buildQuery } from './ApiService';

export const UsuarioService = {
    getUsuarios(params = {}) {
        return apiRequest(`/usuarios${buildQuery(params)}`);
    },

    getUsuario(id) {
        return apiRequest(`/usuarios/${id}`);
    },

    createUsuario(data) {
        return apiRequest('/usuarios', { method: 'POST', body: data });
    },

    updateUsuario(id, data) {
        return apiRequest(`/usuarios/${id}`, { method: 'PUT', body: data });
    },

    deleteUsuario(id) {
        return apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
    },

    // 👇 NUEVO — usa tu ApiService, sin axios
    getRoles() {
        return apiRequest('/roles');
    },

    async getCatalogos() {
        const roles = await this.getRoles();
        return {
            data: {
                roles: roles.data ?? [],
                regionales: [],   // cuando tengas el endpoint, los agregas
                almacenes: [],    // idem
            },
        };
    },
};
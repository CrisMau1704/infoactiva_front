// src/service/UsuarioService.js
import { apiRequest, buildQuery } from './ApiService';

function limpiar(params) {
    return Object.fromEntries(Object.entries(params).filter(([, valor]) => valor !== null && valor !== undefined && valor !== ''));
}

export const UsuarioService = {
    getUsuarios(params = {}) {
        return apiRequest(`/usuarios${buildQuery(params)}`);
    },
 
    
    getCatalogos() {
        return apiRequest('/catalogos/usuarios');
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
 
    // El backend cambia el estado a inactivo y cierra sus sesiones
    desactivarUsuario(id) {
        return apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
    },
};
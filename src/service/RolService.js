import { apiRequest } from './ApiService';

export const RolService = {
    getRoles() {
        return apiRequest('/roles');
    },

    getRol(id) {
        return apiRequest(`/roles/${id}`);
    },

    createRol(data) {
        return apiRequest('/roles', {
            method: 'POST',
            body: data,
        });
    },

    updateRol(id, data) {
        return apiRequest(`/roles/${id}`, {
            method: 'PUT',
            body: data,
        });
    },

    deleteRol(id) {
        return apiRequest(`/roles/${id}`, {
            method: 'DELETE',
        });
    },

    getPermisos() {
        return apiRequest('/permisos');
    },

    
    syncPermisos(id, permisos) {
        return apiRequest(`/roles/${id}/permisos`, {
            method: 'PUT',
            body: { permisos },
        });
    },
};
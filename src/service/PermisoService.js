
import { apiRequest } from './ApiService';

export const PermisoService = {

    getPermisos() {
        return apiRequest('/permisos');
    },

    createPermiso(data) {
        return apiRequest('/permisos', { method: 'POST', body: data });
    },


    updatePermiso(id, data) {
        return apiRequest(`/permisos/${id}`, { method: 'PUT', body: data });
    },

    deletePermiso(id) {
        return apiRequest(`/permisos/${id}`, { method: 'DELETE' });
    },
};
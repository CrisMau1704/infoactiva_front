
import { apiRequest, buildQuery } from './ApiService';

export const RegionalService = {
    /**
     * Listar regionales con búsqueda, paginación y ordenamiento
     * @param {object} params - { page, por_pagina, buscar, estado, ordenar_por, direccion }
     */
    getRegionales(params = {}) {
        return apiRequest(`/regionales${buildQuery(params)}`);
    },

    /**
     * Obtener un regional por ID
     */
    getRegional(id) {
        return apiRequest(`/regionales/${id}`);
    },

    /**
     * Crear un regional
     */
    createRegional(data) {
        return apiRequest('/regionales', {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Actualizar un regional
     */
    updateRegional(id, data) {
        return apiRequest(`/regionales/${id}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Eliminar un regional
     */
    deleteRegional(id) {
        return apiRequest(`/regionales/${id}`, {
            method: 'DELETE',
        });
    },
};
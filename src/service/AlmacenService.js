
import { apiRequest, buildQuery } from './ApiService';

export const AlmacenService = {
    /**
     * Listar almacenes con búsqueda, paginación y ordenamiento
     * @param {object} params - { page, por_pagina, buscar, estado, ordenar_por, direccion }
     */
    getAlmacenes(params = {}) {
        return apiRequest(`/almacenes${buildQuery(params)}`);
    },

    getCatalogos() {
        return apiRequest('/catalogos/almacenes');
    },

    /**
     * Obtener un almacen por ID
     */
    getAlmacen(id) {
        return apiRequest(`/almacenes/${id}`);
    },

    /**
     * Crear un almacen
     */
    createAlmacen(data) {
        return apiRequest('/almacenes', {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Actualizar un almacen
     */
    updateAlmacen(id, data) {
        return apiRequest(`/almacenes/${id}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Eliminar un almacen
     */
    deleteAlmacen(id) {
        return apiRequest(`/almacenes/${id}`, {
            method: 'DELETE',
        });
    },
};
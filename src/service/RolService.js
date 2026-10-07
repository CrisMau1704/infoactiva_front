// src/service/ClienteService.js
import { apiRequest, buildQuery } from './ApiService';

export const RolService = {
    /**
     * Listar roles con búsqueda, paginación y ordenamiento
     * @param {object} params - { page, por_pagina, buscar, estado, ordenar_por, direccion }
     */
    getRoles(params = {}) {
        return apiRequest(`/roles${buildQuery(params)}`);
    },

    /**
     * Obtener un rol por ID
     */
    getRol(id) {
        return apiRequest(`/roles/${id}`);
    },

    /**
     * Crear un rol
     */
    createRol(data) {
        return apiRequest('/roles', {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Actualizar un rol
     */
    updateRol(id, data) {
        return apiRequest(`/roles/${id}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Eliminar un rol
     */
    deleteRol(id) {
        return apiRequest(`/roles/${id}`, {
            method: 'DELETE',
        });
    },
};
// src/service/ClienteService.js
import { apiRequest, buildQuery } from './ApiService';

export const ClienteService = {
    /**
     * Listar clientes con búsqueda, paginación y ordenamiento
     * @param {object} params - { page, por_pagina, buscar, estado, ordenar_por, direccion }
     */
    getClientes(params = {}) {
        return apiRequest(`/clientes${buildQuery(params)}`);
    },

    /**
     * Obtener un cliente por ID
     */
    getCliente(id) {
        return apiRequest(`/clientes/${id}`);
    },

    /**
     * Crear un cliente
     */
    createCliente(data) {
        return apiRequest('/clientes', {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Actualizar un cliente
     */
    updateCliente(id, data) {
        return apiRequest(`/clientes/${id}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Eliminar un cliente
     */
    deleteCliente(id) {
        return apiRequest(`/clientes/${id}`, {
            method: 'DELETE',
        });
    },
};
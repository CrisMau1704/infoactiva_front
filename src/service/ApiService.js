// src/service/ApiService.js

/**const API_URL = 'http://127.0.0.1:8000/api';*/
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Realiza una petición HTTP a la API
 * Maneja automáticamente: token, headers, errores 401, errores 422
 * @param {string} endpoint - Ej: '/clientes', '/clientes/1'
 * @param {object} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise<object>} - Datos JSON de la respuesta
 */
export async function apiRequest(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');

    const config = {
        headers: {
            'Accept': 'application/json',
            ...(options.body && { 'Content-Type': 'application/json' }),
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...(options.headers || {}),
        },
        ...options,
    };

    // Si el body viene como objeto, convertirlo a JSON
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    // 🔴 Token expirado o inválido: limpiar y redirigir al login
    if (response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('permisos');

        if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
        }
        throw { status: 401, message: 'Sesión expirada' };
    }

    // Parsear la respuesta
    let data;
    try {
        data = await response.json();
    } catch {
        data = {};
    }

    // 🔴 Error de validación o servidor
    if (!response.ok) {
        throw { status: response.status, ...data };
    }

    return data;
}

/**
 * Helper para construir query strings desde un objeto
 * Ej: { page: 1, buscar: 'banco' } → '?page=1&buscar=banco'
 */
export function buildQuery(params = {}) {
    // Filtra valores null, undefined o string vacíos
    const clean = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );
    const query = new URLSearchParams(clean).toString();
    return query ? `?${query}` : '';
}

/**
 * Atajos HTTP para no escribir el method cada vez
 */
export const Api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),

    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),

    patch: (endpoint, body) => apiRequest(endpoint, { method: 'PATCH', body }),

    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
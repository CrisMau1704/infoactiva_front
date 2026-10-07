import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    // ========================================
    // ESTADO: Datos que se guardan en memoria
    // ========================================
    state: () => ({
        // Usuario logueado (id, nombre, email, rol)
        user: JSON.parse(sessionStorage.getItem('user') || 'null'),

        // Token de Sanctum para autenticar peticiones
        token: sessionStorage.getItem('token') || null,

        // Array de permisos: ['clientes.ver', 'clientes.crear', ...]
        permisos: JSON.parse(sessionStorage.getItem('permisos') || '[]'),
    }),

    // ========================================
    // GETTERS: Propiedades calculadas
    // ========================================
    getters: {
        // ¿El usuario está logueado?
        estaLogueado: (state) => !!state.token,

        // Nombre del usuario
        nombreUsuario: (state) => state.user?.nombre || '',

        // Email del usuario
        emailUsuario: (state) => state.user?.email || '',

        // Nombre del rol (Administrador, Jefe de Almacén, etc.)
        rolUsuario: (state) => state.user?.rol?.nombre || '',

        // ID del rol
        idRol: (state) => state.user?.rol?.id_rol || null,
    },

    // ========================================
    // ACTIONS: Funciones que modifican el estado
    // ========================================
    actions: {
        /**
         * Guarda los datos de autenticación después del login
         * Se usa en Login.vue
         */
        setAuth(user, token, permisos) {
            this.user = user;
            this.token = token;
            this.permisos = permisos;

            // Persistir en sessionStorage (sobrevive recargas)
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('permisos', JSON.stringify(permisos));
        },

        /**
         * Limpia los datos de autenticación (logout)
         */
        logout() {
            this.user = null;
            this.token = null;
            this.permisos = [];

            sessionStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('permisos');
        },

        /**
         * Verifica si el usuario tiene un permiso específico
         * Uso: auth.tienePermiso('clientes.crear')
         */
        tienePermiso(codigo) {
            return this.permisos.includes(codigo);
        },

        /**
         * Verifica si tiene AL MENOS UNO de los permisos de la lista
         * Uso: auth.tieneAlgunPermiso(['clientes.ver', 'clientes.crear'])
         */
        tieneAlgunPermiso(codigos) {
            return codigos.some((c) => this.permisos.includes(c));
        },
    },
});
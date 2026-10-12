import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // ========================================
        // RUTAS PÚBLICAS (sin sesión)
        // ========================================
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/auth/Login.vue'),
            meta: { publica: true }
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/auth/Acceso.vue'),
            meta: { publica: true }
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue'),
            meta: { publica: true }
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta: { publica: true }
        },

        // ========================================
        // RUTAS PROTEGIDAS (requieren sesión)
        // ========================================
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },

                // --- Clientes ---
                {
                    path: '/clientes/clientes',
                    name: 'clientes',
                    component: () => import('@/views/clientes/Clientes.vue'),
                    meta: { permiso: 'clientes.ver' }
                },
                {
                    path: '/clientes/stock',
                    name: 'stock',
                    component: () => import('@/views/clientes/Stock.vue')
                    // Cuando tengas el permiso: meta: { permiso: 'stock.ver' }
                },

                // --- Configuración ---
                

                {
                    path: '/configuracion/usuarios',
                    name: 'usuarios',
                    component: () => import('@/views/configuracion/Usuario.vue'),
                    meta: { permiso: 'usuarios.ver' }
                },
                {
                    path: '/configuracion/roles',
                    name: 'roles',
                    component: () => import('@/views/configuracion/Roles.vue'),
                    meta: { permiso: 'roles.ver' }
                },
                {
                    path: '/configuracion/permisos',
                    name: 'permisos',
                    component: () => import('@/views/configuracion/Permisos.vue'),
                    meta: { permiso: 'permisos.ver' }
                },
                {
                    path: '/configuracion/regionales',
                    name: 'regionales',
                    component: () => import('@/views/configuracion/Regionales.vue'),
                    meta: { permiso: 'regionales.ver' }
                },
                {
                    path: '/configuracion/almacenes',
                    name: 'almacenes',
                    component: () => import('@/views/configuracion/Almacenes.vue'),
                    meta: { permiso: 'almacenes.ver' }
                },

                // --- Plantilla Sakai (borrar al terminar el desarrollo) ---
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },
                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/blocks/free',
                    name: 'blocks',
                    meta: {
                        breadcrumb: ['Prime Blocks', 'Free Blocks']
                    },
                    component: () => import('@/views/utilities/Blocks.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/start/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                }
            ]
        },

        // Cualquier URL inexistente va a "no encontrado"
        {
            path: '/:pathMatch(.*)*',
            redirect: { name: 'notfound' }
        }
    ]
});

// ========================================
// GUARD: control de sesión y permisos
// ========================================
router.beforeEach((to) => {
    const auth = useAuthStore();

    // Con sesión iniciada, no volver al login
    if (to.name === 'login' && auth.estaLogueado) {
        return { path: '/' };
    }

    // Rutas públicas: login, acceso denegado, landing, no encontrado
    if (to.meta.publica) return true;

    // Rutas protegidas sin sesión: al login
    const requiereSesion = to.matched.some((r) => r.meta.requiresAuth);
    if (requiereSesion && !auth.estaLogueado) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }

    // Ruta con permiso requerido
    if (to.meta.permiso && !auth.tienePermiso(to.meta.permiso)) {
        return { name: 'accessDenied' };
    }

    return true;
});

export default router;
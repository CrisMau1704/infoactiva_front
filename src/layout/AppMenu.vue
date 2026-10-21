
<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const auth = useAuthStore();

// ============================================
// MENÚ COMPLETO INFOACTIVA + PRIMEVUE SAKAI
// ============================================

const model = ref([
    {
        label: 'Inicio',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                to: '/',
                permiso: 'dashboard.ver'
            }
        ]
    },
    {
        label: 'Operaciones',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Stock de Cajas',
                icon: 'pi pi-fw pi-box',
                to: '/operaciones/stock',
                permiso: 'stock.ver'
            },
            {
                label: 'Salida de Cajas',
                icon: 'pi pi-fw pi-sign-out',
                to: '/operaciones/guias-salida',
                permiso: 'guias_salida.ver'
            },
            {
                label: 'Ingreso de Cajas',
                icon: 'pi pi-fw pi-sign-in',
                to: '/operaciones/guias-ingreso',
                permiso: 'guias_ingreso.ver'
            },
            {
                label: 'Cajas',
                icon: 'pi pi-fw pi-inbox',
                to: '/operaciones/cajas',
                permiso: 'cajas.ver'
            },
            {
                label: 'Ubicaciones',
                icon: 'pi pi-fw pi-map-marker',
                to: '/operaciones/ubicaciones',
                permiso: 'ubicaciones.ver'
            }
        ]
    },
    {
        label: 'Clientes',
        icon: 'pi pi-fw pi-users',
        items: [
            {
                label: 'Clientes',
                icon: 'pi pi-fw pi-briefcase',
                to: '/clientes/clientes',
                permiso: 'clientes.ver'
            },
            {
                label: 'Áreas de Cliente',
                icon: 'pi pi-fw pi-sitemap',
                to: '/clientes/areas',
                permiso: 'areas.ver'
            }
        ]
    },
    {
        label: 'Reportes',
        icon: 'pi pi-fw pi-chart-line',
        items: [
            {
                label: 'Stock por Cliente',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/reportes/stock',
                permiso: 'reportes.stock'
            },
            {
                label: 'Movimientos de Cajas',
                icon: 'pi pi-fw pi-chart-line',
                to: '/reportes/movimientos',
                permiso: 'reportes.movimientos'
            },
            {
                label: 'Ubicación de Cajas',
                icon: 'pi pi-fw pi-table',
                to: '/reportes/ubicaciones',
                permiso: 'reportes.ubicaciones'
            }
        ]
    },
    {
        label: 'Configuración',
        icon: 'pi pi-fw pi-cog',
        items: [
            {
                label: 'Usuarios',
                icon: 'pi pi-fw pi-user',
                to: '/configuracion/usuarios',
                permiso: 'usuarios.ver'
            },
            {
                label: 'Roles',
                icon: 'pi pi-fw pi-id-card',
                to: '/configuracion/roles',
                permiso: 'roles.ver'
            },
            {
                label: 'Permisos',
                icon: 'pi pi-fw pi-key',
                to: '/configuracion/permisos',
                permiso: 'permisos.ver'
            },
            {
                label: 'Regionales',
                icon: 'pi pi-fw pi-map',
                to: '/configuracion/regionales',
                permiso: 'regionales.ver'
            },
            {
                label: 'Almacenes',
                icon: 'pi pi-fw pi-building',
                to: '/configuracion/almacenes',
                permiso: 'almacenes.ver'
            }
        ]
    },

    // ============================================
    // EJEMPLOS ORIGINALES DE PRIMEVUE SAKAI
    // ============================================

    {
        label: 'UI Components',
        path: '/uikit',
        items: [
            {
                label: 'Form Layout',
                icon: 'pi pi-fw pi-id-card',
                to: '/uikit/formlayout'
            },
            {
                label: 'Input',
                icon: 'pi pi-fw pi-check-square',
                to: '/uikit/input'
            },
            {
                label: 'Button',
                icon: 'pi pi-fw pi-mobile',
                to: '/uikit/button',
                class: 'rotated-icon'
            },
            {
                label: 'Table',
                icon: 'pi pi-fw pi-table',
                to: '/uikit/table'
            },
            {
                label: 'List',
                icon: 'pi pi-fw pi-list',
                to: '/uikit/list'
            },
            {
                label: 'Tree',
                icon: 'pi pi-fw pi-share-alt',
                to: '/uikit/tree'
            },
            {
                label: 'Panel',
                icon: 'pi pi-fw pi-tablet',
                to: '/uikit/panel'
            },
            {
                label: 'Overlay',
                icon: 'pi pi-fw pi-clone',
                to: '/uikit/overlay'
            },
            {
                label: 'Media',
                icon: 'pi pi-fw pi-image',
                to: '/uikit/media'
            },
            {
                label: 'Menu',
                icon: 'pi pi-fw pi-bars',
                to: '/uikit/menu'
            },
            {
                label: 'Message',
                icon: 'pi pi-fw pi-comment',
                to: '/uikit/message'
            },
            {
                label: 'File',
                icon: 'pi pi-fw pi-file',
                to: '/uikit/file'
            },
            {
                label: 'Chart',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/uikit/charts'
            },
            {
                label: 'Timeline',
                icon: 'pi pi-fw pi-calendar',
                to: '/uikit/timeline'
            },
            {
                label: 'Misc',
                icon: 'pi pi-fw pi-circle',
                to: '/uikit/misc'
            }
        ]
    },
    {
        label: 'Prime Blocks',
        icon: 'pi pi-fw pi-prime',
        path: '/blocks',
        items: [
            {
                label: 'Free Blocks',
                icon: 'pi pi-fw pi-eye',
                to: '/blocks/free'
            },
            {
                label: 'All Blocks',
                icon: 'pi pi-fw pi-globe',
                url: 'https://blocks.primevue.org/',
                target: '_blank'
            }
        ]
    },
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        path: '/pages',
        items: [
            {
                label: 'Landing',
                icon: 'pi pi-fw pi-globe',
                to: '/landing'
            },
            {
                label: 'Auth',
                icon: 'pi pi-fw pi-user',
                path: '/auth',
                items: [
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/auth/login'
                    },
                    {
                        label: 'Error',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error'
                    },
                    {
                        label: 'Access Denied',
                        icon: 'pi pi-fw pi-lock',
                        to: '/auth/access'
                    }
                ]
            },
            {
                label: 'Crud',
                icon: 'pi pi-fw pi-pencil',
                to: '/pages/crud'
            },
            {
                label: 'Not Found',
                icon: 'pi pi-fw pi-exclamation-circle',
                to: '/pages/notfound'
            },
            {
                label: 'Empty',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/empty'
            }
        ]
    },
    {
        label: 'Hierarchy',
        icon: 'pi pi-fw pi-align-left',
        path: '/hierarchy',
        items: [
            {
                label: 'Submenu 1',
                icon: 'pi pi-fw pi-align-left',
                path: '/submenu_1',
                items: [
                    {
                        label: 'Submenu 1.1',
                        icon: 'pi pi-fw pi-align-left',
                        path: '/submenu_1_1',
                        items: [
                            {
                                label: 'Submenu 1.1.1',
                                icon: 'pi pi-fw pi-align-left'
                            },
                            {
                                label: 'Submenu 1.1.2',
                                icon: 'pi pi-fw pi-align-left'
                            },
                            {
                                label: 'Submenu 1.1.3',
                                icon: 'pi pi-fw pi-align-left'
                            }
                        ]
                    },
                    {
                        label: 'Submenu 1.2',
                        icon: 'pi pi-fw pi-align-left',
                        path: '/submenu_1_2',
                        items: [
                            {
                                label: 'Submenu 1.2.1',
                                icon: 'pi pi-fw pi-align-left'
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Submenu 2',
                icon: 'pi pi-fw pi-align-left',
                path: '/submenu_2',
                items: [
                    {
                        label: 'Submenu 2.1',
                        icon: 'pi pi-fw pi-align-left',
                        path: '/submenu_2_1',
                        items: [
                            {
                                label: 'Submenu 2.1.1',
                                icon: 'pi pi-fw pi-align-left'
                            },
                            {
                                label: 'Submenu 2.1.2',
                                icon: 'pi pi-fw pi-align-left'
                            }
                        ]
                    },
                    {
                        label: 'Submenu 2.2',
                        icon: 'pi pi-fw pi-align-left',
                        path: '/submenu_2_2',
                        items: [
                            {
                                label: 'Submenu 2.2.1',
                                icon: 'pi pi-fw pi-align-left'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        label: 'Get Started',
        path: '/start',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-book',
                to: '/start/documentation'
            },
            {
                label: 'View Source',
                icon: 'pi pi-fw pi-github',
                url: 'https://github.com/primefaces/sakai-vue',
                target: '_blank'
            }
        ]
    }
]);

// ============================================
// FILTRADO DINÁMICO DE MENÚ POR PERMISOS
// ============================================

const gruposInfoactiva = [
    'Inicio',
    'Operaciones',
    'Clientes',
    'Reportes',
    'Configuración'
];

const menuFiltrado = computed(() => {
    return model.value
        .map((grupo) => {

            // Ejemplos Sakai: solo para Administrador
            if (!gruposInfoactiva.includes(grupo.label)) {
                return auth.rolUsuario === 'Administrador'
                    ? grupo
                    : null;
            }

            // Módulos Infoactiva: verificar permisos
            const itemsPermitidos = grupo.items.filter((item) => {
                return auth.tienePermiso(item.permiso);
            });

            return {
                ...grupo,
                items: itemsPermitidos
            };
        })
        .filter((grupo) => {
            return grupo !== null &&
                (
                    !gruposInfoactiva.includes(grupo.label) ||
                    grupo.items.length > 0
                );
        });
});
</script>

<template>
    <ul class="layout-menu">
        <template
            v-for="(item, i) in menuFiltrado"
            :key="item.label"
        >
            <app-menu-item
                v-if="!item.separator"
                :item="item"
                :index="i"
            />

            <li
                v-if="item.separator"
                class="menu-separator"
            ></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>

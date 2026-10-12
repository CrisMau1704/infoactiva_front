<script setup>
import { PermisoService } from '@/service/PermisoService';
import { useAuthStore } from '@/stores/auth';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const auth = useAuthStore();

const permisos = ref([]);
const permiso = ref({});
const permisoDialog = ref(false);
const eliminarDialog = ref(false);
const submitted = ref(false);
const guardando = ref(false);
const loading = ref(false);
const errores = ref({}); // errores de validación que devuelve Laravel (422)

// Búsqueda y filtro: se hacen en el navegador porque son pocos permisos
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const filtroCategoria = ref(null);

// ============================================
// Permisos de pantalla
// ============================================
const puedeCrear = computed(() => auth.tienePermiso('permisos.crear'));
const puedeEditar = computed(() => auth.tienePermiso('permisos.editar'));
const puedeEliminar = computed(() => auth.tienePermiso('permisos.eliminar'));

const esEdicion = computed(() => !!permiso.value.id_permiso);

// Categorías existentes (para el filtro y para el desplegable del formulario)
const categorias = computed(() => [...new Set(permisos.value.map((p) => p.categoria))].sort());

const permisosFiltrados = computed(() => (filtroCategoria.value ? permisos.value.filter((p) => p.categoria === filtroCategoria.value) : permisos.value));

// ============================================
// Cargar datos
// ============================================
async function cargarPermisos() {
    loading.value = true;
    try {
        const response = await PermisoService.getPermisos();
        permisos.value = response.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudieron cargar los permisos', life: 3000 });
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    cargarPermisos();
});

// ============================================
// Formulario: crear / editar
// ============================================
function openNew() {
    permiso.value = { codigo: '', descripcion: '', categoria: null };
    submitted.value = false;
    errores.value = {};
    permisoDialog.value = true;
}

function editPermiso(row) {
    permiso.value = { ...row };
    submitted.value = false;
    errores.value = {};
    permisoDialog.value = true;
}

function hideDialog() {
    permisoDialog.value = false;
    submitted.value = false;
    errores.value = {};
}

// Mensaje bajo cada campo: primero el del frontend, luego el del servidor
function errorCampo(campo, falta = false) {
    if (submitted.value && falta) return 'Este campo es obligatorio';
    return errores.value[campo]?.[0] || '';
}

async function savePermiso() {
    submitted.value = true;
    errores.value = {};

    const p = permiso.value;
    if ((!esEdicion.value && !p.codigo?.trim()) || !p.descripcion?.trim() || !p.categoria?.trim()) {
        return;
    }

    guardando.value = true;
    try {
        if (esEdicion.value) {
            await PermisoService.updatePermiso(p.id_permiso, {
                descripcion: p.descripcion,
                categoria: p.categoria
            });
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Permiso actualizado correctamente', life: 3000 });
        } else {
            await PermisoService.createPermiso({
                codigo: p.codigo.trim().toLowerCase(),
                descripcion: p.descripcion,
                categoria: p.categoria
            });
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Permiso creado correctamente', life: 3000 });
        }

        hideDialog();
        permiso.value = {};
        cargarPermisos();
    } catch (error) {
        if (error.status === 422 && error.errors) {
            errores.value = error.errors;
            toast.add({ severity: 'error', summary: 'Revisa los datos', detail: 'Hay campos con errores', life: 4000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo guardar el permiso', life: 3000 });
        }
    } finally {
        guardando.value = false;
    }
}

// ============================================
// Eliminar
// ============================================
function confirmEliminar(row) {
    permiso.value = row;
    eliminarDialog.value = true;
}

async function eliminarPermiso() {
    try {
        await PermisoService.deletePermiso(permiso.value.id_permiso);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Permiso eliminado correctamente', life: 3000 });
        eliminarDialog.value = false;
        permiso.value = {};
        cargarPermisos();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'No se pudo eliminar', detail: error.message, life: 5000 });
        eliminarDialog.value = false;
    }
}
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Button v-if="puedeCrear" label="Nuevo permiso" icon="pi pi-plus" class="mr-2" @click="openNew" />
            </template>
        </Toolbar>

        <DataTable
            :value="permisosFiltrados"
            dataKey="id_permiso"
            v-model:filters="filters"
            :globalFilterFields="['codigo', 'descripcion', 'categoria']"
            paginator
            :rows="10"
            :rowsPerPageOptions="[10, 25, 50, 100]"
            :loading="loading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} permisos"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Permisos</h4>
                    <div class="flex flex-wrap gap-2">
                        <Select v-model="filtroCategoria" :options="categorias" placeholder="Todas las categorías" showClear />
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar por código o descripción..." />
                        </IconField>
                    </div>
                </div>
            </template>

            <template #empty>No se encontraron permisos.</template>

            <Column field="codigo" header="Código" sortable style="min-width: 14rem">
                <template #body="{ data }">
                    <code>{{ data.codigo }}</code>
                </template>
            </Column>
            <Column field="descripcion" header="Descripción" sortable style="min-width: 16rem"></Column>
            <Column field="categoria" header="Categoría" sortable style="min-width: 10rem">
                <template #body="{ data }">
                    <Tag :value="data.categoria" severity="secondary" />
                </template>
            </Column>
            <Column field="roles_count" header="Roles" sortable style="min-width: 6rem"></Column>
            <Column :exportable="false" style="min-width: 9rem">
                <template #body="{ data }">
                    <Button v-if="puedeEditar" icon="pi pi-pencil" outlined rounded class="mr-2" v-tooltip.top="'Editar'" @click="editPermiso(data)" />
                    <Button v-if="puedeEliminar" icon="pi pi-trash" outlined rounded severity="danger" v-tooltip.top="'Eliminar'" @click="confirmEliminar(data)" />
                </template>
            </Column>
        </DataTable>

        <!-- Formulario crear / editar -->
        <Dialog v-model:visible="permisoDialog" :style="{ width: '500px' }" :header="esEdicion ? 'Editar permiso' : 'Nuevo permiso'" modal :focusOnShow="false">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="codigo" class="block font-bold mb-2">Código *</label>
                    <InputText id="codigo" v-model.trim="permiso.codigo" :disabled="esEdicion" placeholder="modulo.accion (ej: cajas.ver)" :invalid="!!errorCampo('codigo', !esEdicion && !permiso.codigo)" fluid />
                    <small v-if="errorCampo('codigo', !esEdicion && !permiso.codigo)" class="text-red-500">{{ errorCampo('codigo', !esEdicion && !permiso.codigo) }}</small>
                    <small v-else class="text-muted-color">
                        {{ esEdicion ? 'El código no se puede cambiar porque lo usan las rutas del sistema.' : 'Formato modulo.accion, en minúsculas.' }}
                    </small>
                </div>

                <div>
                    <label for="descripcion" class="block font-bold mb-2">Descripción *</label>
                    <InputText id="descripcion" v-model.trim="permiso.descripcion" :invalid="!!errorCampo('descripcion', !permiso.descripcion)" fluid />
                    <small v-if="errorCampo('descripcion', !permiso.descripcion)" class="text-red-500">{{ errorCampo('descripcion', !permiso.descripcion) }}</small>
                </div>

                <div>
                    <label for="categoria" class="block font-bold mb-2">Categoría *</label>
                    <Select id="categoria" v-model="permiso.categoria" :options="categorias" editable placeholder="Elige una o escribe una nueva" :invalid="!!errorCampo('categoria', !permiso.categoria)" fluid />
                    <small v-if="errorCampo('categoria', !permiso.categoria)" class="text-red-500">{{ errorCampo('categoria', !permiso.categoria) }}</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" :loading="guardando" @click="savePermiso" />
            </template>
        </Dialog>

        <!-- Confirmar eliminar -->
        <Dialog v-model:visible="eliminarDialog" :style="{ width: '480px' }" header="Confirmar" modal>
            <div class="flex items-start gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span>
                    ¿Eliminar el permiso <b>{{ permiso.codigo }}</b
                    >?
                    <small class="block text-muted-color mt-2">Si alguna ruta o menú del sistema usa este código, quedará inaccesible para todos.</small>
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="eliminarDialog = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="eliminarPermiso" />
            </template>
        </Dialog>
    </div>
</template>
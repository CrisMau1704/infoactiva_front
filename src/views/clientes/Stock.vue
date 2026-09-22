<script setup>
import { ProductService } from '@/service/ProductService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const products = ref([]);
const selectedProducts = ref([]);
const loading = ref(false);
const submitted = ref(false);

// Producto en edición (para el formulario)
const currentProduct = ref({
    id: null,
    code: '',
    name: '',
    description: '',
    price: null,
    category: '',
    quantity: null,
    inventoryStatus: 'INSTOCK',
    image: 'product-placeholder.svg'
});

// Estado del formulario
const isEditing = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Estados disponibles
const statuses = ref([
    { label: 'DISPONIBLE', value: 'INSTOCK' },
    { label: 'BAJO STOCK', value: 'LOWSTOCK' },
    { label: 'AGOTADO', value: 'OUTOFSTOCK' }
]);

// Categorías disponibles
const categories = ref([
    { label: 'Accesorios', value: 'Accessories' },
    { label: 'Ropa', value: 'Clothing' },
    { label: 'Electrónicos', value: 'Electronics' },
    { label: 'Fitness', value: 'Fitness' }
]);

// Cargar productos
onMounted(() => {
    loading.value = true;
    ProductService.getProducts()
        .then((data) => {
            products.value = data;
            loading.value = false;
        })
        .catch((error) => {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los productos',
                life: 3000
            });
            loading.value = false;
            console.error('Error:', error);
        });
});

// Limpiar formulario
const clearForm = () => {
    currentProduct.value = {
        id: null,
        code: '',
        name: '',
        description: '',
        price: null,
        category: '',
        quantity: null,
        inventoryStatus: 'INSTOCK',
        image: 'product-placeholder.svg'
    };
    isEditing.value = false;
    submitted.value = false;
};

// Guardar producto (crear o actualizar)
const saveProduct = () => {
    submitted.value = true;

    if (!currentProduct.value.name?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'El nombre del producto es requerido',
            life: 3000
        });
        return;
    }

    if (!currentProduct.value.price || currentProduct.value.price <= 0) {
        toast.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Ingrese un precio válido',
            life: 3000
        });
        return;
    }

    if (isEditing.value) {
        // Actualizar producto existente
        const index = products.value.findIndex((p) => p.id === currentProduct.value.id);
        if (index !== -1) {
            products.value[index] = { ...currentProduct.value };
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Producto actualizado correctamente',
                life: 3000
            });
        }
    } else {
        // Crear nuevo producto
        const newProduct = {
            ...currentProduct.value,
            id: Date.now().toString(),
            code: 'P' + Date.now().toString().slice(-6),
            image: 'product-placeholder.svg'
        };
        products.value.unshift(newProduct);
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto creado correctamente',
            life: 3000
        });
    }

    clearForm();
};

// Editar producto (cargar datos en el formulario)
const editProduct = (product) => {
    currentProduct.value = { ...product };
    isEditing.value = true;
    // Scroll al formulario
    document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
};

// Cancelar edición
const cancelEdit = () => {
    clearForm();
};

// Eliminar producto
const deleteProduct = (product) => {
    if (confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
        products.value = products.value.filter((p) => p.id !== product.id);
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto eliminado correctamente',
            life: 3000
        });
    }
};

// Eliminar productos seleccionados
const deleteSelectedProducts = () => {
    if (!selectedProducts.value?.length) return;

    if (confirm(`¿Está seguro de eliminar ${selectedProducts.value.length} productos?`)) {
        const idsToDelete = new Set(selectedProducts.value.map((p) => p.id));
        products.value = products.value.filter((p) => !idsToDelete.has(p.id));
        selectedProducts.value = [];
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Productos eliminados correctamente',
            life: 3000
        });
    }
};

// Exportar a CSV
const exportCSV = () => {
    dt.value?.exportCSV();
};

// Formatear moneda
const formatCurrency = (value) => {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return '$0.00';
};

// Obtener etiqueta de estado
const getStatusLabel = (status) => {
    switch (status) {
        case 'INSTOCK':
            return 'success';
        case 'LOWSTOCK':
            return 'warn';
        case 'OUTOFSTOCK':
            return 'danger';
        default:
            return 'info';
    }
};

// Obtener texto de estado
const getStatusText = (status) => {
    switch (status) {
        case 'INSTOCK':
            return 'DISPONIBLE';
        case 'LOWSTOCK':
            return 'BAJO STOCK';
        case 'OUTOFSTOCK':
            return 'AGOTADO';
        default:
            return status;
    }
};

// Calcular total de productos
const totalProducts = computed(() => products.value.length);
</script>

<template>
    <div>
        <!-- FORMULARIO EN LÍNEA -->
        <div class="card form-container">
            <div class="flex justify-content-between align-items-center mb-4">
                <h3 class="text-2xl font-bold m-0">
                    {{ isEditing ? '✏️ Editar Producto' : 'Nueva compra de cajas' }}
                </h3>
                <Button v-if="isEditing" label="Cancelar" icon="pi pi-times" severity="secondary" text @click="cancelEdit" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Nombre -->
                <div>
                    <label for="name" class="block font-bold mb-2"> Nombre <span class="text-red-500">*</span> </label>
                    <InputText id="name" v-model.trim="currentProduct.name" placeholder="Ej: Bamboo Watch" fluid :invalid="submitted && !currentProduct.name" />
                    <small v-if="submitted && !currentProduct.name" class="text-red-500"> El nombre es requerido </small>
                </div>

                <!-- Precio -->
                <div>
                    <label for="price" class="block font-bold mb-2"> Precio (USD) <span class="text-red-500">*</span> </label>
                    <InputNumber id="price" v-model="currentProduct.price" placeholder="Ej: 65.00" fluid mode="currency" currency="USD" locale="en-US" :invalid="submitted && (!currentProduct.price || currentProduct.price <= 0)" />
                    <small v-if="submitted && (!currentProduct.price || currentProduct.price <= 0)" class="text-red-500"> Ingrese un precio válido </small>
                </div>

                <!-- Categoría -->
                <div>
                    <label for="category" class="block font-bold mb-2">Categoría</label>
                    <Select id="category" v-model="currentProduct.category" :options="categories" optionLabel="label" optionValue="value" placeholder="Seleccionar categoría" fluid showClear />
                </div>

                <!-- Cantidad -->
                <div>
                    <label for="quantity" class="block font-bold mb-2">Cantidad</label>
                    <InputNumber id="quantity" v-model="currentProduct.quantity" placeholder="Ej: 24" fluid integeronly :min="0" />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <!-- Descripción -->
                <div class="md:col-span-2">
                    <label for="description" class="block font-bold mb-2">Descripción</label>
                    <Textarea id="description" v-model="currentProduct.description" rows="2" placeholder="Descripción del producto..." fluid />
                </div>

                <!-- Estado -->
                <div>
                    <label for="inventoryStatus" class="block font-bold mb-2">Estado de Inventario</label>
                    <Select id="inventoryStatus" v-model="currentProduct.inventoryStatus" :options="statuses" optionLabel="label" optionValue="value" placeholder="Seleccionar estado" fluid />
                </div>
            </div>

            <!-- Botones de acción del formulario -->
            <div class="flex flex-wrap gap-2 mt-4">
                <Button :label="isEditing ? 'Actualizar Producto' : 'Crear Producto'" :icon="isEditing ? 'pi pi-save' : 'pi pi-plus'" severity="primary" @click="saveProduct" />
                <Button label="Limpiar" icon="pi pi-refresh" severity="secondary" text @click="clearForm" />
                <span v-if="isEditing" class="ml-2 text-sm text-blue-600 font-bold"> Editando: {{ currentProduct.name }} </span>
            </div>
        </div>

        <!-- TABLA DE PRODUCTOS -->
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <span v-if="totalProducts > 0" class="ml-4 text-sm">
                        Total Cajas: <strong>{{ totalProducts }}</strong> productos
                    </span>
                </template>

                <template #end>
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedProducts"
                :value="products"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :loading="loading"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
                emptyMessage="No hay productos disponibles"
                stripedRows
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">📦 Lista de Productos</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar producto..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>

                <Column field="code" header="Código" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.code" severity="info" />
                    </template>
                </Column>

                <Column field="name" header="Nombre" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        <strong>{{ slotProps.data.name }}</strong>
                    </template>
                </Column>

                <Column field="image" header="Imagen" style="min-width: 8rem">
                    <template #body="slotProps">
                        <img
                            :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.image}`"
                            :alt="slotProps.data.image"
                            class="rounded"
                            style="width: 50px; height: 50px; object-fit: cover"
                            @error="(e) => (e.target.src = '/placeholder-image.png')"
                        />
                    </template>
                </Column>

                <Column field="price" header="Precio" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.price) }}
                    </template>
                </Column>

                <Column field="category" header="Categoría" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.category" severity="secondary" />
                    </template>
                </Column>

                <Column field="rating" header="Rating" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <Rating :modelValue="slotProps.data.rating" :readonly="true" :stars="5" />
                    </template>
                </Column>

                <Column field="inventoryStatus" header="Estado" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <Tag :value="getStatusText(slotProps.data.inventoryStatus)" :severity="getStatusLabel(slotProps.data.inventoryStatus)" />
                    </template>
                </Column>

                <Column field="quantity" header="Cantidad" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        <span :class="slotProps.data.quantity === 0 ? 'text-red-500 font-bold' : ''">
                            {{ slotProps.data.quantity }}
                        </span>
                    </template>
                </Column>

                <Column :exportable="false" style="min-width: 10rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" tooltip="Editar producto" tooltipOptions="top" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteProduct(slotProps.data)" tooltip="Eliminar producto" tooltipOptions="top" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<style scoped></style>

import { supabase } from './supabase.js';

// --- Elementos del DOM ---
const addModal = document.getElementById('addModal');
const editModal = document.getElementById('editModal');
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
const clearFilterBtn = document.getElementById('clearFilter');
const familyButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.family-btn'));
const cards = Array.from(document.querySelectorAll<HTMLElement>('.inventory-card'));
let currentEditId: string | null = null;
let currentFamilyFilter: string | null = null;

const applyFilters = () => {
  const searchTerm = searchInput?.value.trim().toLowerCase() || '';

  cards.forEach((card) => {
    const modelo = (card.dataset.modelo || '').toLowerCase();
    const familia = (card.dataset.family || '').toLowerCase();

    const matchesSearch =
      !searchTerm ||
      modelo.includes(searchTerm) ||
      familia.includes(searchTerm);

    const matchesFamily =
      !currentFamilyFilter ||
      currentFamilyFilter === 'all' ||
      familia === currentFamilyFilter.toLowerCase();

    card.style.display = matchesSearch && matchesFamily ? '' : 'none';
  });
};

const setFamilyFilter = (family: string | null) => {
  currentFamilyFilter = family;

  familyButtons.forEach((btn) => {
    const isActive = family && btn.dataset.family?.toLowerCase() === family.toLowerCase();
    btn.classList.toggle('bg-orange-50', isActive);
    btn.classList.toggle('border-orange-300', isActive);
  });

  applyFilters();
};

const resetFilters = () => {
  if (searchInput) searchInput.value = '';
  setFamilyFilter('all');
};

// --- Buscador ---
searchInput?.addEventListener('input', () => applyFilters());
searchInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchInput?.blur();
  }
});

// --- Filtros por familia ---
familyButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const family = btn.dataset.family || 'all';
    setFamilyFilter(family);
  });
});

clearFilterBtn?.addEventListener('click', () => resetFilters());

// Inicializar filtros al cargar
resetFilters();

// --- Lógica de Abrir/Cerrar Modales ---
document.getElementById('btnOpenAddModal')?.addEventListener('click', () =>
  addModal?.classList.remove('hidden')
);
document.getElementById('closeAddModal')?.addEventListener('click', () =>
  addModal?.classList.add('hidden')
);
document.getElementById('closeEditModal')?.addEventListener('click', () =>
  editModal?.classList.add('hidden')
);
document.getElementById('btnCancelDelete')?.addEventListener('click', () =>
  deleteConfirmModal?.classList.add('hidden')
);

// --- Previsualización de Imágenes ---
const handleImagePreview = (inputId: string, previewId: string) => {
  const fileInput = document.getElementById(inputId) as HTMLInputElement | null;
  const previewImg = document.getElementById(previewId) as HTMLImageElement | null;

  fileInput?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && previewImg) {
      previewImg.src = URL.createObjectURL(file);
    }
  });
};

handleImagePreview('addProductImage', 'addImagePreview');
handleImagePreview('editProductImage', 'editImagePreview');

// --- Formateador de Moneda Automático ---
const formatearMoneda = (inputElement: HTMLInputElement) => {
  inputElement.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    // Quitamos todo lo que no sea número
    let valor = target.value.replace(/\D/g, '');
    // Le agregamos puntos de miles si hay algún número
    if (valor !== '') {
      valor = parseInt(valor, 10).toLocaleString('es-CO');
    }
    target.value = valor;
  });
};

// Aplicar el formateador a todos los inputs con la clase 'price-input'
document.querySelectorAll<HTMLInputElement>('.price-input').forEach((input) => formatearMoneda(input));

// Función Helper para convertir el formato visual "1.500.000" a un número real para la Base de Datos
const limpiarPrecio = (valorConFormato: string) => {
  if (!valorConFormato) return 0;
  return parseInt(valorConFormato.replace(/\./g, ''), 10);
};

// --- Abrir Editar al clickear tarjeta ---
cards.forEach((card) => {
  card.addEventListener('click', (e) => {
    const targetCard = e.currentTarget as HTMLElement;
    currentEditId = targetCard.dataset.id || null;

    const idText = document.getElementById('editProductIdText');
    if (idText && currentEditId) idText.innerText = currentEditId.slice(-6);

    (document.getElementById('editModelo') as HTMLInputElement).value =
      targetCard.dataset.modelo || '';
    (document.getElementById('editFamiliaId') as HTMLSelectElement).value =
      targetCard.dataset.familiaId || '';
    const venta = parseInt(targetCard.dataset.venta || '0', 10);
    const costo = parseInt(targetCard.dataset.costo || '0', 10);

    (document.getElementById('editPrecioVenta') as HTMLInputElement).value =
      venta.toLocaleString('es-CO');
    (document.getElementById('editPrecioCosto') as HTMLInputElement).value =
      costo.toLocaleString('es-CO');
    (document.getElementById('editStockActual') as HTMLInputElement).value =
      targetCard.dataset.stock || '';

    const imgUrl =
      targetCard.dataset.imagen || 'https://placehold.co/400x400?text=Sin+Imagen';
    (document.getElementById('editImagePreview') as HTMLImageElement).src = imgUrl;
    (document.getElementById('editProductOriginalImage') as HTMLInputElement).value =
      imgUrl;

    editModal?.classList.remove('hidden');
  });
});

// --- Función Helper para Subir Imagen ---
async function uploadImage(file: File) {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const { data, error } = await supabase.storage
    .from('imagenes-productos')
    .upload(fileName, file);
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage
    .from('imagenes-productos')
    .getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}

// --- 1. AGREGAR NUEVO PRODUCTO ---
document.getElementById('btnGuardarNuevo')?.addEventListener('click', async (e) => {
  const btn = e.target as HTMLButtonElement;
  btn.innerText = 'Guardando...';
  btn.disabled = true;

  try {
    let imageUrl = null;
    const fileInput = document.getElementById('addProductImage') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) imageUrl = await uploadImage(file);

    const nuevoProducto = {
      modelo: (document.getElementById('addModelo') as HTMLInputElement).value.trim(),
      familia_id: (document.getElementById('addFamiliaId') as HTMLSelectElement).value,
      precio_venta: limpiarPrecio(
        (document.getElementById('addPrecioVenta') as HTMLInputElement).value
      ),
      precio_costo: limpiarPrecio(
        (document.getElementById('addPrecioCosto') as HTMLInputElement).value
      ),
      stock_actual: parseInt(
        (document.getElementById('addStockActual') as HTMLInputElement).value
      ),
      imagen_especifica: imageUrl,
      visible_en_catalogo: false, // Regla para no afectar web
      activo: true,
    };

    const { error } = await supabase.from('referencias').insert([nuevoProducto]);
    if (error) throw error;
    window.location.reload();
  } catch (err: any) {
    alert('Error al agregar: ' + err.message);
    btn.innerText = '💾 Guardar Producto';
    btn.disabled = false;
  }
});

// --- 2. EDITAR PRODUCTO ---
document.getElementById('btnGuardarCambios')?.addEventListener('click', async (e) => {
  const btn = e.target as HTMLButtonElement;
  btn.innerText = 'Actualizando...';
  btn.disabled = true;

  try {
    let imageUrl = (document.getElementById('editProductOriginalImage') as HTMLInputElement).value;
    const fileInput = document.getElementById('editProductImage') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) imageUrl = await uploadImage(file);

    const productoActualizado = {
      modelo: (document.getElementById('editModelo') as HTMLInputElement).value.trim(),
      familia_id: (document.getElementById('editFamiliaId') as HTMLSelectElement).value,
      precio_venta: limpiarPrecio(
        (document.getElementById('editPrecioVenta') as HTMLInputElement).value
      ),
      precio_costo: limpiarPrecio(
        (document.getElementById('editPrecioCosto') as HTMLInputElement).value
      ),
      stock_actual: parseInt(
        (document.getElementById('editStockActual') as HTMLInputElement).value
      ),
      imagen_especifica: imageUrl,
    };

    const { error } = await supabase
      .from('referencias')
      .update(productoActualizado)
      .eq('id', currentEditId);
    if (error) throw error;
    window.location.reload();
  } catch (err: any) {
    alert('Error al editar: ' + err.message);
    btn.innerText = '💾 Guardar';
    btn.disabled = false;
  }
});

// --- 3. ELIMINAR (Soft Delete) ---
document.getElementById('btnEliminar')?.addEventListener('click', () => {
  deleteConfirmModal?.classList.remove('hidden');
});

document.getElementById('btnConfirmDelete')?.addEventListener('click', async (e) => {
  const btn = e.target as HTMLButtonElement;
  btn.innerText = 'Eliminando...';

  try {
    const { error } = await supabase
      .from('referencias')
      .update({ activo: false })
      .eq('id', currentEditId);
    if (error) throw error;
    window.location.reload();
  } catch (err: any) {
    alert('Error al eliminar: ' + err.message);
    btn.innerText = 'Sí, Eliminar';
  }
});

// pos-client.js - Cliente POS simple y directo
console.log('📝 pos-client.js iniciando...');

if (!window.supabase) {
  console.error('❌ ERROR: Supabase no está disponible. La página debe recargar.');
  throw new Error('Supabase library not loaded');
}

const body = document.body;
const SUPABASE_URL = body.getAttribute('data-supabase-url');
const SUPABASE_ANON_KEY = body.getAttribute('data-supabase-anon-key');

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('✅ Supabase client inicializado');

// --- DOM Elements ---
const addModal = document.getElementById('addModal');
const editModal = document.getElementById('editModal');
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const searchInputs = [
  document.getElementById('searchInput'),
  document.getElementById('inputBuscarInventario'),
].filter(Boolean);
const clearFilterBtn = document.getElementById('clearFilter');
const familyButtons = Array.from(document.querySelectorAll('.family-btn'));
const cards = Array.from(document.querySelectorAll('.inventory-card'));

let currentEditId = null;
let currentFamilyFilter = null;
let currentSearchTerm = '';

// --- Filtros ---
const applyFilters = () => {
  cards.forEach((card) => {
    const modelo = (card.dataset.modelo || '').toLowerCase();
    const familia = (card.dataset.family || '').toLowerCase();

    const matchesSearch = !currentSearchTerm || modelo.includes(currentSearchTerm) || familia.includes(currentSearchTerm);
    const matchesFamily = !currentFamilyFilter || currentFamilyFilter === 'all' || familia === currentFamilyFilter.toLowerCase();

    card.style.display = matchesSearch && matchesFamily ? '' : 'none';
  });
};

const setFamilyFilter = (family) => {
  currentFamilyFilter = family;
  familyButtons.forEach((btn) => {
    const isActive = family && btn.dataset.family?.toLowerCase() === family.toLowerCase();
    btn.classList.toggle('bg-orange-50', isActive);
    btn.classList.toggle('border-orange-300', isActive);
  });
  applyFilters();
};

const resetFilters = () => {
  currentSearchTerm = '';
  searchInputs.forEach((input) => { input.value = ''; });
  setFamilyFilter('all');
};

// --- Search ---
searchInputs.forEach((input) => {
  input.addEventListener('input', () => {
    currentSearchTerm = input.value.trim().toLowerCase();
    searchInputs.forEach((other) => { if (other !== input) other.value = input.value; });
    applyFilters();
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
});

// --- Family Filters ---
familyButtons.forEach((btn) => {
  btn.addEventListener('click', () => setFamilyFilter(btn.dataset.family || 'all'));
});
clearFilterBtn?.addEventListener('click', resetFilters);
resetFilters();

// --- Modals ---
(document.getElementById('btnNuevoRepuesto') || document.getElementById('btnOpenAddModal'))?.addEventListener('click', () => addModal?.classList.remove('hidden'));
document.getElementById('closeAddModal')?.addEventListener('click', () => addModal?.classList.add('hidden'));
document.getElementById('closeEditModal')?.addEventListener('click', () => editModal?.classList.add('hidden'));
document.getElementById('btnCancelDelete')?.addEventListener('click', () => deleteConfirmModal?.classList.add('hidden'));

// --- Image Preview ---
const handleImagePreview = (inputId, previewId) => {
  const fileInput = document.getElementById(inputId);
  const previewImg = document.getElementById(previewId);
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file && previewImg) previewImg.src = URL.createObjectURL(file);
  });
};
handleImagePreview('addProductImage', 'addImagePreview');
handleImagePreview('editProductImage', 'editImagePreview');

// --- Currency Formatter ---
const formatearMoneda = (input) => {
  input.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor) valor = parseInt(valor, 10).toLocaleString('es-CO');
    e.target.value = valor;
  });
};
document.querySelectorAll('.price-input').forEach(formatearMoneda);

const limpiarPrecio = (valor) => {
  if (!valor) return 0;
  return parseInt(valor.replace(/\./g, ''), 10);
};

// --- Open Edit Modal on Card Click ---
cards.forEach((card) => {
  card.addEventListener('click', (e) => {
    currentEditId = e.currentTarget.dataset.id || null;
    const idText = document.getElementById('editProductIdText');
    if (idText && currentEditId) idText.innerText = currentEditId.slice(-6);

    document.getElementById('editModelo').value = e.currentTarget.dataset.modelo || '';
    document.getElementById('editFamiliaId').value = e.currentTarget.dataset.familiaId || '';
    document.getElementById('editPrecioVenta').value = parseInt(e.currentTarget.dataset.venta || 0).toLocaleString('es-CO');
    document.getElementById('editPrecioCosto').value = parseInt(e.currentTarget.dataset.costo || 0).toLocaleString('es-CO');
    document.getElementById('editStockActual').value = e.currentTarget.dataset.stock || '';

    const imgUrl = e.currentTarget.dataset.imagen || 'https://placehold.co/400x400?text=Sin+Imagen';
    document.getElementById('editImagePreview').src = imgUrl;
    document.getElementById('editProductOriginalImage').value = imgUrl;

    editModal?.classList.remove('hidden');
  });
});

// --- Image Upload ---
async function uploadImage(file) {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const { data, error } = await supabase.storage.from('imagenes-productos').upload(fileName, file);
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from('imagenes-productos').getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}

// --- Add Product ---
document.getElementById('btnGuardarNuevo')?.addEventListener('click', async (e) => {
  const btn = e.target;
  btn.innerText = 'Guardando...';
  btn.disabled = true;

  try {
    let imageUrl = null;
    const file = document.getElementById('addProductImage').files?.[0];
    if (file) imageUrl = await uploadImage(file);

    const { error } = await supabase.from('referencias').insert([{
      modelo: document.getElementById('addModelo').value.trim(),
      familia_id: document.getElementById('addFamiliaId').value,
      precio_venta: limpiarPrecio(document.getElementById('addPrecioVenta').value),
      precio_costo: limpiarPrecio(document.getElementById('addPrecioCosto').value),
      stock_actual: parseInt(document.getElementById('addStockActual').value),
      imagen_especifica: imageUrl,
      visible_en_catalogo: false,
      activo: true,
    }]);
    if (error) throw error;
    window.location.reload();
  } catch (err) {
    alert('Error al agregar: ' + err.message);
    btn.innerText = '💾 Guardar Producto';
    btn.disabled = false;
  }
});

// --- Edit Product ---
document.getElementById('btnGuardarCambios')?.addEventListener('click', async (e) => {
  const btn = e.target;
  btn.innerText = 'Actualizando...';
  btn.disabled = true;

  try {
    let imageUrl = document.getElementById('editProductOriginalImage').value;
    const file = document.getElementById('editProductImage').files?.[0];
    if (file) imageUrl = await uploadImage(file);

    const { error } = await supabase.from('referencias').update({
      modelo: document.getElementById('editModelo').value.trim(),
      familia_id: document.getElementById('editFamiliaId').value,
      precio_venta: limpiarPrecio(document.getElementById('editPrecioVenta').value),
      precio_costo: limpiarPrecio(document.getElementById('editPrecioCosto').value),
      stock_actual: parseInt(document.getElementById('editStockActual').value),
      imagen_especifica: imageUrl,
    }).eq('id', currentEditId);
    if (error) throw error;
    window.location.reload();
  } catch (err) {
    alert('Error al editar: ' + err.message);
    btn.innerText = '💾 Guardar';
    btn.disabled = false;
  }
});

// --- Delete Product ---
document.getElementById('btnEliminar')?.addEventListener('click', () => deleteConfirmModal?.classList.remove('hidden'));
document.getElementById('btnConfirmDelete')?.addEventListener('click', async (e) => {
  const btn = e.target;
  btn.innerText = 'Eliminando...';
  try {
    const { error } = await supabase.from('referencias').update({ activo: false }).eq('id', currentEditId);
    if (error) throw error;
    window.location.reload();
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
    btn.innerText = 'Sí, Eliminar';
  }
});

console.log('✅ pos-client.js cargado completamente');

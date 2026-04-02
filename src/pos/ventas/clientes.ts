import { supabase } from '../../lib/supabase.js';

export function initClienteModal(selectCliente: HTMLSelectElement) {
  const modal     = document.getElementById('modalNuevoCliente')!;
  const container = document.getElementById('containerNuevoCliente')!;
  const form      = document.getElementById('formNuevoCliente') as HTMLFormElement;
  const seccionOpcionales = document.getElementById('seccionOpcionales')!;
  const iconChevron       = document.getElementById('iconChevronOpcionales')!;

  const cerrarModal = () => {
    container.classList.remove('scale-100', 'opacity-100');
    container.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      form.reset();
      seccionOpcionales.classList.add('hidden');
      iconChevron.classList.remove('rotate-180');
    }, 300);
  };

  document.getElementById('btnAbrirModalCliente')?.addEventListener('click', () => {
    modal.classList.remove('hidden');
    setTimeout(() => {
      container.classList.remove('scale-95', 'opacity-0');
      container.classList.add('scale-100', 'opacity-100');
    }, 10);
  });

  document.getElementById('btnCerrarCliente')?.addEventListener('click', cerrarModal);

  document.getElementById('btnToggleOpcionales')?.addEventListener('click', () => {
    seccionOpcionales.classList.toggle('hidden');
    iconChevron.classList.toggle('rotate-180');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nombre   = (document.getElementById('addCliNombre') as HTMLInputElement).value.trim().toUpperCase();
    const telefono = (document.getElementById('addCliTel')    as HTMLInputElement).value.trim();

    const tipo_documento = (document.getElementById('addCliTipoDoc') as HTMLSelectElement).value;
    const documento      = (document.getElementById('addCliDoc')     as HTMLInputElement).value.trim();
    const correo         = (document.getElementById('addCliCorreo')  as HTMLInputElement).value.trim();
    const ciudad         = (document.getElementById('addCliCiudad')  as HTMLInputElement).value.trim();
    const cumpleanos     = (document.getElementById('addCliCumple')  as HTMLInputElement).value || null;
    const direccion      = (document.getElementById('addCliDir')     as HTMLInputElement).value.trim();
    const descuento_general = parseFloat((document.getElementById('addCliDescuento') as HTMLInputElement)?.value) || 0;

    const { error } = await supabase
      .from('clientes')
      .insert([{ nombre, telefono, tipo_documento, documento, correo, ciudad, cumpleanos, direccion, descuento_general }])
      .select();

    if (error) {
      alert('Error al guardar cliente: ' + error.message);
      return;
    }

    const option = document.createElement('option');
    option.value = nombre;
    option.text  = nombre;
    option.setAttribute('data-telefono', telefono);
    option.setAttribute('data-descuento', String(descuento_general));
    selectCliente.appendChild(option);
    selectCliente.value = nombre;
    selectCliente.dispatchEvent(new Event('change'));

    cerrarModal();
  });
}

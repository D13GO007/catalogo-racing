export function initFiltros(params: {
  buscador: HTMLInputElement;
  tarjetasProducto: HTMLElement[];
  familyButtons: NodeListOf<Element>;
  clearFilter: HTMLElement;
  noResultsMsg: HTMLElement;
}) {
  const { buscador, tarjetasProducto, familyButtons, clearFilter, noResultsMsg } = params;

  const setActiveFamilyBtn = (clickedBtn: Element) => {
    familyButtons.forEach(b => {
      b.classList.remove('bg-orange-50', 'text-orange-700', 'border-orange-300', 'font-bold');
      b.classList.add('bg-white', 'text-gray-700', 'border-gray-200', 'font-medium');
    });
    clickedBtn.classList.remove('bg-white', 'text-gray-700', 'border-gray-200', 'font-medium');
    clickedBtn.classList.add('bg-orange-50', 'text-orange-700', 'border-orange-300', 'font-bold');
  };

  const applyFilters = () => {
    const query = buscador.value.toLowerCase().trim();
    const activeFamilyBtn = document.querySelector('.family-btn.bg-orange-50');
    const activeFamily = activeFamilyBtn ? activeFamilyBtn.getAttribute('data-family') : 'all';
    let itemsVisibles = 0;

    tarjetasProducto.forEach(tarjeta => {
      const modelo = tarjeta.getAttribute('data-modelo') || '';
      const familia = tarjeta.getAttribute('data-familia') || '';
      const matchesSearch = modelo.includes(query) || familia.includes(query);
      const matchesFamily = activeFamily === 'all' || familia === activeFamily!.toLowerCase();

      if (matchesSearch && matchesFamily) {
        tarjeta.style.display = 'flex';
        itemsVisibles++;
      } else {
        tarjeta.style.display = 'none';
      }
    });

    if (itemsVisibles === 0) noResultsMsg.classList.remove('hidden');
    else noResultsMsg.classList.add('hidden');
  };

  buscador.addEventListener('input', applyFilters);

  familyButtons.forEach(btn =>
    btn.addEventListener('click', () => {
      setActiveFamilyBtn(btn);
      applyFilters();
    })
  );

  clearFilter.addEventListener('click', () => {
    buscador.value = '';
    const btnAll = document.querySelector('.family-btn[data-family="all"]');
    if (btnAll) setActiveFamilyBtn(btnAll);
    applyFilters();
  });
}

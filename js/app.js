document.addEventListener('DOMContentLoaded', async () => {

    // ── DOM ──────────────────────────────────────────────────────────────────
    const kitchenNumberInput  = document.getElementById('kitchen-number-input');
    const modeSwitcher        = document.getElementById('mode-switcher');
    const mapaClub            = document.getElementById('mapa-club');
    const addTableBtn         = document.getElementById('add-table-btn');
    const managePricesBtn     = document.getElementById('manage-prices-btn');
    const clearAllOrdersBtn   = document.getElementById('clear-all-orders-btn');
    const showTotalBtn        = document.getElementById('show-total-btn');

    // Secciones del modal de pedido
    const pizzaLibreSection         = document.getElementById('pizza-libre-section');
    const menuSection               = document.getElementById('menu-section');
    const customPizzaBuilderSection = document.getElementById('custom-pizza-builder-section');
    const pizzaTopping3Container    = document.getElementById('pizza-topping-3-container');

    // Secciones del modal de precios
    const pricePizzaSection       = document.getElementById('price-pizza-section');
    const priceMenuSection        = document.getElementById('price-menu-section');
    const priceCustomPizzaSection = document.getElementById('price-custom-pizza-section');
    const priceMenuMiercolesWrapper = document.getElementById('price-menu-miercoles-wrapper');
    const priceMenuViernesWrapper   = document.getElementById('price-menu-viernes-wrapper');
    const priceMenuSabadoWrapper    = document.getElementById('price-menu-sabado-wrapper');
    const priceMenuDomingoWrapper   = document.getElementById('price-menu-domingo-wrapper');

    // Modales
    const orderModal               = document.getElementById('order-modal');
    const pricesModal              = document.getElementById('prices-modal');
    const passwordModal            = document.getElementById('password-modal');
    const totalModal               = document.getElementById('total-modal');
    const printSingleAccountModal  = document.getElementById('print-single-account-modal');
    const genericDataModal         = document.getElementById('generic-data-modal');

    // Botones de modales
    const closeOrderModalBtn               = document.getElementById('close-order-modal-btn');
    const closePricesModalBtn              = document.getElementById('close-prices-modal-btn');
    const closeTotalModalBtn               = document.getElementById('close-total-modal-btn');
    const closePrintSingleAccountModalBtn  = document.getElementById('close-print-single-account-modal-btn');
    const closePrintSingleAccountFinalBtn  = document.getElementById('close-print-single-account-final-btn');
    const printSingleAccountFinalBtn       = document.getElementById('print-single-account-final-btn');
    const printSinglePreview               = document.getElementById('print-single-preview');
    const printSingleAccountBtn            = document.getElementById('print-single-account-btn');
    const closeGenericDataModalBtn         = document.getElementById('close-generic-data-modal-btn');
    const genericDataBtn                   = document.getElementById('generic-data-btn');

    // Datos genéricos
    const genericEstablishmentNameInput = document.getElementById('generic-establishment-name');
    const genericAddressInput           = document.getElementById('generic-address');
    const genericPhoneInput             = document.getElementById('generic-phone');
    const genericEmailInput             = document.getElementById('generic-email');
    const genericFooterInput            = document.getElementById('generic-footer');
    const saveGenericDataBtn            = document.getElementById('save-generic-data-btn');

    // Contadores del modal de pedido
    const modalTitleContainer = document.getElementById('modal-title-container');
    const pizzaLibreHCount    = document.getElementById('pizzaLibreH-count');
    const pizzaLibreMCount    = document.getElementById('pizzaLibreM-count');
    const pizzaLibreGCount    = document.getElementById('pizzaLibreG-count');
    const menoresCount        = document.getElementById('menores-count');
    const menorPriceInput     = document.getElementById('menor-price-input');
    const empanadasCount      = document.getElementById('empanadas-count');
    const menuCount           = document.getElementById('menu-count');
    const postresCount        = document.getElementById('postres-count');
    const beverageSelect      = document.getElementById('beverage-select');
    const beverageQuantityInput = document.getElementById('beverage-quantity');
    const addBeverageBtn      = document.getElementById('add-beverage-btn');
    const modalOrderList      = document.getElementById('modal-order-list');
    const modalTotalPrice     = document.getElementById('modal-total-price');
    const deleteEntityBtn     = document.getElementById('delete-entity-btn');
    const cleanOrderBtn       = document.getElementById('clean-order-btn');
    const closeAndSaveBtn     = document.getElementById('close-and-save-btn');

    // Inputs de precios
    const pricePizzaLibreHInput    = document.getElementById('price-pizza-libre-h');
    const pricePizzaLibreMInput    = document.getElementById('price-pizza-libre-m');
    const pricePizzaLibreGInput    = document.getElementById('price-pizza-libre-g');
    const priceEmpanadaInput       = document.getElementById('price-empanada');
    const pricePostreInput         = document.getElementById('price-postre');
    const priceMenuMiercolesInput  = document.getElementById('price-menu-miercoles');
    const priceMenuViernesInput    = document.getElementById('price-menu-viernes');
    const priceMenuSabadoInput     = document.getElementById('price-menu-sabado');
    const priceMenuDomingoInput    = document.getElementById('price-menu-domingo');
    const beveragesPricesList      = document.getElementById('beverages-prices-list');
    const newBeverageNameInput     = document.getElementById('new-beverage-name');
    const newBeveragePriceInput    = document.getElementById('new-beverage-price');
    const newBeverageCategoryInput = document.getElementById('new-beverage-category');
    const addNewBeveragePriceBtn   = document.getElementById('add-new-beverage-price-btn');
    const savePricesBtn            = document.getElementById('save-prices-btn');
    const customPizzaPricesList    = document.getElementById('custom-pizza-prices-list');

    // Constructor de pizzas
    const pizzaSizeSelect     = document.getElementById('pizza-size');
    const pizzaTopping1Select = document.getElementById('pizza-topping-1');
    const pizzaTopping2Select = document.getElementById('pizza-topping-2');
    const pizzaTopping3Select = document.getElementById('pizza-topping-3');
    const addCustomPizzaBtn   = document.getElementById('add-custom-pizza-btn');

    // Barra
    const barClientNameInput = document.getElementById('bar-client-name');
    const addBarOrderBtn     = document.getElementById('add-bar-order-btn');
    const barOrdersList      = document.getElementById('bar-orders-list');

    // Password
    const passwordTitle       = document.getElementById('password-title');
    const passwordDescription = document.getElementById('password-description');
    const passwordInput       = document.getElementById('password-input');
    const passwordError       = document.getElementById('password-error');
    const passwordConfirmBtn  = document.getElementById('password-confirm-btn');
    const passwordCancelBtn   = document.getElementById('password-cancel-btn');
    const totalModalAmount    = document.getElementById('total-modal-amount');

    // ── UI STATE (no se persiste) ─────────────────────────────────────────────
    let activeEntity       = null;
    let orderBeforeChanges = null;
    let actionToConfirm    = null;

    // ── HELPERS ───────────────────────────────────────────────────────────────
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function resolveBeverageCategory(name, category) {
        if (category && category !== 'otro') return category;
        const n = name.toLowerCase();
        if (n.includes('agua') && !n.includes('saborizada')) return 'agua';
        if (n.includes('saborizada') || n.includes('naranja') || n.includes('pomelo') || n.includes('manzana')) return 'saborizada';
        if (n.includes('lata') || n.includes('coca') || n.includes('sprite') || n.includes('zero')) return 'gaseosa';
        if (n.includes('cerveza')) return 'cerveza';
        if (n.includes('vino'))    return 'vino';
        if (n.includes('fernet') || n.includes('gancia')) return 'jarro';
        return 'otro';
    }

    function getBeverageColor(name, category = 'otro') {
        switch (resolveBeverageCategory(name, category)) {
            case 'agua':       return 'bg-blue-200 border-blue-500';
            case 'saborizada': return 'bg-orange-200 border-orange-500';
            case 'gaseosa':    return 'bg-red-200 border-red-500';
            case 'cerveza':    return 'bg-yellow-200 border-yellow-500';
            case 'vino':       return 'bg-purple-200 border-purple-500';
            case 'jarro':      return 'bg-indigo-200 border-indigo-500 text-indigo-900';
            default:           return 'bg-gray-100 border-gray-400';
        }
    }

    function getBeverageOptionStyle(name, category = 'otro') {
        switch (resolveBeverageCategory(name, category)) {
            case 'agua':       return { bg: '#90CDF4', text: '#2A4365' };
            case 'saborizada': return { bg: '#FBD38D', text: '#9C4221' };
            case 'gaseosa':    return { bg: '#FC8181', text: '#9B2C2C' };
            case 'cerveza':    return { bg: '#F0E68C', text: '#975A16' };
            case 'vino':       return { bg: '#B794F4', text: '#44337A' };
            case 'jarro':      return { bg: '#C3DAFE', text: '#2C5282' };
            default:           return { bg: '#FFFFFF', text: '#1A202C' };
        }
    }

    // ── MODO UI ───────────────────────────────────────────────────────────────
    function updateUIMode(mode) {
        const isJueves = mode === 'jueves';
        const isSabado = mode === 'sabado';

        pizzaLibreSection.style.display         = (isJueves || isSabado) ? 'block' : 'none';
        menuSection.style.display               = (isJueves || isSabado) ? 'none'  : 'block';
        customPizzaBuilderSection.style.display = isSabado ? 'block' : 'none';

        pricePizzaSection.style.display       = (isJueves || isSabado) ? 'block' : 'none';
        priceMenuSection.style.display        = (isJueves || isSabado) ? 'none'  : 'block';
        priceCustomPizzaSection.style.display = isSabado ? 'block' : 'none';

        [priceMenuMiercolesWrapper, priceMenuViernesWrapper,
         priceMenuSabadoWrapper,    priceMenuDomingoWrapper].forEach(w => { if (w) w.style.display = 'none'; });

        if (mode === 'miercoles' && priceMenuMiercolesWrapper) priceMenuMiercolesWrapper.style.display = 'block';
        if (mode === 'viernes'   && priceMenuViernesWrapper)   priceMenuViernesWrapper.style.display   = 'block';
        if (mode === 'sabado'    && priceMenuSabadoWrapper)    priceMenuSabadoWrapper.style.display    = 'block';
        if (mode === 'domingo'   && priceMenuDomingoWrapper)   priceMenuDomingoWrapper.style.display   = 'block';
    }

    // ── RENDER ────────────────────────────────────────────────────────────────
    function renderAll() { renderTables(); renderBarOrders(); }

    function renderTables() {
        mapaClub.innerHTML = '';
        appState.tables.forEach(table => {
            const el = document.createElement('div');
            el.id = table.id;
            el.className = 'mesa absolute bg-blue-500 border-2 border-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-2xl cursor-grab';
            el.style.left   = `${table.x}px`;
            el.style.top    = `${table.y}px`;
            el.style.width  = `${table.width}px`;
            el.style.height = `${table.height}px`;

            const numEl     = document.createElement('span');
            numEl.textContent = table.number;
            const resizerEl = document.createElement('div');
            resizerEl.className = 'resizer';

            el.appendChild(numEl);
            el.appendChild(resizerEl);
            mapaClub.appendChild(el);

            el.addEventListener('click', e => {
                if (e.target.classList.contains('resizer')) return;
                openOrderModal(table.id, 'table');
            });
            makeDraggable(el, appState.tables, mapaClub, saveState);
            makeResizable(el, resizerEl, appState.tables, saveState);
        });
    }

    function renderBarOrders() {
        barOrdersList.innerHTML = '';
        appState.barOrders.forEach(order => {
            const el    = document.createElement('div');
            el.className = 'bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200';
            const total = calculateTotal(order.order, appState.prices, appState.currentMode);
            el.innerHTML = `<div class="flex justify-between items-center"><span class="font-semibold">${order.clientName}</span><span class="font-bold text-gray-700">$${total.toFixed(2)}</span></div>`;
            el.addEventListener('click', () => openOrderModal(order.id, 'bar'));
            barOrdersList.appendChild(el);
        });
    }

    function renderOrderList() {
        modalOrderList.innerHTML = '';
        const order = activeEntity.order;
        const mode  = appState.currentMode;

        if (mode === 'jueves' || mode === 'sabado') {
            if (order.pizzaLibreH > 0) modalOrderList.innerHTML += `<div class="order-item-food">${order.pizzaLibreH} x Pizza Libre Hombres</div>`;
            if (order.pizzaLibreM > 0) modalOrderList.innerHTML += `<div class="order-item-food">${order.pizzaLibreM} x Pizza Libre Mujeres</div>`;
            if (order.pizzaLibreG > 0) modalOrderList.innerHTML += `<div class="order-item-food">${order.pizzaLibreG} x Pizza Libre General</div>`;
        }
        if (mode !== 'jueves' && mode !== 'sabado') {
            if (order.menu > 0) modalOrderList.innerHTML += `<div class="order-item-food">${order.menu} x Menú</div>`;
        }
        if (order.empanadas > 0) modalOrderList.innerHTML += `<div class="order-item-food">${order.empanadas} x Empanada</div>`;
        if (order.menores   > 0) modalOrderList.innerHTML += `<div class="order-item-food">${order.menores} x Menor — $${((order.menores||0)*(order.menorPrice||0)).toFixed(2)}</div>`;
        if (order.postres   > 0) modalOrderList.innerHTML += `<div class="order-item-food">${order.postres} x Postre</div>`;

        if (order.pizzasPersonalizadas && order.pizzasPersonalizadas.length > 0) {
            order.pizzasPersonalizadas.forEach((pizza, index) => {
                const item = document.createElement('div');
                item.className = 'order-item-bev flex justify-between items-center bg-green-100 border-green-500';
                const desc = `1x Pizza ${pizza.size} (${pizza.toppings.filter(t => t !== 'ninguno').join(', ')})`;
                item.innerHTML = `
                    <span class="font-medium text-gray-800">${desc}</span>
                    <button data-pizza-index="${index}" class="remove-pizza-btn" title="Quitar Pizza">X</button>
                `;
                modalOrderList.appendChild(item);
            });
        }

        order.beverages.forEach((bev, index) => {
            const bevEl      = document.createElement('div');
            const bevInfo    = appState.prices.beverages.find(b => b.name === bev.name) || {};
            const colorCls   = getBeverageColor(bev.name, bevInfo.category);
            bevEl.className  = `order-item-bev flex justify-between items-center ${colorCls}`;
            bevEl.innerHTML  = `
                <span class="font-medium ${colorCls.includes('text-white') ? 'text-white' : 'text-gray-800'}">${bev.quantity} x ${bev.name}</span>
                <div class="flex items-center space-x-1">
                    <button data-index="${index}" class="decrease-bev-btn w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full font-bold shadow-sm hover:bg-red-600 transition" title="Quitar 1">-</button>
                    <button data-index="${index}" class="increase-bev-btn w-7 h-7 flex items-center justify-center bg-green-500 text-white rounded-full font-bold shadow-sm hover:bg-green-600 transition" title="Agregar 1">+</button>
                </div>
            `;
            modalOrderList.appendChild(bevEl);
        });
    }

    function updateOrderModalUI() {
        if (!activeEntity) return;
        const order = activeEntity.order;
        pizzaLibreHCount.textContent = order.pizzaLibreH || 0;
        pizzaLibreMCount.textContent = order.pizzaLibreM || 0;
        pizzaLibreGCount.textContent = order.pizzaLibreG || 0;
        if (menoresCount)    menoresCount.textContent = order.menores || 0;
        if (menorPriceInput) menorPriceInput.value    = (order.menorPrice !== undefined && order.menorPrice !== null) ? order.menorPrice : '';
        empanadasCount.textContent = order.empanadas || 0;
        menuCount.textContent      = order.menu      || 0;
        postresCount.textContent   = order.postres   || 0;

        beverageSelect.innerHTML = '';
        appState.prices.beverages.forEach(bev => {
            const opt   = document.createElement('option');
            opt.value   = bev.name;
            opt.textContent = `${bev.name} - $${bev.price.toFixed(2)}`;
            const style = getBeverageOptionStyle(bev.name, bev.category);
            opt.style.backgroundColor = style.bg;
            opt.style.color           = style.text;
            beverageSelect.appendChild(opt);
        });

        [pizzaTopping1Select, pizzaTopping2Select, pizzaTopping3Select].forEach((sel, i) => {
            sel.innerHTML = '';
            if (i > 0) {
                const none = document.createElement('option');
                none.value = 'ninguno'; none.textContent = 'Ninguno';
                sel.appendChild(none);
            }
            appState.prices.preciosPizzas.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.name; opt.textContent = p.name;
                sel.appendChild(opt);
            });
        });

        renderOrderList();
        updateTotal();
    }

    function updateTotal() {
        if (!activeEntity) return;
        const total = calculateTotal(activeEntity.order, appState.prices, appState.currentMode);
        modalTotalPrice.textContent = `$${total.toFixed(2)}`;
        renderAll();
    }

    // ── MODALES ───────────────────────────────────────────────────────────────
    function openOrderModal(id, type) {
        if (type === 'table') {
            activeEntity = appState.tables.find(t => t.id === id);
            modalTitleContainer.innerHTML = `<div class="flex items-center gap-2"><span class="text-2xl font-bold text-gray-800">Mesa</span><input id="modal-table-number-input" type="text" value="${activeEntity.number}" class="text-2xl font-bold p-1 w-20 border rounded-lg text-center"></div>`;
            deleteEntityBtn.textContent = 'Eliminar Mesa';
        } else {
            activeEntity = appState.barOrders.find(o => o.id === id);
            modalTitleContainer.innerHTML = `<h2 class="text-2xl font-bold">Pedido de ${activeEntity.clientName}</h2>`;
            deleteEntityBtn.textContent = 'Eliminar Pedido';
        }
        if (!activeEntity) return;

        activeEntity.order = Object.assign(getNewOrderObject(), activeEntity.order);
        orderBeforeChanges = JSON.parse(JSON.stringify(activeEntity.order));
        resetDeleteButtonState();
        updateOrderModalUI();
        orderModal.style.display = 'flex';
    }

    function closeOrderModal() {
        if (activeEntity && activeEntity.id.startsWith('table-')) {
            const numInput = document.getElementById('modal-table-number-input');
            if (numInput) {
                const newNum = numInput.value.trim();
                if (newNum) activeEntity.number = newNum;
            }
        }
        if (activeEntity && orderBeforeChanges && (appState.currentMode === 'jueves' || appState.currentMode === 'sabado')) {
            const name    = activeEntity.id.startsWith('table-') ? `Mesa ${activeEntity.number}` : activeEntity.clientName;
            const message = generateOrderMessage(orderBeforeChanges, activeEntity.order, name);
            if (message) sendWhatsAppMessage(message);
        }
        saveState();
        activeEntity = null; orderBeforeChanges = null;
        orderModal.style.display = 'none';
        resetDeleteButtonState();
        beverageQuantityInput.value = 1;
        renderAll();
    }

    function openPasswordModal(action) {
        actionToConfirm = action;
        passwordInput.value = '';
        passwordError.classList.add('hidden');
        const titles = {
            deleteTable:     { t: 'Eliminar Mesa',          d: 'Para eliminar la mesa, ingresa la clave.' },
            clearSingleOrder:{ t: 'Limpiar Pedido',         d: 'Para limpiar este pedido, ingresa la clave.' },
            clearAllOrders:  { t: 'Limpiar Todos los Pedidos', d: 'Para limpiar todos los pedidos, ingresa la clave.' }
        };
        const info = titles[action] || { t: 'Verificación', d: 'Ingresá la clave.' };
        passwordTitle.textContent       = info.t;
        passwordDescription.textContent = info.d;
        passwordModal.style.display = 'flex';
    }

    function closePasswordModal() {
        passwordModal.style.display = 'none';
        actionToConfirm = null;
    }

    function resetDeleteButtonState() {
        if (!deleteEntityBtn) return;
        deleteEntityBtn.classList.remove('bg-red-800', 'hover:bg-red-900');
        deleteEntityBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        deleteEntityBtn.dataset.confirming = 'false';
        if (activeEntity) deleteEntityBtn.textContent = activeEntity.id.startsWith('table-') ? 'Eliminar Mesa' : 'Eliminar Pedido';
    }

    function openPricesModal() {
        pricePizzaLibreHInput.value   = appState.prices.pizzaLibreH;
        pricePizzaLibreMInput.value   = appState.prices.pizzaLibreM;
        pricePizzaLibreGInput.value   = appState.prices.pizzaLibreG || 0;
        priceEmpanadaInput.value      = appState.prices.empanada;
        pricePostreInput.value        = appState.prices.precioPostre;
        priceMenuMiercolesInput.value = appState.prices.precioMenuMiercoles;
        priceMenuViernesInput.value   = appState.prices.precioMenuViernes;
        priceMenuSabadoInput.value    = appState.prices.precioMenuSabado;
        priceMenuDomingoInput.value   = appState.prices.precioMenuDomingo;
        renderBeveragePrices();
        renderCustomPizzaPrices();
        pricesModal.style.display = 'flex';
    }

    function closePricesModal() { pricesModal.style.display = 'none'; }

    function renderBeveragePrices() {
        beveragesPricesList.innerHTML = '';
        appState.prices.beverages.forEach((bev, index) => {
            const item     = document.createElement('div');
            const colorCls = getBeverageColor(bev.name, bev.category);
            item.className = `flex items-center justify-between p-2 rounded border-l-4 ${colorCls}`;
            item.innerHTML = `
                <span class="flex-grow font-medium ${colorCls.includes('text-white') ? 'text-white' : 'text-gray-800'}">${bev.name}</span>
                <input type="number" value="${bev.price.toFixed(2)}" data-index="${index}" class="bev-price-input w-24 p-1 border rounded-lg text-right">
                <button data-index="${index}" class="delete-bev-price-btn text-red-500 font-bold p-1 ml-1 hover:text-red-700">X</button>
            `;
            beveragesPricesList.appendChild(item);
        });
    }

    function renderCustomPizzaPrices() {
        customPizzaPricesList.innerHTML = '';
        appState.prices.preciosPizzas.forEach((pizza, index) => {
            const item     = document.createElement('div');
            item.className = 'flex items-center justify-between bg-gray-50 p-2 rounded gap-2';
            item.innerHTML = `
                <span class="flex-grow">${pizza.name}</span>
                <input type="number" value="${(pizza.precioEntera||0).toFixed(2)}" data-pizza-index="${index}" data-price-type="entera" class="pizza-price-input w-24 p-1 border rounded-lg text-right" placeholder="Entera">
                <input type="number" value="${(pizza.precioMedia ||0).toFixed(2)}" data-pizza-index="${index}" data-price-type="media"  class="pizza-price-input w-24 p-1 border rounded-lg text-right" placeholder="Media">
            `;
            customPizzaPricesList.appendChild(item);
        });
    }

    // ── WHATSAPP ──────────────────────────────────────────────────────────────
    function generateOrderMessage(oldOrder, newOrder, entityName) {
        const parts = [];
        const mode  = appState.currentMode;

        if (mode === 'jueves' || mode === 'sabado') {
            const dH = (newOrder.pizzaLibreH||0) - (oldOrder.pizzaLibreH||0);
            const dM = (newOrder.pizzaLibreM||0) - (oldOrder.pizzaLibreM||0);
            const dG = (newOrder.pizzaLibreG||0) - (oldOrder.pizzaLibreG||0);
            if (dH > 0) parts.push(`+${dH} Libre Hombres`);
            if (dM > 0) parts.push(`+${dM} Libre Mujeres`);
            if (dG > 0) parts.push(`+${dG} Libre General`);
        }
        if (mode === 'sabado') {
            const dP = (newOrder.pizzasPersonalizadas?.length||0) - (oldOrder.pizzasPersonalizadas?.length||0);
            if (dP > 0) parts.push(`+${dP} Pizzas Nuevas (Ver detalle en app)`);
        }
        if (mode !== 'jueves' && mode !== 'sabado') {
            const dMenu = (newOrder.menu||0) - (oldOrder.menu||0);
            if (dMenu > 0) parts.push(`+${dMenu} Menú`);
        }
        return parts.length > 0 ? `*${entityName}:* ${parts.join(', ')}` : null;
    }

    function sendWhatsAppMessage(message) {
        if (!appState.numeroCocina) { console.error('Número de cocina no configurado.'); return; }
        window.electronAPI.openExternal(`whatsapp://send?phone=${appState.numeroCocina}&text=${encodeURIComponent(message)}`);
    }

    // ── IMPRESIÓN ─────────────────────────────────────────────────────────────
    function getMenuPrice() {
        const m = appState.currentMode;
        if (m === 'miercoles') return appState.prices.precioMenuMiercoles;
        if (m === 'viernes')   return appState.prices.precioMenuViernes;
        if (m === 'sabado')    return appState.prices.precioMenuSabado;
        if (m === 'domingo')   return appState.prices.precioMenuDomingo;
        return 0;
    }

    function generateSingleAccountPreview() {
        if (!activeEntity) return;
        printSinglePreview.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'text-center mb-4 pb-4 border-b-2';

        const titleEl = document.createElement('h1');
        titleEl.className   = 'text-2xl font-bold';
        titleEl.textContent = appState.genericData.establishmentName;
        header.appendChild(titleEl);

        if (appState.genericData.address) {
            const p = document.createElement('p');
            p.className = 'text-sm text-gray-700'; p.textContent = appState.genericData.address;
            header.appendChild(p);
        }
        if (appState.genericData.phone) {
            const p = document.createElement('p');
            p.className = 'text-sm text-gray-700'; p.textContent = `Teléfono: ${appState.genericData.phone}`;
            header.appendChild(p);
        }
        if (appState.genericData.email) {
            const p = document.createElement('p');
            p.className = 'text-sm text-gray-700'; p.textContent = `Email: ${appState.genericData.email}`;
            header.appendChild(p);
        }
        printSinglePreview.appendChild(header);

        const clientTitle = document.createElement('h2');
        clientTitle.className   = 'text-xl font-bold text-center mt-4 mb-4';
        clientTitle.textContent = activeEntity.id.startsWith('table-')
            ? `MESA ${activeEntity.number}`
            : `PEDIDO: ${activeEntity.clientName}`;
        printSinglePreview.appendChild(clientTitle);

        const detailDiv = document.createElement('div');
        detailDiv.className = 'space-y-2 mb-4';

        const order = activeEntity.order;

        function addItem(label, amount) {
            const p = document.createElement('p');
            p.className = 'flex justify-between';
            p.innerHTML = `<span>${label}</span><span>$ ${amount.toFixed(2)}</span>`;
            detailDiv.appendChild(p);
        }

        if (order.pizzaLibreH > 0) addItem(`${order.pizzaLibreH} x Pizza Libre Hombres`, order.pizzaLibreH * appState.prices.pizzaLibreH);
        if (order.pizzaLibreM > 0) addItem(`${order.pizzaLibreM} x Pizza Libre Mujeres`, order.pizzaLibreM * appState.prices.pizzaLibreM);
        if (order.pizzaLibreG > 0) addItem(`${order.pizzaLibreG} x Pizza Libre General`, order.pizzaLibreG * appState.prices.pizzaLibreG);
        if (order.menores     > 0) addItem(`${order.menores} x Menor`, order.menores * (order.menorPrice || 0));
        if (order.menu        > 0) addItem(`${order.menu} x Menú`,     order.menu    * getMenuPrice());
        if (order.empanadas   > 0) addItem(`${order.empanadas} x Empanada`, order.empanadas * appState.prices.empanada);
        if (order.postres     > 0) addItem(`${order.postres} x Postre`, order.postres * appState.prices.precioPostre);

        if (order.pizzasPersonalizadas && order.pizzasPersonalizadas.length > 0) {
            order.pizzasPersonalizadas.forEach(pizza => {
                const p    = document.createElement('p');
                p.className = 'flex justify-between';
                p.innerHTML = `<span>1 x Pizza ${pizza.size} (${pizza.toppings.join(', ')})</span><span>$ ${calculatePizzaPrice(pizza, appState.prices).toFixed(2)}</span>`;
                detailDiv.appendChild(p);
            });
        }

        if (order.beverages && order.beverages.length > 0) {
            order.beverages.forEach(bev => {
                const info = appState.prices.beverages.find(b => b.name === bev.name) || { price: 0 };
                addItem(`${bev.quantity} x ${bev.name}`, bev.quantity * info.price);
            });
        }

        printSinglePreview.appendChild(detailDiv);

        const totalDiv = document.createElement('div');
        totalDiv.className = 'mt-4 pt-4 border-t-2 border-black text-center';
        const totalAmt  = calculateTotal(order, appState.prices, appState.currentMode);
        const lblEl     = document.createElement('p');
        lblEl.className = 'text-lg font-bold'; lblEl.textContent = 'TOTAL';
        const valEl     = document.createElement('p');
        valEl.className = 'text-3xl font-bold text-green-600'; valEl.textContent = `$ ${totalAmt.toFixed(2)}`;
        totalDiv.appendChild(lblEl); totalDiv.appendChild(valEl);
        printSinglePreview.appendChild(totalDiv);

        if (appState.genericData.footer) {
            const footerDiv = document.createElement('div');
            footerDiv.className   = 'text-center mt-6 pt-4 border-t text-sm text-gray-600';
            footerDiv.textContent = appState.genericData.footer;
            printSinglePreview.appendChild(footerDiv);
        }

        const style = document.createElement('style');
        style.textContent = `
            #print-single-preview { width:58mm; max-width:58mm; margin:0 auto; font-size:13px; }
            #print-single-preview img { max-height:110px; max-width:100%; display:block; margin:0 auto 8px; }
            @page { size:58mm 200mm; margin:3mm; }
            @media print { html,body { background:white; } #print-single-preview { width:58mm; max-width:58mm; margin:0; } }
        `;
        printSinglePreview.appendChild(style);
    }

    // ── EVENT LISTENERS ───────────────────────────────────────────────────────
    modeSwitcher.addEventListener('change', e => {
        appState.currentMode = e.target.value;
        updateUIMode(appState.currentMode);
        saveState();
    });

    kitchenNumberInput.addEventListener('change', () => {
        appState.numeroCocina = kitchenNumberInput.value.trim();
        saveState();
    });

    pizzaSizeSelect.addEventListener('change', () => {
        const isMedia = pizzaSizeSelect.value === 'media';
        pizzaTopping3Container.style.display = isMedia ? 'none' : 'block';
        pizzaTopping2Select.disabled = false;
    });

    closeOrderModalBtn.addEventListener('click', closeOrderModal);
    closeAndSaveBtn.addEventListener('click', closeOrderModal);

    passwordCancelBtn.addEventListener('click', closePasswordModal);

    managePricesBtn.addEventListener('click', openPricesModal);
    closePricesModalBtn.addEventListener('click', closePricesModal);

    closeTotalModalBtn.addEventListener('click', () => { totalModal.style.display = 'none'; });

    closeGenericDataModalBtn.addEventListener('click', () => { genericDataModal.style.display = 'none'; });

    closePrintSingleAccountModalBtn.addEventListener('click', () => { printSingleAccountModal.style.display = 'none'; });
    closePrintSingleAccountFinalBtn.addEventListener('click', () => { printSingleAccountModal.style.display = 'none'; });

    addTableBtn.addEventListener('click', () => {
        appState.nextTableNumber = appState.tables.length > 0
            ? Math.max(...appState.tables.map(t => parseInt(t.number) || 0)) + 1
            : 1;
        const newTable = {
            id: `table-${Date.now()}`,
            number: appState.nextTableNumber.toString(),
            x: 50, y: 50, width: 100, height: 100,
            order: getNewOrderObject()
        };
        appState.tables.push(newTable);
        saveState();
        renderTables();
    });

    addBarOrderBtn.addEventListener('click', () => {
        const clientName = barClientNameInput.value.trim();
        if (!clientName) return;
        const newOrder = { id: `bar-${Date.now()}`, clientName, order: getNewOrderObject() };
        appState.barOrders.push(newOrder);
        barClientNameInput.value = '';
        saveState();
        renderBarOrders();
        openOrderModal(newOrder.id, 'bar');
    });

    orderModal.addEventListener('click', e => {
        const target = e.target.closest('button');
        if (!target) return;

        if (deleteEntityBtn.dataset.confirming === 'true' && !target.closest('#delete-entity-btn')) {
            resetDeleteButtonState();
        }

        if (target.classList.contains('op-btn')) {
            const type   = target.dataset.type;
            const action = target.dataset.action;
            if (action === 'increase') {
                if (!activeEntity.order[type]) activeEntity.order[type] = 0;
                activeEntity.order[type]++;
            } else if (action === 'decrease' && activeEntity.order[type] > 0) {
                activeEntity.order[type]--;
            }
            updateOrderModalUI();
            saveState();
        }

        if (target.classList.contains('decrease-bev-btn')) {
            const idx = parseInt(target.dataset.index);
            const bev = activeEntity.order.beverages[idx];
            if (bev) {
                bev.quantity--;
                if (bev.quantity === 0) activeEntity.order.beverages.splice(idx, 1);
                updateOrderModalUI();
            }
        }

        if (target.classList.contains('increase-bev-btn')) {
            const idx = parseInt(target.dataset.index);
            const bev = activeEntity.order.beverages[idx];
            if (bev) { bev.quantity++; updateOrderModalUI(); }
        }

        if (target.classList.contains('remove-pizza-btn')) {
            const idx = parseInt(target.dataset.pizzaIndex);
            if (activeEntity.order.pizzasPersonalizadas[idx]) {
                activeEntity.order.pizzasPersonalizadas.splice(idx, 1);
                updateOrderModalUI();
            }
        }
    });

    addCustomPizzaBtn.addEventListener('click', () => {
        const size     = pizzaSizeSelect.value;
        const topping1 = pizzaTopping1Select.value;
        const topping2 = pizzaTopping2Select.value;
        const topping3 = pizzaTopping3Select.value;

        const toppings = size === 'media'
            ? [topping1, topping2].filter(t => t !== 'ninguno')
            : [topping1, topping2, topping3].filter(t => t !== 'ninguno');

        activeEntity.order.pizzasPersonalizadas.push({ id: Date.now(), size, toppings });
        updateOrderModalUI();
    });

    addBeverageBtn.addEventListener('click', () => {
        const name     = beverageSelect.value;
        const quantity = parseInt(beverageQuantityInput.value);
        if (!name || quantity <= 0) return;
        const existing = activeEntity.order.beverages.find(b => b.name === name);
        if (existing) { existing.quantity += quantity; }
        else          { activeEntity.order.beverages.push({ name, quantity }); }
        beverageQuantityInput.value = 1;
        updateOrderModalUI();
    });

    if (menorPriceInput) {
        menorPriceInput.addEventListener('change', () => {
            if (!activeEntity) return;
            const v = parseFloat(menorPriceInput.value);
            activeEntity.order.menorPrice = isNaN(v) ? 0 : v;
            saveState();
            updateOrderModalUI();
        });
    }

    deleteEntityBtn.addEventListener('click', () => {
        if (!activeEntity) return;
        if (activeEntity.id.startsWith('table-')) {
            openPasswordModal('deleteTable');
        } else {
            if (deleteEntityBtn.dataset.confirming === 'true') {
                appState.barOrders = appState.barOrders.filter(o => o.id !== activeEntity.id);
                closeOrderModal();
            } else {
                deleteEntityBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                deleteEntityBtn.classList.add('bg-red-800', 'hover:bg-red-900');
                deleteEntityBtn.textContent = '¿Confirmar?';
                deleteEntityBtn.dataset.confirming = 'true';
            }
        }
    });

    cleanOrderBtn.addEventListener('click', () => {
        if (!activeEntity) return;
        openPasswordModal('clearSingleOrder');
    });

    clearAllOrdersBtn.addEventListener('click', () => {
        openPasswordModal('clearAllOrders');
    });

    passwordConfirmBtn.addEventListener('click', () => {
        const clave = 'bochas';
        if (passwordInput.value.toLowerCase() !== clave) {
            passwordError.classList.remove('hidden');
            passwordInput.value = '';
            return;
        }
        if (actionToConfirm === 'deleteTable') {
            appState.tables = appState.tables.filter(t => t.id !== activeEntity.id);
            closePasswordModal(); closeOrderModal();
        } else if (actionToConfirm === 'clearSingleOrder') {
            activeEntity.order = getNewOrderObject();
            updateOrderModalUI();
            closePasswordModal();
        } else if (actionToConfirm === 'clearAllOrders') {
            appState.tables.forEach(t => { t.order = getNewOrderObject(); });
            appState.barOrders = [];
            saveState(); renderAll(); closePasswordModal();
        }
    });

    addNewBeveragePriceBtn.addEventListener('click', () => {
        const name     = newBeverageNameInput.value.trim();
        const price    = parseFloat(newBeveragePriceInput.value);
        const category = newBeverageCategoryInput.value;
        if (name && !isNaN(price)) {
            appState.prices.beverages.push({ name, price, category });
            newBeverageNameInput.value  = '';
            newBeveragePriceInput.value = '';
            renderBeveragePrices();
        }
    });

    beveragesPricesList.addEventListener('click', e => {
        if (e.target.classList.contains('delete-bev-price-btn')) {
            appState.prices.beverages.splice(parseInt(e.target.dataset.index), 1);
            renderBeveragePrices();
        }
    });

    savePricesBtn.addEventListener('click', () => {
        appState.prices.pizzaLibreH          = parseFloat(pricePizzaLibreHInput.value)   || 0;
        appState.prices.pizzaLibreM          = parseFloat(pricePizzaLibreMInput.value)   || 0;
        appState.prices.pizzaLibreG          = parseFloat(pricePizzaLibreGInput.value)   || 0;
        appState.prices.empanada             = parseFloat(priceEmpanadaInput.value)      || 0;
        appState.prices.precioPostre         = parseFloat(pricePostreInput.value)        || 0;
        appState.prices.precioMenuMiercoles  = parseFloat(priceMenuMiercolesInput.value) || 0;
        appState.prices.precioMenuViernes    = parseFloat(priceMenuViernesInput.value)   || 0;
        appState.prices.precioMenuSabado     = parseFloat(priceMenuSabadoInput.value)    || 0;
        appState.prices.precioMenuDomingo    = parseFloat(priceMenuDomingoInput.value)   || 0;

        document.querySelectorAll('#beverages-prices-list .bev-price-input').forEach(input => {
            const idx      = parseInt(input.dataset.index);
            const newPrice = parseFloat(input.value);
            if (!isNaN(newPrice) && appState.prices.beverages[idx]) appState.prices.beverages[idx].price = newPrice;
        });

        document.querySelectorAll('#custom-pizza-prices-list .pizza-price-input').forEach(input => {
            const idx      = parseInt(input.dataset.pizzaIndex);
            const type     = input.dataset.priceType;
            const newPrice = parseFloat(input.value);
            if (!isNaN(newPrice) && appState.prices.preciosPizzas[idx]) {
                if (type === 'entera') appState.prices.preciosPizzas[idx].precioEntera = newPrice;
                if (type === 'media')  appState.prices.preciosPizzas[idx].precioMedia  = newPrice;
            }
        });

        saveState();
        closePricesModal();
    });

    showTotalBtn.addEventListener('click', () => {
        const grand = calculateGrandTotal(appState.tables, appState.barOrders, appState.prices, appState.currentMode);
        totalModalAmount.textContent = `$${grand.toFixed(2)}`;
        totalModal.style.display = 'flex';
    });

    genericDataBtn.addEventListener('click', () => {
        genericEstablishmentNameInput.value = appState.genericData.establishmentName;
        genericAddressInput.value           = appState.genericData.address;
        genericPhoneInput.value             = appState.genericData.phone;
        genericEmailInput.value             = appState.genericData.email;
        genericFooterInput.value            = appState.genericData.footer;
        genericDataModal.style.display = 'flex';
    });

    saveGenericDataBtn.addEventListener('click', () => {
        appState.genericData.establishmentName = genericEstablishmentNameInput.value;
        appState.genericData.address           = genericAddressInput.value;
        appState.genericData.phone             = genericPhoneInput.value;
        appState.genericData.email             = genericEmailInput.value;
        appState.genericData.footer            = genericFooterInput.value;
        saveState();
        genericDataModal.style.display = 'none';
    });

    printSingleAccountBtn.addEventListener('click', () => {
        if (!activeEntity) return;
        generateSingleAccountPreview();
        printSingleAccountModal.style.display = 'flex';
    });

    printSingleAccountFinalBtn.addEventListener('click', () => {
        if (!activeEntity) return;
        const order = activeEntity.order;
        let bodyHtml = '';

        bodyHtml += `<div class="text-center"><div style="font-weight:700;font-size:14px;">${escapeHtml(appState.genericData.establishmentName||'')}</div>`;
        if (appState.genericData.address) bodyHtml += `<div style="font-size:10px;">${escapeHtml(appState.genericData.address)}</div>`;
        if (appState.genericData.phone)   bodyHtml += `<div style="font-size:10px;">Tel: ${escapeHtml(appState.genericData.phone)}</div>`;
        if (appState.genericData.email)   bodyHtml += `<div style="font-size:10px;">${escapeHtml(appState.genericData.email)}</div>`;
        bodyHtml += '<hr style="border:none;border-top:1px dashed #333;margin:6px 0;"/></div>';

        bodyHtml += activeEntity.id.startsWith('table-')
            ? `<div style="text-align:center;font-weight:700;margin:6px 0;">MESA ${escapeHtml(activeEntity.number)}</div>`
            : `<div style="text-align:center;font-weight:700;margin:6px 0;">PEDIDO: ${escapeHtml(activeEntity.clientName)}</div>`;

        bodyHtml += '<div style="margin-top:6px;">';
        function line(label, amount) {
            return `<div class="line"><span class="label">${escapeHtml(label)}</span><span class="amount">$ ${Number(amount).toFixed(2)}</span></div>`;
        }

        if (order.pizzaLibreH > 0) bodyHtml += line(`${order.pizzaLibreH} x Pizza Libre Hombres`, order.pizzaLibreH * appState.prices.pizzaLibreH);
        if (order.pizzaLibreM > 0) bodyHtml += line(`${order.pizzaLibreM} x Pizza Libre Mujeres`, order.pizzaLibreM * appState.prices.pizzaLibreM);
        if (order.pizzaLibreG > 0) bodyHtml += line(`${order.pizzaLibreG} x Pizza Libre General`, order.pizzaLibreG * appState.prices.pizzaLibreG);
        if (order.menores     > 0) bodyHtml += line(`${order.menores} x Menor`,    order.menores    * (order.menorPrice||0));
        if (order.menu        > 0) bodyHtml += line(`${order.menu} x Menú`,        order.menu       * getMenuPrice());
        if (order.empanadas   > 0) bodyHtml += line(`${order.empanadas} x Empanada`, order.empanadas * appState.prices.empanada);
        if (order.postres     > 0) bodyHtml += line(`${order.postres} x Postre`,   order.postres    * appState.prices.precioPostre);

        if (order.pizzasPersonalizadas && order.pizzasPersonalizadas.length > 0) {
            order.pizzasPersonalizadas.forEach(pizza => {
                bodyHtml += line(`1 x Pizza ${pizza.size} (${pizza.toppings.join(', ')})`, calculatePizzaPrice(pizza, appState.prices));
            });
        }
        if (order.beverages && order.beverages.length > 0) {
            order.beverages.forEach(bev => {
                const info = appState.prices.beverages.find(b => b.name === bev.name) || { price: 0 };
                bodyHtml += line(`${bev.quantity} x ${bev.name}`, bev.quantity * info.price);
            });
        }

        bodyHtml += '</div>';
        const totalAmt = calculateTotal(order, appState.prices, appState.currentMode);
        bodyHtml += '<hr class="small"/>';
        bodyHtml += `<div class="line" style="margin-top:6px;"><span class="label" style="font-weight:800;">TOTAL</span><span class="amount" style="font-size:16px;font-weight:800;">$ ${totalAmt.toFixed(2)}</span></div>`;
        if (appState.genericData.footer) {
            bodyHtml += `<div style="text-align:center;font-size:10px;margin-top:8px;">${escapeHtml(appState.genericData.footer)}</div>`;
        }

        const ticketHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Ticket</title><style>
            @page{size:58mm 200mm;margin:3mm;}
            html,body{margin:0;padding:0;background:#fff}
            body{font-family:Inter,Arial,sans-serif;color:#111}
            .ticket{width:58mm;max-width:58mm;margin:0 auto;padding:0}
            .line{display:flex;justify-content:space-between;align-items:flex-start;font-size:12px;line-height:1.1;margin:4px 0}
            .label{flex:1;text-align:left;word-break:break-word;margin-right:8px}
            .amount{width:74px;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
            hr.small{border:none;border-top:1px dashed #222;margin:8px 0}
        </style></head><body><div class="ticket">${bodyHtml}</div></body></html>`;

        const w = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
        if (!w) { alert('Permite ventanas emergentes para imprimir.'); return; }
        w.document.open(); w.document.write(ticketHtml); w.document.close();
        w.focus();
        setTimeout(() => { w.print(); w.close(); }, 900);
    });

    // ── INICIALIZACIÓN ────────────────────────────────────────────────────────
    await loadState();
    modeSwitcher.value        = appState.currentMode;
    kitchenNumberInput.value  = appState.numeroCocina;
    updateUIMode(appState.currentMode);
    pizzaSizeSelect.dispatchEvent(new Event('change'));
    renderAll();
});

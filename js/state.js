// Valores por defecto — se usan al arrancar y como base para el merge al cargar
const DEFAULT_PRICES = {
    pizzaLibreH: 10500, pizzaLibreM: 9500, pizzaLibreG: 10000,
    empanada: 200, precioPostre: 0,
    precioMenuMiercoles: 0, precioMenuViernes: 0, precioMenuSabado: 0, precioMenuDomingo: 0,
    preciosPizzas: [
        { name: 'Muzzarella', precioEntera: 0, precioMedia: 0 },
        { name: 'Provenzal',  precioEntera: 0, precioMedia: 0 },
        { name: 'Cebollada',  precioEntera: 0, precioMedia: 0 },
        { name: 'Margarita',  precioEntera: 0, precioMedia: 0 },
        { name: 'Rucula',     precioEntera: 0, precioMedia: 0 },
        { name: 'Calabresa',  precioEntera: 0, precioMedia: 0 },
        { name: 'Especial',   precioEntera: 0, precioMedia: 0 },
        { name: 'Napolitana', precioEntera: 0, precioMedia: 0 },
        { name: '3 Quesos',   precioEntera: 0, precioMedia: 0 },
        { name: 'Roquefort',  precioEntera: 0, precioMedia: 0 },
        { name: 'Anchoas',    precioEntera: 0, precioMedia: 0 }
    ],
    beverages: [
        { name: 'Lata de Coca',                 price: 0, category: 'gaseosa'    },
        { name: 'Lata de Sprite',               price: 0, category: 'gaseosa'    },
        { name: 'Coca-Cola 1.5L',               price: 0, category: 'gaseosa'    },
        { name: 'Sprite 1.5L',                  price: 0, category: 'gaseosa'    },
        { name: 'Coca-Cola Zero 1.5L',          price: 0, category: 'gaseosa'    },
        { name: 'Agua 1.5L',                    price: 0, category: 'agua'       },
        { name: 'Agua Saborizada Naranja',       price: 0, category: 'saborizada' },
        { name: 'Agua Saborizada Pomelo',        price: 0, category: 'saborizada' },
        { name: 'Agua Saborizada Manzana',       price: 0, category: 'saborizada' },
        { name: 'Jarro Fernet',                  price: 0, category: 'jarro'      },
        { name: 'Jarro Gancia',                  price: 0, category: 'jarro'      },
        { name: 'Vino Latitud 33',               price: 0, category: 'vino'       },
        { name: 'Vino Valentin Lacrado',         price: 0, category: 'vino'       },
        { name: 'Vino Alma Mora',                price: 0, category: 'vino'       },
        { name: 'Vino Cordero con Piel de Lobo', price: 0, category: 'vino'       },
        { name: 'Vino Valentin Blanco',          price: 0, category: 'vino'       },
        { name: 'Vaso de Vino con Soda',         price: 0, category: 'vino'       },
        { name: 'Vaso de Vino Solo',             price: 0, category: 'vino'       },
        { name: 'Cerveza Pilsen',                price: 0, category: 'cerveza'    },
        { name: 'Cerveza Santa Fe',              price: 0, category: 'cerveza'    },
        { name: 'Cerveza Heineken',              price: 0, category: 'cerveza'    }
    ]
};

const DEFAULT_GENERIC_DATA = {
    establishmentName: 'Club Bochas',
    address: '', phone: '', email: '', footer: ''
};

// Fuente única de verdad de la aplicación
const appState = {
    tables:         [],
    barOrders:      [],
    genericData:    Object.assign({}, DEFAULT_GENERIC_DATA),
    prices:         JSON.parse(JSON.stringify(DEFAULT_PRICES)),
    currentMode:    'miercoles',
    numeroCocina:   '',
    nextTableNumber: 1
};

function getNewOrderObject() {
    return {
        pizzaLibreH: 0, pizzaLibreM: 0, pizzaLibreG: 0,
        menores: 0, menorPrice: 0,
        empanadas: 0, postres: 0, menu: 0,
        beverages: [], pizzasPersonalizadas: []
    };
}

// Persistencia: localStorage (rápido) + archivo en userData (sobrevive reinstalaciones)
async function saveState() {
    const snapshot = {
        tables:          appState.tables,
        barOrders:       appState.barOrders,
        prices:          appState.prices,
        nextTableNumber: appState.nextTableNumber,
        currentMode:     appState.currentMode,
        numeroCocina:    appState.numeroCocina,
        genericData:     appState.genericData
    };
    const dataStr = JSON.stringify(snapshot);
    localStorage.setItem('restaurantState', dataStr);
    await window.electronAPI.saveBackup(dataStr);
}

async function loadState() {
    let raw = localStorage.getItem('restaurantState');
    if (!raw) raw = await window.electronAPI.loadBackup();
    if (!raw) return;

    try {
        const saved = JSON.parse(raw);

        appState.tables          = saved.tables          || [];
        appState.barOrders       = saved.barOrders       || [];
        appState.nextTableNumber = saved.nextTableNumber || 1;
        appState.currentMode     = saved.currentMode     || 'miercoles';
        appState.numeroCocina    = saved.numeroCocina    || '';
        appState.genericData     = saved.genericData     || Object.assign({}, DEFAULT_GENERIC_DATA);

        // Merge de precios: los valores del archivo prevalecen, se preservan defaults para campos nuevos
        appState.prices = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PRICES)), saved.prices || {});
        if (saved.prices && saved.prices.beverages)    appState.prices.beverages    = saved.prices.beverages;
        if (saved.prices && saved.prices.preciosPizzas) appState.prices.preciosPizzas = saved.prices.preciosPizzas;
    } catch (e) {
        console.error('Error al parsear el estado guardado:', e);
    }
}

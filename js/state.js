// Valores por defecto — se usan al arrancar y como base para el merge al cargar
const DEFAULT_PRICES = {
    pizzaLibreH: 10500, pizzaLibreM: 9500, pizzaLibreG: 10000,
    empanada: 200, precioPostre: 0,
    precioMenuMartes: 0, precioMenuMiercoles: 0, precioMenuViernes: 0, precioMenuDomingo: 0,
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
        // 1. Cervezas (Orden 1)
        { name: 'Cerveza Santa Fe',                       price: 0, category: 'cervezas' },
        { name: 'Cerveza Pilsen',                         price: 0, category: 'cervezas' },
        { name: 'Cerveza Heineken',                       price: 0, category: 'cervezas' },

        // 2. Gaseosas y Saborizadas (Orden 2)
        { name: 'Coca/Sprite',                            price: 0, category: 'gaseosas' },
        { name: 'Lata de coca/sprite',                    price: 0, category: 'gaseosas' },

        // 3. Aguas y Sodas (Orden 3)
        { name: 'Agua',                                   price: 0, category: 'aguas'    },
        { name: 'Agua saborizada (manzana/pomelo/naranja)', price: 0, category: 'aguas'  },
        { name: 'Soda',                                   price: 0, category: 'aguas'    },

        // 4. Tragos (Orden 4)
        { name: 'Jarro de fernet/gancia',                 price: 0, category: 'tragos'   },
        { name: 'Lata de coca/sprite+fernet',             price: 0, category: 'tragos'   },
        { name: 'Medida de fernet',                       price: 0, category: 'tragos'   },
        { name: 'Piña colada',                            price: 0, category: 'tragos'   },
        { name: 'Gin Tonic',                              price: 0, category: 'tragos'   },
        { name: 'Whisky/Ginebra',                         price: 0, category: 'tragos'   },

        // 5. Vinos (Orden 5)
        { name: 'Vino blanco Cosecha Tardía (dulce)',     price: 0, category: 'vinos'    },
        { name: 'Vino blanco Alma Mora (dulce)',          price: 0, category: 'vinos'    },
        { name: 'Vino blanco Portillo',                   price: 0, category: 'vinos'    },
        { name: 'Vino blanco Latitud',                    price: 0, category: 'vinos'    },
        { name: 'Vino blanco Valentin',                   price: 0, category: 'vinos'    },
        { name: 'Vino tinto Valentin',                    price: 0, category: 'vinos'    },
        { name: 'Vino tinto Cordero con Piel de Lobo',    price: 0, category: 'vinos'    },
        { name: 'Vino tinto Alma Mora',                   price: 0, category: 'vinos'    },
        { name: 'Vino tinto Latitud 33',                  price: 0, category: 'vinos'    },
        { name: 'Vino tinto Salentein',                   price: 0, category: 'vinos'    },
        { name: 'Vino tinto Rutini',                      price: 0, category: 'vinos'    },

        // 6. Otras Bebidas (Orden 6)
        { name: 'Vermú',                                  price: 0, category: 'otras'    }
    ]
};

const DEFAULT_GENERIC_DATA = {
    establishmentName: 'Club Bochas',
    address: '', phone: '', email: '', footer: '', alias: ''
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

function resolveBeverageCategory(name, category) {
    if (category) {
        const c = String(category).toLowerCase().trim();
        if (c === 'cerveza' || c === 'cervezas') return 'cervezas';
        if (c === 'gaseosa' || c === 'gaseosas') return 'gaseosas';
        if (c === 'agua' || c === 'aguas' || c === 'saborizada' || c === 'saborizadas') return 'aguas';
        if (c === 'jarro' || c === 'jarros' || c === 'trago' || c === 'tragos') return 'tragos';
        if (c === 'vino' || c === 'vinos') return 'vinos';
        if (c === 'otra' || c === 'otras' || c === 'otro' || c === 'otros') return 'otras';
    }

    const n = String(name || '').toLowerCase();
    if (n.includes('cerveza') || n.includes('heineken') || n.includes('pilsen') || n.includes('santa fe') || n.includes('corona') || n.includes('brahma') || n.includes('quilmes')) return 'cervezas';
    if (n.includes('vino') || n.includes('cosecha') || n.includes('portillo') || n.includes('valentin') || n.includes('cordero') || n.includes('alma mora') || n.includes('latitud') || n.includes('salentein') || n.includes('rutini') || n.includes('malbec') || n.includes('cabernet')) return 'vinos';
    if (n.includes('fernet') || n.includes('gancia') || n.includes('piña colada') || n.includes('gin') || n.includes('whisky') || n.includes('ginebra') || n.includes('jarro') || n.includes('trago') || n.includes('medida')) return 'tragos';
    if (n.includes('soda') || n.includes('agua') || n.includes('saborizada')) return 'aguas';
    if (n.includes('coca') || n.includes('sprite') || n.includes('gaseosa') || n.includes('lata')) return 'gaseosas';
    if (n.includes('vermú') || n.includes('vermut')) return 'otras';

    return 'otras';
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
        if (saved.prices && Array.isArray(saved.prices.beverages)) {
            const savedPriceMap = new Map();
            saved.prices.beverages.forEach(b => {
                if (b && b.name) savedPriceMap.set(b.name.trim().toLowerCase(), Number(b.price) || 0);
            });

            // Usar catálogo oficial y aplicar precios guardados si ya existían
            const mergedBeverages = DEFAULT_PRICES.beverages.map(bev => {
                const key = bev.name.trim().toLowerCase();
                const price = savedPriceMap.has(key) ? savedPriceMap.get(key) : bev.price;
                savedPriceMap.delete(key);
                return {
                    name: bev.name,
                    price: price,
                    category: bev.category
                };
            });

            // Si había bebidas adicionales personalizadas creadas por el usuario, mantenerlas
            saved.prices.beverages.forEach(bev => {
                if (bev && bev.name) {
                    const key = bev.name.trim().toLowerCase();
                    if (savedPriceMap.has(key)) {
                        mergedBeverages.push({
                            name: bev.name,
                            price: Number(bev.price) || 0,
                            category: resolveBeverageCategory(bev.name, bev.category)
                        });
                    }
                }
            });

            appState.prices.beverages = mergedBeverages;
        }
        if (saved.prices && saved.prices.preciosPizzas) appState.prices.preciosPizzas = saved.prices.preciosPizzas;
    } catch (e) {
        console.error('Error al parsear el estado guardado:', e);
    }
}


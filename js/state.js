// Valores por defecto — se usan al arrancar y como base para el merge al cargar
const DEFAULT_PRICES = {
    pizzaLibreH: 16000, pizzaLibreM: 16000, pizzaLibreG: 16000,
    empanada: 1200, precioPostre: 1500,
    precioMenuMartes: 5000, precioMenuMiercoles: 5000, precioMenuViernes: 5000, precioMenuDomingo: 6000,
    preciosPizzas: [
        { name: 'Muzzarella', precioEntera: 15000, precioMedia: 7500 },
        { name: 'Provenzal',  precioEntera: 16000, precioMedia: 8000 },
        { name: 'Cebollada',  precioEntera: 16000, precioMedia: 8000 },
        { name: 'Margarita',  precioEntera: 16000, precioMedia: 8000 },
        { name: 'Rucula',     precioEntera: 17000, precioMedia: 8500 },
        { name: 'Calabresa',  precioEntera: 17000, precioMedia: 8500 },
        { name: 'Especial',   precioEntera: 17000, precioMedia: 8500 },
        { name: 'Napolitana', precioEntera: 17000, precioMedia: 8500 },
        { name: '3 Quesos',   precioEntera: 18000, precioMedia: 9000 },
        { name: 'Roquefort',  precioEntera: 18000, precioMedia: 9000 },
        { name: 'Anchoas',    precioEntera: 18000, precioMedia: 9000 }
    ],
    beverages: [
        // 1. Cervezas
        { name: 'Cerveza Santa Fe',                       price: 6000,  category: 'cervezas' },
        { name: 'Cerveza Pilsen',                         price: 6500,  category: 'cervezas' },
        { name: 'Cerveza Heineken',                       price: 8500,  category: 'cervezas' },

        // 2. Gaseosas y Saborizadas
        { name: 'Coca-Cola',                              price: 6000,  category: 'gaseosas' },
        { name: 'Coca-Cola Zero',                         price: 6000,  category: 'gaseosas' },
        { name: 'Sprite',                                 price: 6000,  category: 'gaseosas' },
        { name: 'Lata de Coca-Cola',                      price: 3000,  category: 'gaseosas' },
        { name: 'Lata de Sprite',                         price: 3000,  category: 'gaseosas' },

        // 3. Aguas y Sodas
        { name: 'Agua',                                   price: 3500,  category: 'aguas'    },
        { name: 'Agua saborizada de manzana',             price: 4000,  category: 'aguas'    },
        { name: 'Agua saborizada de pomelo',              price: 4000,  category: 'aguas'    },
        { name: 'Agua saborizada de naranja',             price: 4000,  category: 'aguas'    },
        { name: 'Soda',                                   price: 4000,  category: 'aguas'    },

        // 4. Tragos
        { name: 'Jarro de fernet',                        price: 7000,  category: 'tragos'   },
        { name: 'Jarro de gancia',                        price: 7000,  category: 'tragos'   },
        { name: 'Lata de Coca-Cola + fernet',             price: 5000,  category: 'tragos'   },
        { name: 'Lata de Sprite + fernet',                price: 5000,  category: 'tragos'   },
        { name: 'Medida de fernet',                       price: 2500,  category: 'tragos'   },
        { name: 'Piña colada',                            price: 3000,  category: 'tragos'   },
        { name: 'Gin tonic',                              price: 6500,  category: 'tragos'   },
        { name: 'Whisky/Ginebra',                         price: 3500,  category: 'tragos'   },

        // 5. Vinos
        { name: 'Vino blanco Cosecha Tardía (dulce)',     price: 9000,  category: 'vinos'    },
        { name: 'Vino blanco Alma Mora (dulce)',          price: 10500, category: 'vinos'    },
        { name: 'Vino blanco Portillo',                   price: 7500,  category: 'vinos'    },
        { name: 'Vino blanco Latitud',                    price: 10500, category: 'vinos'    },
        { name: 'Vino blanco Valentin',                   price: 8000,  category: 'vinos'    },
        { name: 'Vino tinto Valentin',                    price: 8000,  category: 'vinos'    },
        { name: 'Vino tinto Cordero con Piel de Lobo',    price: 9000,  category: 'vinos'    },
        { name: 'Vino tinto Alma Mora',                   price: 9500,  category: 'vinos'    },
        { name: 'Vino tinto Latitud 33',                  price: 10500, category: 'vinos'    },
        { name: 'Vino tinto Salentein',                   price: 18000, category: 'vinos'    },
        { name: 'Vino tinto Rutini',                      price: 26000, category: 'vinos'    },

        // 6. Otras Bebidas
        { name: 'Vermú',                                  price: 3000,  category: 'otras'    }
    ]
};

const DEFAULT_GENERIC_DATA = {
    establishmentName: 'Club Bochas',
    address: '', phone: '', email: '', footer: '', alias: ''
};

function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Fuente única de verdad de la aplicación
const appState = {
    tables:         [],
    barOrders:      [],
    genericData:    Object.assign({}, DEFAULT_GENERIC_DATA),
    prices:         JSON.parse(JSON.stringify(DEFAULT_PRICES)),
    currentMode:    'miercoles',
    currentMozo:    'Mozo 1',
    numeroCocina:   '',
    nextTableNumber: 1,
    offlineQueue:   []
};

function getNewOrderObject() {
    return {
        pizzaLibreH: 0, pizzaLibreM: 0, pizzaLibreG: 0,
        menores: 0, menorPrice: 0,
        empanadas: 0, postres: 0, menu: 0,
        beverages: [], pizzasPersonalizadas: []
    };
}

// Persistencia: localStorage + archivo local userData + Neon Cloud PostgreSQL DB
async function saveState() {
    const snapshot = {
        tables:          appState.tables,
        barOrders:       appState.barOrders,
        prices:          appState.prices,
        nextTableNumber: appState.nextTableNumber,
        currentMode:     appState.currentMode,
        currentMozo:     appState.currentMozo,
        numeroCocina:    appState.numeroCocina,
        genericData:     appState.genericData,
        offlineQueue:    appState.offlineQueue
    };
    const dataStr = JSON.stringify(snapshot);
    localStorage.setItem('restaurantState', dataStr);

    if (typeof window !== 'undefined' && window.electronAPI) {
        if (typeof window.electronAPI.saveBackup === 'function') {
            await window.electronAPI.saveBackup(dataStr).catch(err => console.error('Error al guardar backup local:', err));
        }
        if (typeof window.electronAPI.syncCloudState === 'function') {
            window.electronAPI.syncCloudState(snapshot).catch(err => console.error('Error sincronizando con Neon DB:', err));
        }
    }
}

function resolveBeverageCategory(name, category) {
    if (category) {
        const c = String(category).toLowerCase().trim();
        if (c.includes('cerveza')) return 'cervezas';
        if (c.includes('gaseosa') || c.includes('saborizada')) return 'gaseosas';
        if (c.includes('agua') || c.includes('soda')) return 'aguas';
        if (c.includes('trago') || c.includes('jarro') || c.includes('medida')) return 'tragos';
        if (c.includes('vino')) return 'vinos';
        if (c.includes('otra') || c.includes('otro')) return 'otras';
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
    if (!raw && typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.loadBackup === 'function') {
        raw = await window.electronAPI.loadBackup();
    }

    if (raw) {
        try {
            const saved = JSON.parse(raw);
            appState.tables          = saved.tables          || [];
            appState.barOrders       = saved.barOrders       || [];
            appState.nextTableNumber = saved.nextTableNumber || 1;
            appState.currentMode     = saved.currentMode     || 'miercoles';
            appState.currentMozo     = saved.currentMozo     || 'Mozo 1';
            appState.numeroCocina    = saved.numeroCocina    || '';
            appState.genericData     = saved.genericData     || Object.assign({}, DEFAULT_GENERIC_DATA);
            appState.offlineQueue    = saved.offlineQueue    || [];
            if (saved.prices) {
                appState.prices.pizzaLibreH = saved.prices.pizzaLibreH || DEFAULT_PRICES.pizzaLibreH;
                appState.prices.pizzaLibreM = saved.prices.pizzaLibreM || DEFAULT_PRICES.pizzaLibreM;
                appState.prices.pizzaLibreG = saved.prices.pizzaLibreG || DEFAULT_PRICES.pizzaLibreG;
                appState.prices.empanada = saved.prices.empanada || DEFAULT_PRICES.empanada;
                appState.prices.precioPostre = saved.prices.precioPostre || DEFAULT_PRICES.precioPostre;
                appState.prices.precioMenuMartes = saved.prices.precioMenuMartes || DEFAULT_PRICES.precioMenuMartes;
                appState.prices.precioMenuMiercoles = saved.prices.precioMenuMiercoles || DEFAULT_PRICES.precioMenuMiercoles;
                appState.prices.precioMenuViernes = saved.prices.precioMenuViernes || DEFAULT_PRICES.precioMenuViernes;
                appState.prices.precioMenuDomingo = saved.prices.precioMenuDomingo || DEFAULT_PRICES.precioMenuDomingo;
                if (Array.isArray(saved.prices.preciosPizzas) && saved.prices.preciosPizzas.length > 0) {
                    appState.prices.preciosPizzas = saved.prices.preciosPizzas;
                }
                if (Array.isArray(saved.prices.beverages) && saved.prices.beverages.length > 0) {
                    appState.prices.beverages = saved.prices.beverages;
                }
            }
        } catch (e) {
            console.error('Error parseando respaldo local:', e);
        }
    }

    // Neon DB es la fuente de verdad: si conecta, REEMPLAZA bebidas y pizzas
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.loadCloudData === 'function') {
        try {
            const cloudRes = await window.electronAPI.loadCloudData().catch(function(err) {
                console.warn('Servicio de nube no disponible:', err);
                return null;
            });
            if (cloudRes && cloudRes.success) {
                // Cargar estado operativo del snapshot (mesas, barra, modo)
                if (cloudRes.snapshot) {
                    const snap = cloudRes.snapshot;
                    if (snap.tables && snap.tables.length > 0) appState.tables = snap.tables;
                    if (snap.barOrders && snap.barOrders.length > 0) appState.barOrders = snap.barOrders;
                    if (snap.nextTableNumber) appState.nextTableNumber = snap.nextTableNumber;
                    if (snap.currentMode) appState.currentMode = snap.currentMode;
                    if (snap.numeroCocina) appState.numeroCocina = snap.numeroCocina;
                    if (snap.genericData) appState.genericData = Object.assign({}, DEFAULT_GENERIC_DATA, snap.genericData);
                }

                // Construir bebidas y pizzas SOLO desde la tabla productos de Neon DB
                if (cloudRes.dbProducts && Array.isArray(cloudRes.dbProducts) && cloudRes.dbProducts.length > 0) {
                    var dbBeverages = [];
                    var dbPizzas = [];

                    cloudRes.dbProducts.forEach(function(prod) {
                        var numPrice = Number(prod.precio) || 0;
                        var n = prod.nombre ? prod.nombre.trim() : '';
                        var cat = prod.categoria ? prod.categoria.trim().toLowerCase() : '';

                        if (cat === 'comida') {
                            if (n.toLowerCase().includes('menu') || n.toLowerCase().includes('menú')) {
                                if (numPrice > 0) {
                                    appState.prices.precioMenuMiercoles = numPrice;
                                    appState.prices.precioMenuMartes = numPrice;
                                    appState.prices.precioMenuViernes = numPrice;
                                    appState.prices.precioMenuDomingo = numPrice;
                                }
                            } else if (n.toLowerCase() === 'postre') {
                                if (numPrice > 0) appState.prices.precioPostre = numPrice;
                            } else if (n.toLowerCase().includes('empanada')) {
                                if (numPrice > 0) appState.prices.empanada = numPrice;
                            } else if (n.toLowerCase().includes('pizza libre hombres')) {
                                if (numPrice > 0) appState.prices.pizzaLibreH = numPrice;
                            } else if (n.toLowerCase().includes('pizza libre mujeres')) {
                                if (numPrice > 0) appState.prices.pizzaLibreM = numPrice;
                            } else if (n.toLowerCase().includes('pizza libre general')) {
                                if (numPrice > 0) appState.prices.pizzaLibreG = numPrice;
                            }
                        } else if (cat === 'pizzas') {
                            var cleanName = n.replace(/^pizza\s+/i, '').trim();
                            if (numPrice > 0) {
                                dbPizzas.push({
                                    name: cleanName,
                                    precioEntera: numPrice,
                                    precioMedia: Math.round(numPrice / 2)
                                });
                            }
                        } else {
                            // Es una bebida
                            dbBeverages.push({
                                name: n,
                                price: numPrice,
                                category: resolveBeverageCategory(n, prod.categoria)
                            });
                        }
                    });

                    // REEMPLAZAR la lista local con lo que viene de la BDD
                    if (dbBeverages.length > 0) {
                        appState.prices.beverages = dbBeverages;
                    }
                    if (dbPizzas.length > 0) {
                        appState.prices.preciosPizzas = dbPizzas;
                    }
                }
            }
        } catch (err) {
            console.error('Error sincronizando con Neon DB en la nube:', err);
        }
    }

    // Garantizar precios validos
    if (!appState.prices.precioMenuMartes) appState.prices.precioMenuMartes = DEFAULT_PRICES.precioMenuMartes;
    if (!appState.prices.precioMenuMiercoles) appState.prices.precioMenuMiercoles = DEFAULT_PRICES.precioMenuMiercoles;
    if (!appState.prices.precioMenuViernes) appState.prices.precioMenuViernes = DEFAULT_PRICES.precioMenuViernes;
    if (!appState.prices.precioMenuDomingo) appState.prices.precioMenuDomingo = DEFAULT_PRICES.precioMenuDomingo;
    if (!appState.prices.precioPostre) appState.prices.precioPostre = DEFAULT_PRICES.precioPostre;
    if (!appState.prices.empanada) appState.prices.empanada = DEFAULT_PRICES.empanada;
}

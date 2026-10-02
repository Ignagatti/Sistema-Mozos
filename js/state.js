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

let lastSavedTablesStr = "[]";
let lastSavedBarOrdersStr = "[]";

let isSyncing = false;

// Persistencia: localStorage + archivo local userData + Neon Cloud PostgreSQL DB
async function saveState() {
    isSyncing = true;
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

        // Differencial de Mesas
        const currentTablesStr = JSON.stringify(appState.tables);
        if (currentTablesStr !== lastSavedTablesStr) {
            const currentTables = JSON.parse(currentTablesStr);
            const oldTables = JSON.parse(lastSavedTablesStr);
            
            const tablePromises = [];
            currentTables.forEach(t => {
                const oldT = oldTables.find(o => o.id === t.id);
                if (!oldT || JSON.stringify(oldT) !== JSON.stringify(t)) {
                    tablePromises.push(saveEntity(t, 'table'));
                }
            });
            oldTables.forEach(o => {
                if (!currentTables.find(t => t.id === o.id)) {
                    tablePromises.push(deleteEntityFromCloud(o.id));
                }
            });
            await Promise.all(tablePromises);
            lastSavedTablesStr = currentTablesStr;
        }

        // Differencial de Barra
        const currentBarStr = JSON.stringify(appState.barOrders);
        if (currentBarStr !== lastSavedBarOrdersStr) {
            const currentBar = JSON.parse(currentBarStr);
            const oldBar = JSON.parse(lastSavedBarOrdersStr);
            
            const barPromises = [];
            currentBar.forEach(t => {
                const oldT = oldBar.find(o => o.id === t.id);
                if (!oldT || JSON.stringify(oldT) !== JSON.stringify(t)) {
                    barPromises.push(saveEntity(t, 'barOrder'));
                }
            });
            oldBar.forEach(o => {
                if (!currentBar.find(t => t.id === o.id)) {
                    barPromises.push(deleteEntityFromCloud(o.id));
                }
            });
            await Promise.all(barPromises);
            lastSavedBarOrdersStr = currentBarStr;
        }

        // Snapshot global (modo, mozo, nextTableNumber, etc. SIN tablas para ahorrar DB)
        const globalSnapshot = { ...snapshot, tables: [], barOrders: [] };
        if (typeof window.electronAPI.syncCloudState === 'function') {
            await window.electronAPI.syncCloudState(globalSnapshot).catch(err => console.error('Error sincronizando con Neon DB:', err));
        }
    }
    isSyncing = false;
}

async function pollCloudState(activeEntityId) {
    if (isSyncing) return;
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.loadCloudData === 'function') {
        try {
            const cloudRes = await window.electronAPI.loadCloudData();
            // Verificar isSyncing de nuevo después de la llamada de red, para evitar
            // que un save local que empezó durante el fetch pise los datos
            if (isSyncing) return;
            if (cloudRes && cloudRes.success && cloudRes.cloudEntities) {
                let needsRender = false;
                const loadedTables = [];
                const loadedBarOrders = [];
                cloudRes.cloudEntities.forEach(entity => {
                    if (entity.entity_type === 'table') loadedTables.push(entity.data);
                    else if (entity.entity_type === 'barOrder') loadedBarOrders.push(entity.data);
                });

                // Merge Tables
                loadedTables.forEach(cloudTable => {
                    const localIdx = appState.tables.findIndex(t => t.id === cloudTable.id);
                    if (localIdx === -1) {
                        appState.tables.push(cloudTable);
                        needsRender = true;
                    } else {
                        // Skip if currently being edited
                        if (activeEntityId === cloudTable.id) return;
                        if (JSON.stringify(appState.tables[localIdx]) !== JSON.stringify(cloudTable)) {
                            appState.tables[localIdx] = cloudTable;
                            needsRender = true;
                        }
                    }
                });
                
                // Remove local tables deleted in cloud
                // Solo borrar si la nube tiene al menos 1 mesa (protección contra lag de red)
                if (loadedTables.length > 0) {
                    for (let i = appState.tables.length - 1; i >= 0; i--) {
                        const t = appState.tables[i];
                        if (!loadedTables.find(ct => ct.id === t.id)) {
                            if (activeEntityId === t.id) continue;
                            appState.tables.splice(i, 1);
                            needsRender = true;
                        }
                    }
                }

                // Merge Bar Orders (similar logic)
                loadedBarOrders.forEach(cloudBar => {
                    const localIdx = appState.barOrders.findIndex(t => t.id === cloudBar.id);
                    if (localIdx === -1) {
                        appState.barOrders.push(cloudBar);
                        needsRender = true;
                    } else {
                        if (activeEntityId === cloudBar.id) return;
                        if (JSON.stringify(appState.barOrders[localIdx]) !== JSON.stringify(cloudBar)) {
                            appState.barOrders[localIdx] = cloudBar;
                            needsRender = true;
                        }
                    }
                });
                if (loadedBarOrders.length > 0) {
                    for (let i = appState.barOrders.length - 1; i >= 0; i--) {
                        const t = appState.barOrders[i];
                        if (!loadedBarOrders.find(ct => ct.id === t.id)) {
                            if (activeEntityId === t.id) continue;
                            appState.barOrders.splice(i, 1);
                            needsRender = true;
                        }
                    }
                }

                if (needsRender) {
                    lastSavedTablesStr = JSON.stringify(appState.tables);
                    lastSavedBarOrdersStr = JSON.stringify(appState.barOrders);
                    if (typeof window.renderAll === 'function') window.renderAll();
                }
            }
        } catch (e) {
            console.error('Polling error', e);
        }
    }
}

async function saveEntity(entity, type) {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.saveCloudEntity === 'function') {
        return window.electronAPI.saveCloudEntity({ entity, type }).catch(err => console.error('Error saving entity:', err));
    }
}

async function deleteEntityFromCloud(id) {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.deleteCloudEntity === 'function') {
        return window.electronAPI.deleteCloudEntity({ id }).catch(err => console.error('Error deleting entity:', err));
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
                // Cargar estado operativo del snapshot (modo, contador)
                if (cloudRes.snapshot) {
                    const snap = cloudRes.snapshot;
                    if (snap.nextTableNumber) appState.nextTableNumber = snap.nextTableNumber;
                    if (snap.currentMode) appState.currentMode = snap.currentMode;
                    if (snap.numeroCocina) appState.numeroCocina = snap.numeroCocina;
                    if (snap.genericData) appState.genericData = Object.assign({}, DEFAULT_GENERIC_DATA, snap.genericData);
                }
                
                // Cargar mesas y barra desde pos_entities
                if (cloudRes.cloudEntities && Array.isArray(cloudRes.cloudEntities)) {
                    const loadedTables = [];
                    const loadedBarOrders = [];
                    cloudRes.cloudEntities.forEach(entity => {
                        if (entity.entity_type === 'table') loadedTables.push(entity.data);
                        else if (entity.entity_type === 'barOrder') loadedBarOrders.push(entity.data);
                    });
                    if (loadedTables.length > 0) appState.tables = loadedTables;
                    if (loadedBarOrders.length > 0) appState.barOrders = loadedBarOrders;
                } else if (cloudRes.snapshot) { // Fallback al viejo snapshot si no hay entities
                    const snap = cloudRes.snapshot;
                    if (snap.tables && snap.tables.length > 0) appState.tables = snap.tables;
                    if (snap.barOrders && snap.barOrders.length > 0) appState.barOrders = snap.barOrders;
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

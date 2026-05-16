// Tests unitarios para js/calculations.js
// Ejecutar con: node tests/calculations.test.js

const { getPizzaPrice, calculatePizzaPrice, calculateTotal, calculateGrandTotal } = require('../js/calculations.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passed++;
    } catch (e) {
        console.log(`  ✗ ${name}`);
        console.log(`    → ${e.message}`);
        failed++;
    }
}

function assertEqual(actual, expected, msg = '') {
    if (actual !== expected) {
        throw new Error(`${msg ? msg + ' — ' : ''}esperado: ${expected}, recibido: ${actual}`);
    }
}

function assertClose(actual, expected, tolerance = 0.01) {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`esperado: ~${expected}, recibido: ${actual}`);
    }
}

// ── Datos de prueba ──────────────────────────────────────────────────────────
const prices = {
    pizzaLibreH: 10000, pizzaLibreM: 9000, pizzaLibreG: 9500,
    empanada: 500, precioPostre: 1000,
    precioMenuMiercoles: 8000, precioMenuViernes: 8500,
    precioMenuSabado: 9000, precioMenuDomingo: 7500,
    preciosPizzas: [
        { name: 'Muzzarella', precioEntera: 4000, precioMedia: 2000 },
        { name: 'Jamon',      precioEntera: 5000, precioMedia: 2500 },
        { name: 'Roquefort',  precioEntera: 6000, precioMedia: 3000 }
    ],
    beverages: [
        { name: 'Coca',   price: 1000, category: 'gaseosa' },
        { name: 'Heineken', price: 2000, category: 'cerveza' }
    ]
};

function emptyOrder(overrides = {}) {
    return Object.assign({
        pizzaLibreH: 0, pizzaLibreM: 0, pizzaLibreG: 0,
        menores: 0, menorPrice: 0, empanadas: 0, postres: 0, menu: 0,
        beverages: [], pizzasPersonalizadas: []
    }, overrides);
}

// ── getPizzaPrice ────────────────────────────────────────────────────────────
console.log('\ngetPizzaPrice');
test('precio entera correcto', () => assertEqual(getPizzaPrice('Muzzarella', 'entera', prices), 4000));
test('precio media correcto',  () => assertEqual(getPizzaPrice('Muzzarella', 'media',  prices), 2000));
test('gusto inexistente da 0', () => assertEqual(getPizzaPrice('Anchoas',    'entera', prices), 0));

// ── calculatePizzaPrice ──────────────────────────────────────────────────────
console.log('\ncalculatePizzaPrice');
test('entera 1 gusto', () => {
    assertEqual(calculatePizzaPrice({ size: 'entera', toppings: ['Muzzarella'] }, prices), 4000);
});
test('entera 2 gustos (mitad/mitad)', () => {
    // (4000/2) + (5000/2) = 2000 + 2500 = 4500
    assertEqual(calculatePizzaPrice({ size: 'entera', toppings: ['Muzzarella', 'Jamon'] }, prices), 4500);
});
test('entera 3 gustos (1/2 + 1/4 + 1/4)', () => {
    // (4000/2) + (5000/4) + (6000/4) = 2000 + 1250 + 1500 = 4750
    assertEqual(calculatePizzaPrice({ size: 'entera', toppings: ['Muzzarella', 'Jamon', 'Roquefort'] }, prices), 4750);
});
test('media 1 gusto', () => {
    assertEqual(calculatePizzaPrice({ size: 'media', toppings: ['Muzzarella'] }, prices), 2000);
});
test('media 2 gustos', () => {
    // (2000/2) + (2500/2) = 1000 + 1250 = 2250
    assertEqual(calculatePizzaPrice({ size: 'media', toppings: ['Muzzarella', 'Jamon'] }, prices), 2250);
});
test('sin toppings da 0', () => {
    assertEqual(calculatePizzaPrice({ size: 'entera', toppings: [] }, prices), 0);
});

// ── calculateTotal ───────────────────────────────────────────────────────────
console.log('\ncalculateTotal');
test('pizza libre jueves — suma hombres y mujeres', () => {
    const order = emptyOrder({ pizzaLibreH: 2, pizzaLibreM: 1 });
    // 2*10000 + 1*9000 = 29000
    assertEqual(calculateTotal(order, prices, 'jueves'), 29000);
});
test('pizza libre NO se suma en miercoles', () => {
    const order = emptyOrder({ pizzaLibreH: 5, pizzaLibreM: 5, pizzaLibreG: 5 });
    assertEqual(calculateTotal(order, prices, 'miercoles'), 0);
});
test('menú miercoles', () => {
    const order = emptyOrder({ menu: 3 });
    // 3 * 8000 = 24000
    assertEqual(calculateTotal(order, prices, 'miercoles'), 24000);
});
test('menú viernes usa precio de viernes', () => {
    const order = emptyOrder({ menu: 2 });
    assertEqual(calculateTotal(order, prices, 'viernes'), 17000); // 2 * 8500
});
test('menú domingo usa precio de domingo', () => {
    const order = emptyOrder({ menu: 1 });
    assertEqual(calculateTotal(order, prices, 'domingo'), 7500);
});
test('empanadas', () => {
    const order = emptyOrder({ empanadas: 4 });
    assertEqual(calculateTotal(order, prices, 'miercoles'), 2000); // 4 * 500
});
test('menores con precio variable', () => {
    const order = emptyOrder({ menores: 2, menorPrice: 3000 });
    assertEqual(calculateTotal(order, prices, 'miercoles'), 6000);
});
test('postres', () => {
    const order = emptyOrder({ postres: 3 });
    assertEqual(calculateTotal(order, prices, 'miercoles'), 3000); // 3 * 1000
});
test('bebidas', () => {
    const order = emptyOrder({ beverages: [{ name: 'Coca', quantity: 3 }] });
    assertEqual(calculateTotal(order, prices, 'miercoles'), 3000); // 3 * 1000
});
test('bebida desconocida no tira error', () => {
    const order = emptyOrder({ beverages: [{ name: 'Inexistente', quantity: 5 }] });
    assertEqual(calculateTotal(order, prices, 'miercoles'), 0);
});
test('pizza personalizada incluida en total', () => {
    const order = emptyOrder({
        pizzasPersonalizadas: [{ size: 'entera', toppings: ['Muzzarella'] }]
    });
    assertEqual(calculateTotal(order, prices, 'sabado'), 4000);
});
test('total combinado: pizza libre + empanadas + bebida (sabado)', () => {
    const order = emptyOrder({
        pizzaLibreH: 1,
        empanadas:   2,
        beverages:   [{ name: 'Heineken', quantity: 1 }]
    });
    // 10000 + 2*500 + 2000 = 13000
    assertEqual(calculateTotal(order, prices, 'sabado'), 13000);
});

// ── calculateGrandTotal ──────────────────────────────────────────────────────
console.log('\ncalculateGrandTotal');
test('suma mesas y barra', () => {
    const tables    = [{ order: emptyOrder({ menu: 2 }) }];
    const barOrders = [{ order: emptyOrder({ menu: 1 }) }];
    // (2 + 1) * 8000 = 24000
    assertEqual(calculateGrandTotal(tables, barOrders, prices, 'miercoles'), 24000);
});
test('sin pedidos da 0', () => {
    assertEqual(calculateGrandTotal([], [], prices, 'miercoles'), 0);
});

// ── Resultado final ──────────────────────────────────────────────────────────
console.log(`\n${passed} pasaron, ${failed} fallaron\n`);
if (failed > 0) process.exit(1);

// Test: simula el bug de inicialización que impide la subida inicial a pos_entities
// Reproduce exactamente lo que pasa en la app al arrancar

console.log('=== TEST: Bug de inicialización de diff ===\n');

// Simular el estado después de loadState() (mesas cargadas desde localStorage)
const appState = {
    tables: [
        { id: 'table-abc', number: '1', x: 100, y: 200, order: {} },
        { id: 'table-def', number: '2', x: 300, y: 200, order: {} }
    ],
    barOrders: [
        { id: 'bar-123', clientName: 'Juan', order: {} }
    ]
};

// Esto es lo que hace la app al arrancar (líneas 1789-1792 de app.js):
let lastSavedTablesStr = JSON.stringify(appState.tables);
let lastSavedBarOrdersStr = JSON.stringify(appState.barOrders);

console.log('Después de loadState, appState tiene:');
console.log(`  ${appState.tables.length} mesas`);
console.log(`  ${appState.barOrders.length} pedidos de barra`);
console.log(`  lastSavedTablesStr = ${lastSavedTablesStr.substring(0, 60)}...`);

// Ahora simular lo que hace saveState():
const currentTablesStr = JSON.stringify(appState.tables);
const isDifferent = currentTablesStr !== lastSavedTablesStr;

console.log(`\nEn saveState():`);
console.log(`  currentTablesStr === lastSavedTablesStr? ${currentTablesStr === lastSavedTablesStr}`);
console.log(`  ¿Se ejecuta el bloque diferencial? ${isDifferent ? 'SÍ' : 'NO'}`);

if (!isDifferent) {
    console.log(`\n  ❌❌❌ BUG CONFIRMADO: saveState() piensa que las mesas YA están en la nube`);
    console.log('  porque lastSavedTablesStr fue inicializado con el contenido de localStorage.');
    console.log('  Las mesas NUNCA se suben a pos_entities.');
    console.log('  PC-2 consulta pos_entities → está vacía → no ve nada.');
}

// Solución: inicializar lastSavedTablesStr como "[]" para que el primer saveState suba todo
console.log('\n=== SOLUCIÓN ===');
let fixedLastSavedTablesStr = "[]"; // NO inicializar con el estado actual
const isDifferentFixed = currentTablesStr !== fixedLastSavedTablesStr;
console.log(`  Con fix: currentTablesStr !== "[]"? ${isDifferentFixed}`);
console.log(`  ¿Se ejecuta el bloque diferencial? ${isDifferentFixed ? 'SÍ ✅' : 'NO'}`);

if (isDifferentFixed) {
    console.log('  ✅ Ahora saveState() detecta que las mesas son "nuevas" respecto a la nube');
    console.log('  y las sube a pos_entities al primer guardado.');
}

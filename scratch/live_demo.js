const { _electron: electron } = require('playwright');
const path = require('path');

(async () => {
  console.log('Iniciando demo en vivo para el usuario...');
  
  const electronApp = await electron.launch({
    args: ['.', '--user-data-dir=scratch/demo_bot'],
    env: process.env,
  });
  
  const window = await electronApp.firstWindow();
  console.log('Ventana cargada. Esperando a que el DOM esté listo...');
  
  await window.waitForLoadState('domcontentloaded');
  
  console.log('¡Hola! Soy Antigravity. Mira como muevo el sistema automáticamente...');
  await window.waitForTimeout(2000);
  
  console.log('1. Cambiando de Mozo...');
  await window.selectOption('#mozo-switcher', 'Mozo 2');
  await window.waitForTimeout(1000);

  console.log('2. Añadiendo un pedido rápido en barra...');
  await window.fill('#bar-client-name', 'El Bot');
  await window.waitForTimeout(1000);
  await window.click('#add-bar-order-btn');
  await window.waitForTimeout(1500);
  
  console.log('3. Abriendo el pedido...');
  const botOrder = window.getByText('El Bot', { exact: false }).last();
  await botOrder.click();
  await window.waitForTimeout(1500);
  
  console.log('4. Armando una pizza mitad y mitad...');
  await window.click('#add-half-pizza-btn');
  await window.waitForTimeout(1000);
  await window.selectOption('#half-pizza-1', 'Muzzarella');
  await window.waitForTimeout(800);
  await window.selectOption('#half-pizza-2', 'Napolitana');
  await window.waitForTimeout(800);
  await window.click('#confirm-half-pizza-btn');
  await window.waitForTimeout(1500);
  
  console.log('5. Añadiendo dos latas de Coca...');
  await window.selectOption('#beverage-select', 'Lata de Coca-Cola');
  await window.waitForTimeout(800);
  await window.fill('#beverage-quantity', '2');
  await window.waitForTimeout(800);
  await window.click('#add-beverage-btn');
  await window.waitForTimeout(1500);
  
  console.log('6. Pagando el pedido...');
  await window.click('#pay-table-btn');
  await window.waitForTimeout(1500);
  await window.fill('#payment-amount-input', '100000'); // pagando mas de lo que cuesta para ver vuelto
  await window.waitForTimeout(1000);
  await window.click('#confirm-payment-btn');
  await window.waitForTimeout(1500);
  
  console.log('7. Cerrando la orden...');
  await window.click('#close-order-modal-btn');
  await window.waitForTimeout(1500);

  // MESA TEST
  console.log('8. Ahora vamos a agregar una MESA real...');
  await window.click('#add-table-btn');
  await window.waitForTimeout(1500);
  
  console.log('Abriendo la mesa más nueva...');
  const newTable = window.locator('.mesa').last();
  await newTable.click();
  await window.waitForTimeout(1500);
  
  console.log('Agregando un menú a la mesa...');
  await window.click('#add-menu-btn');
  await window.waitForTimeout(1000);
  await window.click('#close-order-modal-btn');
  await window.waitForTimeout(1500);
  
  // ELIMINACIONES
  console.log('9. Eliminando el pedido de la barra para no ensuciar tu BD...');
  await botOrder.click();
  await window.waitForTimeout(1500);
  await window.click('#delete-entity-btn');
  await window.waitForTimeout(1500);
  await window.click('#delete-entity-btn'); // Confirmar
  await window.waitForTimeout(1500);

  console.log('10. Eliminando la mesa de prueba (Requiere Pass)...');
  await newTable.click();
  await window.waitForTimeout(1500);
  await window.click('#delete-entity-btn');
  await window.waitForTimeout(1500);
  
  // Ingresar clave
  await window.fill('#password-input', 'bochas');
  await window.waitForTimeout(1000);
  await window.click('#confirm-password-btn');
  await window.waitForTimeout(1500);
  
  console.log('11. Abriendo el Reporte de Ventas para ver las métricas finales...');
  await window.click('#show-sales-report-btn');
  await window.waitForTimeout(4000);
  console.log('Cerrando reporte...');
  await window.click('#close-sales-report-btn');
  await window.waitForTimeout(1500);
  
  console.log('¡Demo E2E completada con éxito!');
  await window.waitForTimeout(3000);
  
  await electronApp.close();
})();

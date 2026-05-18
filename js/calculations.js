function getPizzaPrice(toppingName, size, prices) {
    const pizzaData = prices.preciosPizzas.find(p => p.name === toppingName);
    if (!pizzaData) return 0;
    return size === 'entera' ? pizzaData.precioEntera : pizzaData.precioMedia;
}

function calculatePizzaPrice(pizza, prices) {
    const toppings = pizza.toppings;

    if (pizza.size === 'media') {
        if (toppings.length === 1) return getPizzaPrice(toppings[0], 'media', prices);
        if (toppings.length === 2) return (getPizzaPrice(toppings[0], 'media', prices) / 2) + (getPizzaPrice(toppings[1], 'media', prices) / 2);
        return 0;
    }

    // entera
    if (toppings.length === 1) return getPizzaPrice(toppings[0], 'entera', prices);
    if (toppings.length === 2) return (getPizzaPrice(toppings[0], 'entera', prices) / 2) + (getPizzaPrice(toppings[1], 'entera', prices) / 2);
    if (toppings.length === 3) return (getPizzaPrice(toppings[0], 'entera', prices) / 2) + (getPizzaPrice(toppings[1], 'entera', prices) / 4) + (getPizzaPrice(toppings[2], 'entera', prices) / 4);
    return 0;
}

function calculateTotal(order, prices, currentMode) {
    let total = 0;

    if (currentMode === 'jueves' || currentMode === 'sabado') {
        total += (order.pizzaLibreH || 0) * prices.pizzaLibreH;
        total += (order.pizzaLibreM || 0) * prices.pizzaLibreM;
        total += (order.pizzaLibreG || 0) * prices.pizzaLibreG;
    }

    if (currentMode === 'martes')         total += (order.menu || 0) * prices.precioMenuMartes;
    else if (currentMode === 'miercoles') total += (order.menu || 0) * prices.precioMenuMiercoles;
    else if (currentMode === 'viernes')   total += (order.menu || 0) * prices.precioMenuViernes;
    else if (currentMode === 'domingo')   total += (order.menu || 0) * prices.precioMenuDomingo;

    total += (order.empanadas || 0) * prices.empanada;
    total += (order.menores   || 0) * (order.menorPrice || 0);
    total += (order.postres   || 0) * prices.precioPostre;

    if (order.pizzasPersonalizadas) {
        order.pizzasPersonalizadas.forEach(pizza => {
            total += calculatePizzaPrice(pizza, prices);
        });
    }

    if (order.beverages) {
        order.beverages.forEach(bev => {
            const priceInfo = prices.beverages.find(p => p.name === bev.name);
            if (priceInfo) total += bev.quantity * priceInfo.price;
        });
    }

    return total;
}

function calculateGrandTotal(tables, barOrders, prices, currentMode) {
    let grand = 0;
    tables.forEach(t  => { grand += calculateTotal(t.order,     prices, currentMode); });
    barOrders.forEach(o => { grand += calculateTotal(o.order, prices, currentMode); });
    return grand;
}

// Exportar para Node.js (tests), sin romper el uso en browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getPizzaPrice, calculatePizzaPrice, calculateTotal, calculateGrandTotal };
}

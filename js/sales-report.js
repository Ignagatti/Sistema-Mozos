/**
 * js/sales-report.js
 * Reporte General de Ventas, Rotación y Gustos de Pizza
 * Generador de Gráficos Vectoriales SVG y Descarga Directa de PDF (A4)
 * Sistema de Gestión - Club Bochas
 */

const SalesReportManager = (() => {

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatCurrency(amount) {
        const num = Number(amount) || 0;
        return '$ ' + num.toLocaleString('es-AR', {
            minimumFractionDigits: num % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2
        });
    }

    function formatNumber(num) {
        return (Number(num) || 0).toLocaleString('es-AR');
    }

    function formatPercent(pct) {
        const num = Number(pct) || 0;
        return num.toFixed(1) + '%';
    }

    function formatDate(dateStr) {
        const d = dateStr ? new Date(dateStr) : new Date();
        return d.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Genera el nombre del archivo PDF con el DÍA de operación y la FECHA (DD-MM-YYYY)
     * Ejemplo: Reporte-Ventas-Miercoles-18-08-2026.pdf
     */
    function getReportFileName(report) {
        const dayName = capitalizeFirstLetter(report.currentMode || 'Turno');
        const now = report.generatedAt ? new Date(report.generatedAt) : new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const formattedDate = `${dd}-${mm}-${yyyy}`;

        return `Reporte-Ventas-${dayName}-${formattedDate}.pdf`;
    }

    // ── GRÁFICOS VECTORIALES SVG ───────────────────────────────────────────────

    function createSvgDonutChart(slices, size = 240, thickness = 38) {
        const total = slices.reduce((sum, s) => sum + (s.value || 0), 0);
        
        if (total <= 0) {
            return `
                <div class="flex flex-col items-center justify-center p-6 text-gray-400 text-sm">
                    <svg width="70" height="70" viewBox="0 0 100 100" class="mb-2 opacity-50">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="12" />
                    </svg>
                    <span>Sin datos para graficar</span>
                </div>
            `;
        }

        const radius = size / 2;
        const center = radius;
        const innerRadius = radius - thickness;

        let accumulatedAngle = -Math.PI / 2;
        let pathsSvg = '';

        slices.filter(s => (s.value || 0) > 0).forEach(slice => {
            const sliceAngle = (slice.value / total) * 2 * Math.PI;
            const startAngle = accumulatedAngle;
            const endAngle = accumulatedAngle + sliceAngle;
            accumulatedAngle = endAngle;

            const isFullCircle = sliceAngle >= 2 * Math.PI - 0.001;

            let pathD = '';
            if (isFullCircle) {
                pathD = `
                    M ${center} ${center - radius}
                    A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius}
                    L ${center - 0.01} ${center - innerRadius}
                    A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius}
                    Z
                `;
            } else {
                const x1 = center + radius * Math.cos(startAngle);
                const y1 = center + radius * Math.sin(startAngle);
                const x2 = center + radius * Math.cos(endAngle);
                const y2 = center + radius * Math.sin(endAngle);

                const ix1 = center + innerRadius * Math.cos(endAngle);
                const iy1 = center + innerRadius * Math.sin(endAngle);
                const ix2 = center + innerRadius * Math.cos(startAngle);
                const iy2 = center + innerRadius * Math.sin(startAngle);

                const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

                pathD = `
                    M ${x1} ${y1}
                    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                    L ${ix1} ${iy1}
                    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}
                    Z
                `;
            }

            pathsSvg += `
                <path d="${pathD}" fill="${slice.color}" stroke="#ffffff" stroke-width="2">
                    <title>${escapeHtml(slice.label)}: ${formatCurrency(slice.value)} (${formatPercent((slice.value / total) * 100)})</title>
                </path>
            `;
        });

        const legendItems = slices.filter(s => (s.value || 0) > 0).map(slice => {
            const pct = (slice.value / total) * 100;
            return `
                <div class="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                    <div class="flex items-center gap-1.5 min-w-0 pr-2">
                        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${slice.color}"></span>
                        <span class="font-medium text-gray-700 truncate">${escapeHtml(slice.label)}</span>
                    </div>
                    <div class="text-right whitespace-nowrap">
                        <span class="font-bold text-gray-900">${formatCurrency(slice.value)}</span>
                        <span class="text-gray-500 text-[10px] ml-1">(${formatPercent(pct)})</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="flex flex-col sm:flex-row items-center gap-4">
                <div class="relative flex-shrink-0" style="width:${size}px; height:${size}px;">
                    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                        ${pathsSvg}
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                        <span class="text-sm font-extrabold text-gray-800 leading-tight">${formatCurrency(total)}</span>
                    </div>
                </div>
                <div class="w-full flex-1">
                    ${legendItems}
                </div>
            </div>
        `;
    }

    function createSvgHorizontalBarChart(items, maxValue, options = {}) {
        if (!items || items.length === 0) {
            return `<div class="text-gray-400 text-xs py-4 text-center">No hay datos registrados</div>`;
        }

        const max = maxValue || Math.max(...items.map(i => i.value), 1);

        return items.map((item, index) => {
            const pct = Math.min(100, Math.max(0, (item.value / max) * 100));
            const barColor = item.color || '#3B82F6';
            const rankBadge = options.showRank ? `<span class="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-bold text-[10px] mr-2">${index + 1}</span>` : '';

            return `
                <div class="mb-2.5">
                    <div class="flex items-center justify-between text-xs mb-1">
                        <div class="flex items-center font-semibold text-gray-800 truncate pr-2">
                            ${rankBadge}
                            <span class="truncate">${item.icon ? item.icon + ' ' : ''}${escapeHtml(item.label)}</span>
                        </div>
                        <div class="text-right whitespace-nowrap">
                            <span class="font-bold text-gray-900">${item.formattedValue || item.value}</span>
                            ${item.subValue ? `<span class="text-gray-500 text-[10px] ml-1">(${item.subValue})</span>` : ''}
                        </div>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${barColor};"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ── RENDERIZADO DEL MODAL DASHBOARD ───────────────────────────────────────

    function renderModalDashboard(report) {
        const modeName = capitalizeFirstLetter(report.currentMode);
        const dateStr = formatDate(report.generatedAt);
        const generic = report.genericData || {};
        const gustosPizza = report.gustosPizzaMasVendidos || [];
        const gustosSinVentas = report.gustosPizzaSinVentas || [];

        // Gráficos
        const rubrosSlices = report.categoryBreakdown.map(cat => ({
            label: cat.label,
            value: cat.subtotal,
            color: cat.color
        }));

        const bebidasCatItems = report.beverageCategoryBreakdown.map(cat => ({
            label: cat.label,
            icon: cat.icon,
            value: cat.subtotal,
            formattedValue: formatCurrency(cat.subtotal),
            subValue: `${cat.units} un.`,
            color: cat.color
        }));
        const maxBebidaCat = Math.max(...report.beverageCategoryBreakdown.map(b => b.subtotal), 1);

        const topBebidas = report.allBeveragesList
            .filter(b => b.units > 0)
            .sort((a, b) => b.units - a.units)
            .slice(0, 5)
            .map(b => ({
                label: b.name,
                icon: '🥤',
                value: b.units,
                formattedValue: `${b.units} un.`,
                subValue: formatCurrency(b.subtotal),
                color: '#06B6D4'
            }));
        const maxTopBebidas = topBebidas.length > 0 ? Math.max(...topBebidas.map(b => b.value)) : 1;

        return `
            <!-- Encabezado del Reporte -->
            <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl mb-6 shadow-md border border-slate-800">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">Reporte de Ventas</span>
                            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase">Día: ${modeName}</span>
                        </div>
                        <h2 class="text-2xl font-black tracking-tight">${escapeHtml(generic.establishmentName || 'Sistema de Gestión')}</h2>
                        <p class="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <span>📅 ${dateStr}</span>
                            ${generic.address ? `<span class="mx-1">•</span><span>📍 ${escapeHtml(generic.address)}</span>` : ''}
                        </p>
                    </div>
                    <div class="text-right bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/10 w-full sm:w-auto">
                        <span class="text-[11px] uppercase tracking-wider text-slate-300 font-bold block">Total Recaudado</span>
                        <span class="text-3xl font-black text-emerald-400">${formatCurrency(report.totalRecaudado)}</span>
                    </div>
                </div>
            </div>

            <!-- KPI Cards Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                    <span class="text-xs font-bold uppercase text-gray-500 block">Total Facturado</span>
                    <span class="text-2xl font-black text-emerald-600 mt-1 block">${formatCurrency(report.totalRecaudado)}</span>
                    <span class="text-[11px] text-gray-400">Total en caja del turno</span>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                    <span class="text-xs font-bold uppercase text-gray-500 block">Unidades Vendidas</span>
                    <span class="text-2xl font-black text-gray-900 mt-1 block">${formatNumber(report.totalUnidades)}</span>
                    <span class="text-[11px] text-gray-400">Artículos totales despachados</span>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                    <span class="text-xs font-bold uppercase text-gray-500 block">Comensales Registrados</span>
                    <span class="text-2xl font-black text-purple-700 mt-1 block">${formatNumber(report.totalPersonas)}</span>
                    <span class="text-[11px] text-gray-400">Personas atendidas</span>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                    <span class="text-xs font-bold uppercase text-gray-500 block">Ticket Promedio</span>
                    <span class="text-2xl font-black text-indigo-700 mt-1 block">${formatCurrency(report.ticketPromedio)}</span>
                    <span class="text-[11px] text-gray-400">Gasto medio por pedido</span>
                </div>
            </div>

            <!-- SECCIÓN 1: LO QUE MÁS SE VENDIÓ Y GUSTOS DE PIZZA -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- 🏆 LO QUE MÁS SE VENDIÓ -->
                <div class="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden flex flex-col justify-between">
                    <div class="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">🏆</span>
                            <h3 class="font-extrabold text-sm text-emerald-950 tracking-wide uppercase">Lo que MÁS se Vendió</h3>
                        </div>
                        <span class="bg-emerald-200 text-emerald-900 font-bold text-xs px-2.5 py-0.5 rounded-full">Top ventas</span>
                    </div>
                    <div class="p-4 space-y-2.5 flex-1 max-h-72 overflow-y-auto">
                        ${report.topVendidos.slice(0, 10).map((item, idx) => `
                            <div class="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                                <div class="min-w-0 pr-2">
                                    <div class="flex items-center gap-1.5">
                                        <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">${idx + 1}</span>
                                        <span class="font-bold text-gray-900 text-xs truncate">Se vendieron <strong>${item.units}</strong> x ${escapeHtml(item.name)}</span>
                                    </div>
                                    <span class="text-[10px] text-gray-500 block mt-0.5 ml-6">Precio unitario: ${formatCurrency(item.unitPrice)}</span>
                                </div>
                                <div class="text-right whitespace-nowrap">
                                    <span class="font-black text-emerald-800 text-xs">${formatCurrency(item.subtotal)}</span>
                                    <span class="text-[10px] text-gray-500 block">${formatPercent(report.totalRecaudado > 0 ? (item.subtotal / report.totalRecaudado) * 100 : 0)}</span>
                                </div>
                            </div>
                        `).join('') || '<div class="text-gray-400 text-xs py-4 text-center">Sin ventas registradas</div>'}
                    </div>
                </div>

                <!-- 🍕 GUSTOS DE PIZZA QUE MÁS SALEN -->
                <div class="bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden flex flex-col justify-between">
                    <div class="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">🍕</span>
                            <h3 class="font-extrabold text-sm text-amber-950 tracking-wide uppercase">Gustos de Pizza que Más Salen</h3>
                        </div>
                        <span class="bg-amber-200 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-full">Sabores</span>
                    </div>
                    <div class="p-4 space-y-2.5 flex-1 max-h-72 overflow-y-auto">
                        ${gustosPizza.length > 0 ? gustosPizza.map((g, idx) => `
                            <div class="p-2 rounded-lg bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
                                <div class="flex items-center gap-2 min-w-0 pr-2">
                                    <span class="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">${idx + 1}</span>
                                    <span class="font-bold text-gray-800 truncate">${escapeHtml(g.name)}</span>
                                </div>
                                <span class="font-black text-amber-900 whitespace-nowrap bg-amber-100 px-2 py-0.5 rounded-full">${g.count} pizzas/porciones</span>
                            </div>
                        `).join('') : `
                            <div class="text-gray-400 text-xs py-4 text-center">
                                ${report.isPizzaLibreMode ? 'No se registraron pizzas por gusto específicas en este turno.' : 'Modalidad de Menú activo (sin pedidos de pizza por gusto).'}
                            </div>
                        `}

                        ${gustosSinVentas.length > 0 ? `
                            <div class="pt-2 border-t border-amber-100 mt-2">
                                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Gustos sin pedidos:</span>
                                <div class="flex flex-wrap gap-1">
                                    ${gustosSinVentas.map(g => `<span class="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded">${escapeHtml(g.name)} (0)</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 2: LO QUE MENOS SE VENDIÓ Y LO QUE NO SE VENDIÓ -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- ⚠️ LO QUE MENOS SE VENDIÓ -->
                <div class="bg-white rounded-2xl border border-orange-200 shadow-xs overflow-hidden">
                    <div class="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">⚠️</span>
                            <h3 class="font-extrabold text-sm text-orange-950 tracking-wide uppercase">Lo que Menos se Vendió</h3>
                        </div>
                        <span class="bg-orange-200 text-orange-900 font-bold text-xs px-2.5 py-0.5 rounded-full">Bajas salidas</span>
                    </div>
                    <div class="p-4 space-y-2 max-h-60 overflow-y-auto">
                        ${report.menosVendidos.filter(i => i.units <= 3).slice(0, 8).map(item => `
                            <div class="p-2 rounded-lg bg-orange-50/50 border border-orange-100 flex items-center justify-between text-xs">
                                <span class="font-medium text-gray-800 truncate pr-2">Se vendieron solo <strong>${item.units}</strong> x ${escapeHtml(item.name)}</span>
                                <span class="font-bold text-orange-800 whitespace-nowrap">${formatCurrency(item.subtotal)}</span>
                            </div>
                        `).join('') || '<div class="text-gray-400 text-xs py-4 text-center">Todos los productos tuvieron buen volumen de venta</div>'}
                    </div>
                </div>

                <!-- 🚫 LO QUE NO SE VENDIÓ -->
                <div class="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
                    <div class="bg-rose-50 px-4 py-3 border-b border-rose-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">🚫</span>
                            <h3 class="font-extrabold text-sm text-rose-950 tracking-wide uppercase">Lo que NO se Vendió (0 unidades)</h3>
                        </div>
                        <span class="bg-rose-200 text-rose-900 font-bold text-xs px-2.5 py-0.5 rounded-full">${report.sinVentasList.length} artículos</span>
                    </div>
                    <div class="p-4 max-h-60 overflow-y-auto">
                        ${report.sinVentasList.length > 0 ? `
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                ${report.sinVentasList.map(item => `
                                    <div class="p-1.5 rounded-md bg-rose-50/70 border border-rose-100 text-[11px] text-gray-700 flex justify-between items-center">
                                        <span class="truncate pr-1">• ${escapeHtml(item.name)}</span>
                                        <span class="text-[10px] text-rose-600 font-bold">0 un.</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<div class="text-emerald-600 text-xs py-4 text-center font-bold">¡Excelente! Todos los productos del menú registraron ventas.</div>'}
                    </div>
                </div>
            </div>

            <!-- Gráficos Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <!-- Gráfico 1: Ventas por Rubro -->
                <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                    <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                        <h3 class="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            <span>🥧</span> Ventas por Rubro
                        </h3>
                        <span class="text-xs text-gray-400">Total $</span>
                    </div>
                    ${createSvgDonutChart(rubrosSlices, 170, 32)}
                </div>

                <!-- Gráfico 2: Bebidas por Categoría -->
                <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                    <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                        <h3 class="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            <span>🍷</span> Ventas por Tipo de Bebida
                        </h3>
                        <span class="text-xs text-gray-400">Total $</span>
                    </div>
                    <div>
                        ${createSvgHorizontalBarChart(bebidasCatItems, maxBebidaCat)}
                    </div>
                </div>

                <!-- Gráfico 3: Top 5 Bebidas -->
                <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                    <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                        <h3 class="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            <span>🥤</span> Top 5 Bebidas Más Pedidas
                        </h3>
                        <span class="text-xs text-gray-400">Unidades</span>
                    </div>
                    <div>
                        ${topBebidas.length > 0 ? createSvgHorizontalBarChart(topBebidas, maxTopBebidas, { showRank: true }) : '<div class="text-gray-400 text-xs py-4 text-center">No se registraron bebidas vendidas</div>'}
                    </div>
                </div>
            </div>

            <!-- TABLA EJECUTIVA: DETALLE CONSOLIDADO DE TODO LO VENDIDO -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-gray-900 text-base flex items-center gap-2">
                            <span>📋</span> Detalle Completo de Todo lo Vendido
                        </h3>
                        <p class="text-xs text-gray-500">Unidades despachadas, precio unitario e importes totales por artículo</p>
                    </div>
                    <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        ${report.soldItemsList.length} productos vendidos
                    </span>
                </div>

                <div class="overflow-x-auto max-h-80">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-100 text-gray-600 uppercase font-bold sticky top-0 border-b border-gray-200">
                            <tr>
                                <th class="p-3">Categoría</th>
                                <th class="p-3">Detalle de lo Vendido</th>
                                <th class="p-3 text-center">Cantidad</th>
                                <th class="p-3 text-right">Precio Unit.</th>
                                <th class="p-3 text-right">Subtotal</th>
                                <th class="p-3 text-right">% Facturación</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${report.soldItemsList.length > 0 ? report.soldItemsList.map(item => {
                                const pct = report.totalRecaudado > 0 ? ((item.subtotal / report.totalRecaudado) * 100) : 0;
                                return `
                                    <tr class="hover:bg-gray-50 transition">
                                        <td class="p-3">
                                            <span class="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px]">
                                                ${item.icon || '📦'} ${escapeHtml(item.category)}
                                            </span>
                                        </td>
                                        <td class="p-3 font-medium text-gray-900">Se vendieron <strong>${item.units}</strong> x ${escapeHtml(item.name)}</td>
                                        <td class="p-3 text-center font-bold text-indigo-700 text-sm">${item.units}</td>
                                        <td class="p-3 text-right text-gray-600">${formatCurrency(item.unitPrice)}</td>
                                        <td class="p-3 text-right font-bold text-gray-900">${formatCurrency(item.subtotal)}</td>
                                        <td class="p-3 text-right text-gray-500 font-semibold">${formatPercent(pct)}</td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr>
                                    <td colspan="6" class="p-8 text-center text-gray-400 font-medium">No se han registrado consumos en la sesión actual.</td>
                                </tr>
                            `}
                        </tbody>
                        <tfoot class="bg-gray-50 font-bold border-t-2 border-gray-200">
                            <tr>
                                <td colspan="2" class="p-3 text-gray-900 uppercase">Totales Generales</td>
                                <td class="p-3 text-center text-indigo-900 text-base">${report.totalUnidades}</td>
                                <td class="p-3 text-right text-gray-500">—</td>
                                <td class="p-3 text-right text-emerald-700 text-base">${formatCurrency(report.totalRecaudado)}</td>
                                <td class="p-3 text-right text-gray-900">100%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
    }

    // ── GENERADOR DEL DOCUMENTO PARA PDF A4 ───────────────────────────────────

    function generatePrintDocumentHTML(report) {
        const modeName = capitalizeFirstLetter(report.currentMode);
        const dateStr = formatDate(report.generatedAt);
        const generic = report.genericData || {};
        const gustosPizza = report.gustosPizzaMasVendidos || [];

        // Filas de productos vendidos
        const itemsRows = report.soldItemsList.map(item => {
            const pct = report.totalRecaudado > 0 ? ((item.subtotal / report.totalRecaudado) * 100) : 0;
            return `
                <tr>
                    <td style="padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">
                        <span style="font-size: 10px; color: #4b5563; font-weight: 600; text-transform: uppercase;">${escapeHtml(item.category)}</span>
                    </td>
                    <td style="padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; font-size: 11px; color: #111827;">Se vendieron <strong>${item.units}</strong> x ${escapeHtml(item.name)}</td>
                    <td style="padding: 5px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 700; font-size: 11px; color: #3730a3;">${item.units}</td>
                    <td style="padding: 5px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 11px; color: #4b5563;">${formatCurrency(item.unitPrice)}</td>
                    <td style="padding: 5px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; font-size: 11px; color: #111827;">${formatCurrency(item.subtotal)}</td>
                    <td style="padding: 5px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 10px; color: #6b7280;">${formatPercent(pct)}</td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="6" style="padding: 15px; text-align: center; color: #9ca3af;">Sin consumos registrados</td></tr>';

        // Filas de lo que más se vendió
        const masVendidosRows = report.topVendidos.slice(0, 6).map((item, idx) => `
            <div style="padding: 3px 0; border-bottom: 1px solid #dcfce7; font-size: 10px; display: flex; justify-content: space-between;">
                <span><strong>${idx + 1}.</strong> Se vendieron <strong>${item.units}</strong> x ${escapeHtml(item.name)}</span>
                <span><strong style="color: #166534;">${formatCurrency(item.subtotal)}</strong></span>
            </div>
        `).join('') || '<div style="font-size: 10px; color: #64748b;">Sin datos</div>';

        // Filas de gustos de pizza
        const gustosPizzaRows = gustosPizza.slice(0, 6).map((g, idx) => `
            <div style="padding: 3px 0; border-bottom: 1px solid #fef3c7; font-size: 10px; display: flex; justify-content: space-between;">
                <span><strong>${idx + 1}.</strong> ${escapeHtml(g.name)}</span>
                <span><strong>${g.count}</strong> pedidos</span>
            </div>
        `).join('') || '<div style="font-size: 10px; color: #64748b;">Sin pedidos de pizza por gusto</div>';

        // Filas de lo que no se vendió
        const sinVentasListHtml = report.sinVentasList.slice(0, 12).map(item => `
            <span style="display: inline-block; background: #fff; border: 1px solid #fecdd3; border-radius: 4px; padding: 2px 6px; margin: 2px; font-size: 9px; color: #9f1239;">
                ${escapeHtml(item.name)} (0 un.)
            </span>
        `).join('') || '<span style="font-size: 10px; color: #059669;">Todos los productos registraron ventas</span>';

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Ventas - ${escapeHtml(generic.establishmentName || 'Club')}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 15mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
        }
        .header {
            border-bottom: 2px solid #1e293b;
            padding-bottom: 10px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .title {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 2px 0;
        }
        .meta-info {
            font-size: 10px;
            color: #475569;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 12px;
            page-break-inside: avoid;
        }
        .kpi-box {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px;
            background: #f8fafc;
            text-align: center;
        }
        .kpi-label {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .kpi-value {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 14px;
            page-break-inside: avoid;
        }
        .summary-box {
            border-radius: 6px;
            padding: 8px 10px;
        }
        .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 3px;
            margin: 12px 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            page-break-after: avoid;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            padding: 5px 8px;
            border-bottom: 1.5px solid #cbd5e1;
            text-align: left;
        }
        .footer {
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #64748b;
            page-break-inside: avoid;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">
        <div>
            <h1 class="title">${escapeHtml(generic.establishmentName || 'Sistema de Gestión')}</h1>
            <div class="meta-info">
                <span><strong>Reporte General de Ventas y Consumo</strong></span> • 
                <span>Día: <strong>${modeName}</strong></span><br>
                <span>Emisión: ${dateStr}</span>
                ${generic.address ? ` • <span>${escapeHtml(generic.address)}</span>` : ''}
                ${generic.phone ? ` • <span>Tel: ${escapeHtml(generic.phone)}</span>` : ''}
            </div>
        </div>
        <div style="text-align: right; border: 1.5px solid #059669; padding: 5px 10px; border-radius: 6px; background: #ecfdf5;">
            <div style="font-size: 8px; font-weight: 700; color: #065f46; text-transform: uppercase;">Total Recaudado</div>
            <div style="font-size: 17px; font-weight: 900; color: #047857;">${formatCurrency(report.totalRecaudado)}</div>
        </div>
    </div>

    <!-- KPI Box Grid -->
    <div class="kpi-grid">
        <div class="kpi-box">
            <div class="kpi-label">Facturación Total</div>
            <div class="kpi-value" style="color: #047857;">${formatCurrency(report.totalRecaudado)}</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">Unidades Vendidas</div>
            <div class="kpi-value">${formatNumber(report.totalUnidades)}</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">Comensales</div>
            <div class="kpi-value" style="color: #6b21a8;">${formatNumber(report.totalPersonas)}</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">Ticket Promedio</div>
            <div class="kpi-value" style="color: #b45309;">${formatCurrency(report.ticketPromedio)}</div>
        </div>
    </div>

    <!-- SECCIÓN RESUMEN: LO QUE MÁS SE VENDIÓ Y GUSTOS DE PIZZA -->
    <div class="section-title">1. Resumen de Salidas y Rotación</div>
    <div class="summary-grid">
        <!-- 🏆 Lo que más se vendió -->
        <div class="summary-box" style="border: 1px solid #bbf7d0; background: #f0fdf4;">
            <div style="font-weight: 800; font-size: 10px; color: #166534; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid #bbf7d0; padding-bottom: 2px;">
                🏆 Lo que MÁS se Vendió
            </div>
            <div>
                ${masVendidosRows}
            </div>
        </div>

        <!-- 🍕 Gustos de Pizza que más salen -->
        <div class="summary-box" style="border: 1px solid #fde68a; background: #fffbeb;">
            <div style="font-weight: 800; font-size: 10px; color: #92400e; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid #fde68a; padding-bottom: 2px;">
                🍕 Gustos de Pizza que Más Salen
            </div>
            <div>
                ${gustosPizzaRows}
            </div>
        </div>
    </div>

    <!-- LO QUE NO SE VENDIÓ -->
    <div style="border: 1px solid #fecdd3; background: #fff1f2; border-radius: 6px; padding: 6px 10px; margin-bottom: 14px; page-break-inside: avoid;">
        <div style="font-weight: 800; font-size: 10px; color: #9f1239; text-transform: uppercase; margin-bottom: 3px;">
            🚫 Lo que NO se Vendió (0 unidades en el turno)
        </div>
        <div>
            ${sinVentasListHtml}
        </div>
    </div>

    <!-- Tabla Detallada de Productos Vendidos -->
    <div class="section-title">2. Detalle de Todo lo Vendido</div>
    <table>
        <thead>
            <tr>
                <th style="width: 18%;">Categoría</th>
                <th style="width: 38%;">Detalle</th>
                <th style="width: 10%; text-align: center;">Cantidad</th>
                <th style="width: 14%; text-align: right;">Precio Unit.</th>
                <th style="width: 14%; text-align: right;">Subtotal</th>
                <th style="width: 6%; text-align: right;">%</th>
            </tr>
        </thead>
        <tbody>
            ${itemsRows}
        </tbody>
        <tfoot>
            <tr style="background: #f8fafc; font-weight: 800; border-top: 2px solid #0f172a;">
                <td colspan="2" style="padding: 5px 8px; text-transform: uppercase;">Totales Generales</td>
                <td style="padding: 5px 8px; text-align: center; color: #3730a3;">${report.totalUnidades}</td>
                <td style="padding: 5px 8px; text-align: right;">—</td>
                <td style="padding: 5px 8px; text-align: right; color: #047857; font-size: 12px;">${formatCurrency(report.totalRecaudado)}</td>
                <td style="padding: 5px 8px; text-align: right;">100%</td>
            </tr>
        </tfoot>
    </table>

    <!-- Footer -->
    <div class="footer">
        <span>${escapeHtml(generic.establishmentName || 'Club')} • Reporte de Ventas</span>
        <span>Generado el ${dateStr}</span>
        <span>${getReportFileName(report)}</span>
    </div>

</body>
</html>`;
    }

    /**
     * Descarga directamente el Reporte como archivo PDF con nombre de día y fecha
     */
    async function downloadSalesReportPDF(report) {
        const html = generatePrintDocumentHTML(report);
        const defaultFilename = getReportFileName(report);

        if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.savePDF === 'function') {
            try {
                const result = await window.electronAPI.savePDF({ html, defaultFilename });
                if (result && result.success) {
                    showDownloadSuccessToast(result.filePath);
                    return { success: true, filePath: result.filePath };
                } else if (result && result.canceled) {
                    return { success: false, canceled: true };
                } else {
                    alert('No se pudo guardar el archivo PDF: ' + (result?.error || 'Error desconocido'));
                    return { success: false, error: result?.error };
                }
            } catch (err) {
                console.error('Error al llamar savePDF:', err);
                alert('Error al descargar PDF: ' + err.message);
                return { success: false, error: err.message };
            }
        } else if (typeof document !== 'undefined') {
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = defaultFilename.replace('.pdf', '.html');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return { success: true };
        }
        return { success: true, html };
    }

    function showDownloadSuccessToast(filePath) {
        if (typeof document === 'undefined') return;
        let toast = document.getElementById('sales-report-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sales-report-toast';
            toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center space-x-3 transition-all duration-300';
            document.body.appendChild(toast);
        }

        const fileName = filePath ? filePath.split(/[\\/]/).pop() : 'Reporte.pdf';

        toast.innerHTML = `
            <div class="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div>
                <h4 class="font-bold text-sm text-emerald-300">¡PDF descargado con éxito!</h4>
                <p class="text-xs text-slate-300 truncate max-w-xs">${escapeHtml(fileName)}</p>
            </div>
            ${filePath && window.electronAPI && window.electronAPI.showItemInFolder ? `
                <button id="toast-open-folder-btn" class="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                    Ver Archivo
                </button>
            ` : ''}
            <button id="toast-close-btn" class="text-slate-400 hover:text-white text-lg font-bold ml-1">&times;</button>
        `;

        toast.style.display = 'flex';

        const openBtn = toast.querySelector('#toast-open-folder-btn');
        if (openBtn && window.electronAPI) {
            openBtn.onclick = () => {
                window.electronAPI.showItemInFolder(filePath);
            };
        }

        const closeBtn = toast.querySelector('#toast-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                toast.style.display = 'none';
            };
        }

        setTimeout(() => {
            if (toast) toast.style.display = 'none';
        }, 7000);
    }

    return {
        renderModalDashboard,
        generatePrintDocumentHTML,
        downloadSalesReportPDF,
        getReportFileName,
        showDownloadSuccessToast,
        formatCurrency,
        formatNumber,
        formatPercent,
        formatDate
    };

})();

// Exportar para Node.js (tests) si aplica
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalesReportManager;
}

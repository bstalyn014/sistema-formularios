document.addEventListener('DOMContentLoaded', function() {
    cargarRendimiento();
    
    document.getElementById('btn-refresh').addEventListener('click', function() {
        this.style.animation = 'spin 1s linear infinite';
        cargarRendimiento();
    });
});

async function cargarRendimiento() {
    const container = document.getElementById('dashboard-content');
    
    try {
        // Usamos la URL base definida en googleSheets.js
        const url = `${GOOGLE_SCRIPT_URL}?action=resumen_presupuesto`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const btnRefresh = document.getElementById('btn-refresh');
        if (btnRefresh) btnRefresh.style.animation = 'none';

        if (!data.success) {
            throw new Error(data.message || 'Error al obtener datos');
        }

        renderizarGrafico(data.data, container);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="empty-state" style="border-color: var(--tech-red); background: #fef2f2;">
                <h3 style="color: var(--tech-red)">Error de conexión</h3>
                <p>No se pudieron cargar los datos.</p>
                <p style="font-size: 0.8rem; color: #991b1b">${error.message}</p>
            </div>
        `;
        const btnRefresh = document.getElementById('btn-refresh');
        if (btnRefresh) btnRefresh.style.animation = 'none';
    }
}

function renderizarGrafico(datos, container) {
    if (!datos || datos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Sin registros hoy</h3>
                <p>Aún no se han cargado formularios de reconexión este día.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    
    // Encontrar el valor máximo para calcular porcentajes (evitar div por cero)
    const maxVal = Math.max(...datos.map(d => d.total)) || 1;

    datos.forEach((item, index) => {
        const porcentaje = (item.total / maxVal) * 100;
        
        // Animación escalonada
        const delay = index * 0.1;

        const barHtml = `
            <div class="cuadrilla-bar" style="animation: fadeSlideUp 0.5s ease backwards ${delay}s">
                <div class="bar-header">
                    <span class="cuadrilla-name">${item.cuadrilla}</span>
                    <span class="cuadrilla-total">$${item.total.toFixed(2)}</span>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill" style="width: 0%" data-width="${porcentaje}%"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', barHtml);
    });

    // Activar animación de barras después de renderizar
    requestAnimationFrame(() => {
        const fills = container.querySelectorAll('.progress-fill');
        fills.forEach(fill => {
            fill.style.width = fill.getAttribute('data-width');
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarFormularioReconexion();
    inicializarItemsCobro();
    cargarPersonal('supervisor-reconexion', 'obrero-reconexion');
    setupCuadrillaDisplay('supervisor-reconexion', 'obrero-reconexion', 'reconexion-cuadrilla-display');
});

function inicializarFormularioReconexion() {
    configurarListenersCondicionales('#formulario-reconexion', [
        { name: 'medidor', id: 'medidor-razon-reconexion', condition: val => val === 'Mal estado' },
        { name: 'cajetin', id: 'cajetin-razon-reconexion', condition: val => val === 'Mal estado' },
        { name: 'llave_corte', id: 'llave-corte-razon-reconexion', condition: val => val === 'Mal estado' },
        { name: 'llave_paso', id: 'llave-paso-razon-reconexion', condition: val => val === 'Mal estado' },
        { name: 'medio_nudo', id: 'medio-nudo-accesorio-reconexion', condition: val => val === 'No' },
        { name: 'perno', id: 'perno-razon-reconexion', condition: val => val === 'No se coloca' }
    ]);
}

function configurarListenersCondicionales(contexto, configs) {
    configs.forEach(config => {
        const radios = document.querySelectorAll(`${contexto} input[name="${config.name}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                const target = document.getElementById(config.id);
                if (target) {
                    target.classList.toggle('active', config.condition(this.value));
                }
            });
        });
    });
}

function generarResumenReconexion() {
    const form = document.getElementById('inspeccionFormReconexion');
    if (!form.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos');
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const { supervisor, obrero } = obtenerDatosCuadrilla(formData);

    let resumen = `Contrato: ${formData.get('contrato')}, la cuadrilla con supervisor: ${supervisor} y obrero: ${obrero}, al momento de la inspección se encontró el Servicio App ${formData.get('servicio')}, Medidor ${formData.get('medidor')}`;
    
    if (formData.get('medidor') === 'Mal estado') resumen += ` (${formData.get('medidor_razon')})`;
    
    resumen += `, Lectura ${formData.get('lectura')} M3, Litros ${formData.get('litros')}, Cajetin ${formData.get('cajetin')}`;
    if (formData.get('cajetin') === 'Mal estado') resumen += ` (${formData.get('cajetin_tipo_dano')})`;
    
    resumen += `, Tipo de llave de corte ${formData.get('tipo_llave')}, Llave de corte ${formData.get('llave_corte')}`;
    if (formData.get('llave_corte') === 'Mal estado') resumen += ` (${formData.get('llave_corte_razon')})`;
    
    resumen += `, Llave de paso ${formData.get('llave_paso')}`;
    if (formData.get('llave_paso') === 'Mal estado') resumen += ` (${formData.get('llave_paso_razon')})`;
    
    resumen += `, Medio nudo ${formData.get('medio_nudo')}`;
    if (formData.get('medio_nudo') === 'No') resumen += ` (${formData.get('medio_nudo_accesorio')})`;
    
    const tipoReconexion = formData.get('reconexion');
    if (tipoReconexion === 'ya estaba reconectado') {
        resumen += `, se encontró el servicio reconectado`;
    } else {
        resumen += `, se procede a realizar la reconexión del servicio ${tipoReconexion}`;
    }
    
    resumen += `, Predio ${formData.get('predio')}, Color ${formData.get('color')}, Perno ${formData.get('perno')}`;
    if (formData.get('perno') === 'No se coloca') resumen += ` (${formData.get('perno_razon')})`;
    
    const itemCobro = formData.get('item_cobro');
    if (itemCobro && itemCobro.trim() !== '') resumen += `, Item de cobro: ${itemCobro}`;
    
    const observacion = formData.get('observacion');
    if (observacion && observacion.trim() !== '') resumen += `, Observación: ${observacion}`;
    
    mostrarResumen('reconexion', resumen);

    // Agregar botón de guardar si no existe
    if (!document.getElementById('btn-guardar-reconexion')) {
        const botonCopiar = document.getElementById('copiar-resumen-reconexion');
        
        const botonGuardar = document.createElement('button');
        botonGuardar.type = 'button';
        botonGuardar.id = 'btn-guardar-reconexion';
        botonGuardar.className = 'btn-guardar';
        botonGuardar.innerHTML = '💾 Guardar en Google Sheets';
        botonGuardar.onclick = () => guardarReconexionEnSheets();
        
        botonCopiar.parentNode.insertBefore(botonGuardar, botonCopiar.nextSibling);
    }
}

const itemsCobroData = [
    { nombre: "Corte del servicio", precio: 0 },
    { nombre: "Reduccion de caudal", precio: 1.63 },
    { nombre: "Verificación de corte recuperación de cartera", precio: 0 },
    { nombre: "Reconexion de servicio (sencillas)", precio: 3.88 },
    { nombre: "Reconexion efectiva 1-5 meses", precio: 4.14 },
    { nombre: "Reconexion efectiva 6-10 meses", precio: 8.17 },
    { nombre: "Reconexion efectiva 11-15 meses", precio: 13.65 },
    { nombre: "Reconexion efectiva 16-24 meses", precio: 20.17 },
    { nombre: "Reconexion efectiva 25-40 meses", precio: 29.66 },
    { nombre: "Reconexion efectiva 41-50 meses", precio: 47.27 },
    { nombre: "Reconexion efectiva 51-60 meses", precio: 64.90 },
    { nombre: "Reconexion efectiva 61-80 meses", precio: 96.73 },
    { nombre: "Reconexion efectiva >= 81 meses", precio: 128.56 },
    { nombre: "Reubicación por corte y reconexion", precio: 19.33 },
    { nombre: "Mantenimiento corte y reconexión", precio: 3.33 },
    { nombre: "Reactivacion del caudal", precio: 1.65 },
    { nombre: "Verificación de corte integral", precio: 33.51 },
    { nombre: "Cierre definitivo en sitio por depuracion", precio: 33.19 }
];

function inicializarItemsCobro() {
    const searchInput = document.getElementById('search-item-cobro');
    const resultsList = document.getElementById('results-item-cobro');
    const hiddenInput = document.getElementById('selected-item-cobro');
    
    if (!searchInput || !resultsList) return;

    // Función para renderizar lista
    const renderResults = (matches) => {
        resultsList.innerHTML = '';
        if (matches.length > 0) {
            matches.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.nombre; 
                li.className = 'search-item';
                li.onclick = () => seleccionarItem(item);
                resultsList.appendChild(li);
            });
            resultsList.classList.add('active');
        } else {
            resultsList.classList.remove('active');
        }
    };

    // Evento Input
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        
        // CORRECCION: Si está vacío, mostrar TODO
        if (query.length === 0) {
            renderResults(itemsCobroData);
            return;
        }
        
        const matches = itemsCobroData.filter(item => 
            item.nombre.toLowerCase().includes(query)
        );
        renderResults(matches);
    });

    // Evento Focus
    searchInput.addEventListener('focus', function() {
        // Disparar input siempre para mostrar lista completa si está vacío
        this.dispatchEvent(new Event('input'));
    });

    // Seleccionar Item
    const seleccionarItem = (item) => {
        searchInput.value = item.nombre;
        hiddenInput.value = item.nombre;
        resultsList.classList.remove('active');
    };

    // Cerrar al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
            resultsList.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarFormularioCorte();
    cargarPersonal('supervisor-corte', 'obrero-corte');
    setupCuadrillaDisplay('supervisor-corte', 'obrero-corte', 'corte-cuadrilla-display');
    cargarItemsCobro('selected-item-cobro-corte');
    setupLlaveCorteLogica('#formulario-corte');
});

function inicializarFormularioCorte() {
    configurarListenersCondicionales('#formulario-corte', [
        { name: 'medidor', id: 'medidor-razon-corte', condition: val => val === 'Mal estado' },
        { name: 'cajetin', id: 'cajetin-razon-corte', condition: val => val === 'Mal estado' },
        { name: 'llave_corte', id: 'llave-corte-razon-corte', condition: val => val === 'Mal estado' },
        { name: 'llave_paso', id: 'llave-paso-razon-corte', condition: val => val === 'Mal estado' },
        { name: 'medio_nudo', id: 'medio-nudo-accesorio-corte', condition: val => val === 'No' },
        { name: 'perno', id: 'perno-razon-corte', condition: val => val === 'No se coloca' }
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

function generarResumenCorte() {
    const form = document.getElementById('inspeccionForm');
    
    // Validación manual personalizada para saltar "tipo_llave" si está deshabilitado
    const tipoLlaveRadios = form.querySelectorAll('input[name="tipo_llave"]');
    let tipoLlaveRequerido = true;
    if (tipoLlaveRadios.length > 0 && tipoLlaveRadios[0].disabled) {
        tipoLlaveRequerido = false;
        // Quitar required temporalmente para validación
        tipoLlaveRadios.forEach(r => r.required = false);
    } else {
        tipoLlaveRadios.forEach(r => r.required = true);
    }

    if (!form.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos');
        // Forzar mostrar validación HTML5
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const { supervisor, obrero } = obtenerDatosCuadrilla(formData);
    
    let resumen = `Contrato: ${formData.get('contrato')}, la cuadrilla con supervisor: ${supervisor} y obrero: ${obrero}, al momento de la inspección se encontró servicio App ${formData.get('servicio')} medidor ${formData.get('medidor')}`;
    
    if (formData.get('medidor') === 'Mal estado') resumen += ` (${formData.get('medidor_razon')})`;
    
    resumen += `, lectura ${formData.get('lectura')} M3, litros ${formData.get('litros')}, cajetin ${formData.get('cajetin')}`;
    if (formData.get('cajetin') === 'Mal estado') resumen += ` (${formData.get('cajetin_tipo_dano')})`;
    
    // Lógica para Tipo de Llave y Llave de Corte
    const llaveCorteEstado = formData.get('llave_corte');
    if (llaveCorteEstado === 'No tiene') {
        resumen += `, Llave de corte No tiene`;
    } else {
        resumen += `, Tipo de llave de corte ${formData.get('tipo_llave')}, llave de corte ${llaveCorteEstado}`;
        if (llaveCorteEstado === 'Mal estado') resumen += ` (${formData.get('llave_corte_razon')})`;
    }
    
    resumen += ` llave de paso ${formData.get('llave_paso')}`;
    if (formData.get('llave_paso') === 'Mal estado') resumen += ` (${formData.get('llave_paso_razon')})`;
    
    resumen += `, medio nudo ${formData.get('medio_nudo')}`;
    if (formData.get('medio_nudo') === 'No') resumen += ` (${formData.get('medio_nudo_accesorio')})`;
    
    resumen += `, se procede a realizar corte del servicio ${formData.get('corte')}, predio ${formData.get('predio')}, color ${formData.get('color')}, perno ${formData.get('perno')}`;
    if (formData.get('perno') === 'No se coloca') resumen += ` (${formData.get('perno_razon')})`;
    
    if (formData.get('observacion')) resumen += `, Observación: ${formData.get('observacion')}`;
    
    const datosParaGuardar = {};
    formData.forEach((value, key) => datosParaGuardar[key] = value);
    guardarCorteLocal(formData.get('contrato'), datosParaGuardar);

    mostrarResumen('corte', resumen);
    
    // Resetear visualmente la sección extra de reconexión
    const extraReconexion = document.getElementById('resumen-reconexion-extra');
    if (extraReconexion) extraReconexion.style.display = 'none';
}

function generarResumenReconexionDesdeCorte() {
    // Obtener datos del formulario de CORTE existente
    const form = document.getElementById('inspeccionForm');
    const formData = new FormData(form);
    
    // Obtener item de cobro seleccionado en la SECCIÓN EXTRA
    const itemCobroInput = document.getElementById('selected-item-cobro-corte');
    const itemCobro = itemCobroInput ? itemCobroInput.value : '';

    // Validación Item de Cobro
    if (!itemCobro) {
        alert('Por favor, seleccione un Ítem de Cobro para generar el resumen de reconexión.');
        if (itemCobroInput) itemCobroInput.focus();
        return;
    }
    
    // MAPPING DE LÓGICA (Corte -> Reconexión)
    // Se realiza corte -> Reconexión
    const corteValor = formData.get('corte');
    let reconexionValor = '';
    
    if (corteValor === 'Con ficha') {
        reconexionValor = 'Se retira ficha';
    } else if (corteValor === 'Con ficha y llave trabada') {
        reconexionValor = 'Se retira ficha y se destraba llave';
    } else if (corteValor === 'Solo llave trabada') {
        reconexionValor = 'Se destraba llave';
    } else {
        // Fallback o mismo valor
        reconexionValor = corteValor; 
    }
    
    const { supervisor, obrero } = obtenerDatosCuadrilla(formData);

    // CONSTRUIR RESUMEN DE RECONEXIÓN
    let resumen = `Contrato: ${formData.get('contrato')}, la cuadrilla con supervisor: ${supervisor} y obrero: ${obrero}, al momento de la inspección se encontró el Servicio App ${formData.get('servicio')}, Medidor ${formData.get('medidor')}`;
    
    if (formData.get('medidor') === 'Mal estado') resumen += ` (${formData.get('medidor_razon')})`;
    
    resumen += `, Lectura ${formData.get('lectura')} M3, Litros ${formData.get('litros')}, Cajetin ${formData.get('cajetin')}`;
    if (formData.get('cajetin') === 'Mal estado') resumen += ` (${formData.get('cajetin_tipo_dano')})`;
    
    // Lógica para Tipo de Llave y Llave de Corte
    const llaveCorteEstado = formData.get('llave_corte');
    if (llaveCorteEstado === 'No tiene') {
        resumen += `, Llave de corte No tiene`;
    } else {
        resumen += `, Tipo de llave de corte ${formData.get('tipo_llave')}, Llave de corte ${llaveCorteEstado}`;
        if (llaveCorteEstado === 'Mal estado') resumen += ` (${formData.get('llave_corte_razon')})`;
    }
    
    resumen += `, Llave de paso ${formData.get('llave_paso')}`;
    if (formData.get('llave_paso') === 'Mal estado') resumen += ` (${formData.get('llave_paso_razon')})`;
    
    resumen += `, Medio nudo ${formData.get('medio_nudo')}`;
    if (formData.get('medio_nudo') === 'No') resumen += ` (${formData.get('medio_nudo_accesorio')})`;
    
    // Usar el valor mapeado
    resumen += `, se procede a realizar la reconexión del servicio ${reconexionValor}`;
    
    resumen += `, Predio ${formData.get('predio')}, Color ${formData.get('color')}, Perno ${formData.get('perno')}`;
    if (formData.get('perno') === 'No se coloca') resumen += ` (${formData.get('perno_razon')})`;
    
    // Item de cobro (este sí se muestra aquí, no se especificó quitarlo de este resumen extra, 
    // pero si se quitó del principal... asumo que SIEMPRE se quita del resumen de texto final para reconexión según la solicitud previa
    // "eliminemos del resumen de reconexionla parte del item de cobro".
    // Así que lo mantendré comentado para ser consistente, aunque el usuario pidió seleccionarlo para GUARDARLO en Sheets).
    
    // if (itemCobro && itemCobro.trim() !== '') resumen += `, Item de cobro: ${itemCobro}`;
    
    const observacion = formData.get('observacion');
    if (observacion && observacion.trim() !== '') resumen += `, Observación: ${observacion}`;

    // Mostrar en el contenedor extra
    const contenidoElement = document.getElementById('resumen-contenido-reconexion-extra');
    const contenedorElement = document.getElementById('resumen-reconexion-extra');
    
    if (contenidoElement && contenedorElement) {
        contenidoElement.textContent = resumen;
        contenedorElement.style.display = 'block';
        contenedorElement.classList.add('active');
        contenedorElement.scrollIntoView({ behavior: 'smooth' });
    }
}

async function guardarReconexionDesdeCorte() {
    const form = document.getElementById('inspeccionForm');
    const formData = new FormData(form);
    
    // Obtener item de cobro
    const itemCobroInput = document.getElementById('selected-item-cobro-corte');
    const itemCobro = itemCobroInput ? itemCobroInput.value : '';
    
    // Mapeo inverso para guardar los datos correctos en el sheet
    const corteValor = formData.get('corte');
    let reconexionValor = '';
    if (corteValor === 'Con ficha') reconexionValor = 'Se retira ficha';
    else if (corteValor === 'Con ficha y llave trabada') reconexionValor = 'Se retira ficha y se destraba llave';
    else if (corteValor === 'Solo llave trabada') reconexionValor = 'Se destraba llave';
    else reconexionValor = corteValor;

    // Construir objeto de datos
    const datos = {};
    formData.forEach((value, key) => {
        // Excluir campos específicos de corte que no aplican o se transforman
        if (key !== 'corte') {
            datos[key] = value;
        }
    });
    
    // Agregar campos transformados/nuevos
    datos['reconexion'] = reconexionValor;
    datos['item_cobro'] = itemCobro;
    
    await enviarAGSheets('reconexion', datos, 'btn-guardar-reconexion-extra');
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarFormularioReconexion();
    inicializarItemsCobro();
    cargarPersonal('supervisor-reconexion', 'obrero-reconexion');
    setupCuadrillaDisplay('supervisor-reconexion', 'obrero-reconexion', 'reconexion-cuadrilla-display');
    setupLlaveCorteLogica('#formulario-reconexion');
    setupCargaDatosLogica();
});

function inicializarFormularioReconexion() {
    configurarListenersCondicionales('#formulario-reconexion', [
        { name: 'cajetin', id: 'cajetin-razon-reconexion', condition: val => val === 'Mal estado' },
        { name: 'perno', id: 'perno-razon-reconexion', condition: val => val === 'No se instala' }
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
    
    // Validación manual personalizada para saltar "tipo_llave" si está deshabilitado
    const tipoLlaveRadios = form.querySelectorAll('input[name="tipo_llave"]');
    let tipoLlaveRequerido = true;
    if (tipoLlaveRadios.length > 0 && tipoLlaveRadios[0].disabled) {
        tipoLlaveRequerido = false;
        tipoLlaveRadios.forEach(r => r.required = false);
    } else {
        tipoLlaveRadios.forEach(r => r.required = true);
    }

    // Validación Item de Cobro
    const itemCobroSelect = document.getElementById('selected-item-cobro');
    if (itemCobroSelect && !itemCobroSelect.value) {
        alert('Por favor, seleccione un Ítem de Cobro');
        itemCobroSelect.focus();
        return;
    }

    if (!form.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos');
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const { supervisor, obrero } = obtenerDatosCuadrilla(formData);

    // INICIO DEL RESUMEN
    let resumen = `Contrato: ${formData.get('contrato')}, la cuadrilla con supervisor: ${supervisor} y obrero: ${obrero}, al momento de la inspección se procede a dejar el servicio de aapp habilitado. `;

    // ACCIÓN REALIZADA
    const tipoReconexion = formData.get('reconexion');
    if (tipoReconexion === 'se encontró reconectado') {
        resumen += `Se encontró el servicio reconectado. `;
    } else {
        // Mapeo a gerundio
        let accionTexto = tipoReconexion;
        if (tipoReconexion === 'se retira ficha') accionTexto = 'retirando ficha';
        else if (tipoReconexion === 'se retira ficha y se destraba llave') accionTexto = 'retirando ficha y destrabando llave';
        else if (tipoReconexion === 'se destraba llave') accionTexto = 'destrabando llave';
        
        resumen += `Se realiza la reconexión del servicio ${accionTexto}. `;
    }

    // HALLAZGOS (ESTADO)
    resumen += `Se encontró el Medidor en ${formData.get('medidor')}`;
    
    resumen += `, Lectura ${formData.get('lectura')} M3, Litros ${formData.get('litros')}, Cajetin ${formData.get('cajetin')}`;
    if (formData.get('cajetin') === 'Mal estado') resumen += ` (${formData.get('cajetin_tipo_dano')})`;
    
    // Lógica para Tipo de Llave y Llave de Corte
    const llaveCorteEstado = formData.get('llave_corte');
    if (llaveCorteEstado === 'No tiene') {
        resumen += `, Llave de corte No tiene`;
    } else {
        resumen += `, Tipo de llave de corte ${formData.get('tipo_llave')}, Llave de corte ${llaveCorteEstado}`;
    }
    
    resumen += `, Llave de paso ${formData.get('llave_paso')}`;
    
    resumen += `, Predio ${formData.get('predio')}, Color ${formData.get('color')}, Perno ${formData.get('perno')}`;
    if (formData.get('perno') === 'No se instala') resumen += ` (${formData.get('perno_razon')})`;
    
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

const itemsCobroData = []; // Deprecated, moved to common.js

function inicializarItemsCobro() {
    cargarItemsCobro('selected-item-cobro');
}

function setupCargaDatosLogica() {
    const contratoInput = document.getElementById('contrato-reconexion');
    const btnCargar = document.getElementById('btn-cargar-datos-corte');
    
    if (!contratoInput || !btnCargar) return;

    // Verificar si existe dato cada vez que se cambia el input
    contratoInput.addEventListener('input', function() {
        const contrato = this.value;
        const datosGuardados = obtenerCorteLocal(contrato);
        
        if (datosGuardados) {
            btnCargar.style.display = 'inline-block';
            btnCargar.textContent = `🔄 Cargar datos de Corte (${new Date().toLocaleTimeString()})`;
        } else {
            btnCargar.style.display = 'none';
        }
    });

    // Acción del botón cargar
    btnCargar.addEventListener('click', function() {
        const contrato = contratoInput.value;
        const datos = obtenerCorteLocal(contrato);
        
        if (!datos) {
            alert('No se encontraron datos guardados para este contrato.');
            return;
        }
        
        if (!confirm('¿Desea cargar los datos del corte realizado anteriormente? Esto reemplazará los valores actuales.')) {
            return;
        }
        
        // Cargar datos en el formulario
        const form = document.getElementById('inspeccionFormReconexion');
        
        // 1. Cuadrilla
        const { supervisor, obrero } = obtenerDatosCuadrilla(datosParaFormData(datos));
        setSelectValue('supervisor-reconexion', supervisor);
        setSelectValue('obrero-reconexion', obrero);
        
        // Forzar actualización del display de cuadrilla
        const supervisorSelect = document.getElementById('supervisor-reconexion');
        if (supervisorSelect) supervisorSelect.dispatchEvent(new Event('change'));

        // 2. Estado del Servicio y Medidor
        // setRadioValue(form, 'servicio', datos.servicio); // Servicio eliminado
        setRadioValue(form, 'medidor', datos.medidor);
        // Razones de medidor eliminadas

        // 3. Lecturas
        setInputValue('lectura-reconexion', datos.lectura);
        setInputValue('litros-reconexion', datos.litros);

        // 4. Componentes
        setRadioValue(form, 'cajetin', datos.cajetin);
        if (datos.cajetin === 'Mal estado') {
           setRadioValue(form, 'cajetin_tipo_dano', datos.cajetin_tipo_dano);
           document.getElementById('cajetin-razon-reconexion').classList.add('active');
        }

        setRadioValue(form, 'llave_corte', datos.llave_corte);
        // Razones llave corte eliminadas
        
        if (datos.llave_corte === 'No tiene') {
             // Disparar evento para deshabilitar tipo llave
             const radiosLlave = form.querySelectorAll('input[name="llave_corte"]');
             radiosLlave.forEach(r => { if(r.checked) r.dispatchEvent(new Event('change')); });
        } else {
             setRadioValue(form, 'tipo_llave', datos.tipo_llave);
        }

        setRadioValue(form, 'llave_paso', datos.llave_paso);
        // Razones llave paso eliminadas

        // 5. Detalles Finales
        // Medio nudo eliminado

        setRadioValue(form, 'predio', datos.predio);
        setInputValue('color-reconexion', datos.color);
        
        setRadioValue(form, 'perno', datos.perno);
        if (datos.perno === 'No se coloca' || datos.perno === 'No se instala') {
            // Manejar compatibilidad si se cargan datos viejos "No se coloca"
            const pernoVal = (datos.perno === 'No se coloca') ? 'No se instala' : datos.perno;
             setRadioValue(form, 'perno', pernoVal);
            setRadioValue(form, 'perno_razon', datos.perno_razon);
            document.getElementById('perno-razon-reconexion').classList.add('active');
        }

        // Reconexión automática sugerida basada en el corte
        // Lógica replicada de la conversión que hicimos antes
        let reconexionValor = '';
        if (datos.corte === 'Con ficha') reconexionValor = 'se retira ficha';
        else if (datos.corte === 'Con ficha y llave trabada') reconexionValor = 'se retira ficha y se destraba llave';
        else if (datos.corte === 'Solo llave trabada') reconexionValor = 'se destraba llave';
        
        if (reconexionValor) {
             setRadioValue(form, 'reconexion', reconexionValor);
        }

        // alert('Datos cargados correctamente. Por favor verifique y complete la información restante.');
    });
}

// Helpers para cargar datos
function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input && value !== undefined) input.value = value;
}

function setSelectValue(id, value) {
    const select = document.getElementById(id);
    if (select && value !== undefined) select.value = value;
}

function setRadioValue(form, name, value) {
    if (!value) return;
    const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
        radio.checked = true;
        // Disparar change para activar lógica dependiente si existe
        radio.dispatchEvent(new Event('change'));
    }
}

// Helper simple para convertir objeto plano a estructura compatible con obtenerDatosCuadrilla
function datosParaFormData(datos) {
    const map = new Map();
    for (const key in datos) {
        map.set(key, datos[key]);
    }
    return map;
}

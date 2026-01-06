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
    
    // Validación manual personalizada para saltar "tipo_llave" si está deshabilitado
    const tipoLlaveRadios = form.querySelectorAll('input[name="tipo_llave"]');
    let tipoLlaveRequerido = true;
    if (tipoLlaveRadios.length > 0 && tipoLlaveRadios[0].disabled) {
        tipoLlaveRequerido = false;
        tipoLlaveRadios.forEach(r => r.required = false);
    } else {
        tipoLlaveRadios.forEach(r => r.required = true);
    }

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
    
    const tipoReconexion = formData.get('reconexion');
    if (tipoReconexion === 'ya estaba reconectado') {
        resumen += `, se encontró el servicio reconectado`;
    } else {
        resumen += `, se procede a realizar la reconexión del servicio ${tipoReconexion}`;
    }
    
    resumen += `, Predio ${formData.get('predio')}, Color ${formData.get('color')}, Perno ${formData.get('perno')}`;
    if (formData.get('perno') === 'No se coloca') resumen += ` (${formData.get('perno_razon')})`;
    
    // Item de cobro eliminado del resumen por solicitud
    // const itemCobro = formData.get('item_cobro');
    // if (itemCobro && itemCobro.trim() !== '') resumen += `, Item de cobro: ${itemCobro}`;
    
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
        setRadioValue(form, 'servicio', datos.servicio);
        setRadioValue(form, 'medidor', datos.medidor);
        if (datos.medidor === 'Mal estado') {
            const razonInput = document.getElementById('medidor-razon-text-reconexion');
            if (razonInput) razonInput.value = datos.medidor_razon || '';
            document.getElementById('medidor-razon-reconexion').classList.add('active');
        }

        // 3. Lecturas (Se pueden editar después, pero se cargan las del corte)
        setInputValue('lectura-reconexion', datos.lectura);
        setInputValue('litros-reconexion', datos.litros);

        // 4. Componentes
        setRadioValue(form, 'cajetin', datos.cajetin);
        if (datos.cajetin === 'Mal estado') {
           setRadioValue(form, 'cajetin_tipo_dano', datos.cajetin_tipo_dano);
           document.getElementById('cajetin-razon-reconexion').classList.add('active');
        }

        setRadioValue(form, 'llave_corte', datos.llave_corte);
        if (datos.llave_corte === 'Mal estado') {
            const razonLlave = document.getElementById('llave-corte-razon-text-reconexion');
            if (razonLlave) razonLlave.value = datos.llave_corte_razon || '';
            document.getElementById('llave-corte-razon-reconexion').classList.add('active');
        }
        
        if (datos.llave_corte === 'No tiene') {
             // Disparar evento para deshabilitar tipo llave
             const radiosLlave = form.querySelectorAll('input[name="llave_corte"]');
             radiosLlave.forEach(r => { if(r.checked) r.dispatchEvent(new Event('change')); });
        } else {
             setRadioValue(form, 'tipo_llave', datos.tipo_llave);
        }

        setRadioValue(form, 'llave_paso', datos.llave_paso);
         if (datos.llave_paso === 'Mal estado') {
            const razonPaso = document.getElementById('llave-paso-razon-text-reconexion');
            if (razonPaso) razonPaso.value = datos.llave_paso_razon || '';
            document.getElementById('llave-paso-razon-reconexion').classList.add('active');
        }

        // 5. Detalles Finales
        setRadioValue(form, 'medio_nudo', datos.medio_nudo);
        if (datos.medio_nudo === 'No') {
            const accesorioInput = document.getElementById('medio-nudo-accesorio-text-reconexion');
            if (accesorioInput) accesorioInput.value = datos.medio_nudo_accesorio || '';
             document.getElementById('medio-nudo-accesorio-reconexion').classList.add('active');
        }

        setRadioValue(form, 'predio', datos.predio);
        setInputValue('color-reconexion', datos.color);
        
        setRadioValue(form, 'perno', datos.perno);
        if (datos.perno === 'No se coloca') {
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

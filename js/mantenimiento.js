document.addEventListener('DOMContentLoaded', function() {
    inicializarFormularioMantenimiento();
    cargarItemsMantenimiento();
    cargarPersonal('supervisor-mantenimiento', 'obrero-mantenimiento');
    setupCuadrillaDisplay('supervisor-mantenimiento', 'obrero-mantenimiento', 'mantenimiento-cuadrilla-display');
    setupLlaveCorteLogica('#formulario-mantenimiento');
    setupCargaDatosLogicaMantenimiento();
});

const ITEMS_MANTENIMIENTO_DATA = [
    { nombre: "Mantenimiento – Cambio de cajetín", precio: 10.07 },
    { nombre: "Mantenimiento – Cambio de medidor", precio: 4.78 },
    { nombre: "Mantenimiento – Mantenimiento en sitio", precio: 3.31 },
    { nombre: "Mantenimiento – Reposición de medidor", precio: 7.16 },
    { nombre: "Mantenimiento – Revisión de medidor y accesorios", precio: 10.69 },
    { nombre: "Mantenimiento – Reconexión de cierre temporal 1/2” a 1”", precio: 4.09 },
    { nombre: "Mantenimiento Cambio – Cambio de medidores por plan masivo", precio: 4.05 },
    { nombre: "Mantenimiento FES – Cambio de cajetín por FES", precio: 10.07 },
    { nombre: "Mantenimiento FES – Cambio de medidor FES", precio: 4.78 },
    { nombre: "Mantenimiento FES – Cambio e instalación medidor por defraudación FES", precio: 5.06 },
    { nombre: "Mantenimiento FES – Pérdida no operacional por FES", precio: 1.72 },
    { nombre: "Mantenimiento – Actualización datos DGM", precio: 1.87 }
];

function cargarItemsMantenimiento() {
    const select = document.getElementById('selected-item-cobro');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione un ítem de cobro</option>';

    ITEMS_MANTENIMIENTO_DATA.forEach(item => {
        const option = document.createElement('option');
        // Guardamos el precio como atributo data por si se necesita después
        option.value = item.nombre; 
        option.textContent = `${item.nombre}`; // Podríamos añadir el precio visualmente si se desea
        select.appendChild(option);
    });
}

function inicializarFormularioMantenimiento() {
    configurarListenersCondicionales('#formulario-mantenimiento', [
        { name: 'cajetin', id: 'cajetin-razon-mantenimiento', condition: val => val === 'Mal estado' },
        { name: 'perno', id: 'perno-razon-mantenimiento', condition: val => val === 'No se instala' },
        { name: 'medidor', id: 'problema-medidor-section', condition: val => val === 'Mal estado' }
    ]);

    // Listener especial para "Otro" problema de medidor
    const radioOtro = document.getElementById('radio-problema-otro');
    const radiosProblema = document.querySelectorAll('input[name="medidor_problema"]');
    const inputOtro = document.getElementById('medidor_problema_otro');

    radiosProblema.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'otro') {
                inputOtro.style.display = 'inline-block';
                inputOtro.required = true;
            } else {
                inputOtro.style.display = 'none';
                inputOtro.required = false;
                inputOtro.value = '';
            }
        });
    });

    // Listener para limpiar validaciones condicionales cuando se oculta la sección padre
    document.querySelectorAll('input[name="medidor"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Buen estado') {
                // Si cambiamos a buen estado, limpiamos la selección de problema y el campo otro
                radiosProblema.forEach(r => r.checked = false);
                inputOtro.style.display = 'none';
                inputOtro.required = false;
                inputOtro.value = '';
                // Ocultar sección visualmente (ya lo hace el listener genérico, pero aseguramos estado)
                document.getElementById('problema-medidor-section').classList.remove('active');
                document.getElementById('problema-medidor-section').style.display = 'none';
            }
        });
    });

    // Listener para Tareas de Mantenimiento (Litros, Sello, Notificación)
    const inputsTareas = [
        'tarea-cambio-medidor-litros',
        'tarea-sello-valija',
        'tarea-notificacion'
    ];

    document.querySelectorAll('input[name="medidor"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const seccionTareas = document.getElementById('tareas-mantenimiento-section');
            const esMalEstado = this.value === 'Mal estado';
            
            if (seccionTareas) {
                seccionTareas.style.display = esMalEstado ? 'block' : 'none';
                seccionTareas.classList.toggle('active', esMalEstado);
                
                // Toggle required
                inputsTareas.forEach(id => {
                    const input = document.getElementById(id);
                    if (input) {
                        input.required = esMalEstado;
                        if (!esMalEstado) input.value = ''; // Limpiar si se oculta
                    }
                });
            }
        });
    });
}

function configurarListenersCondicionales(contexto, configs) {
    configs.forEach(config => {
        const radios = document.querySelectorAll(`${contexto} input[name="${config.name}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                const target = document.getElementById(config.id);
                if (target) {
                    const isActive = config.condition(this.value);
                    target.classList.toggle('active', isActive);
                    if (isActive) {
                        target.style.display = 'block';
                    } else {
                        target.style.display = 'none';
                    }
                }
            });
        });
    });
}

function generarResumenMantenimiento() {
    const form = document.getElementById('inspeccionFormMantenimiento');
    
    // Validación manual para saltar "tipo_llave" si está deshabilitado (llave_corte = No tiene)
    // Esto asegura que si está habilitado (Buen estado/Mal estado), sea requerido.
    const tipoLlaveRadios = form.querySelectorAll('input[name="tipo_llave"]');
    if (tipoLlaveRadios.length > 0) {
        if (tipoLlaveRadios[0].disabled) {
            tipoLlaveRadios.forEach(r => r.required = false);
        } else {
            tipoLlaveRadios.forEach(r => r.required = true);
        }
    }

    // Validaciones standard del navegador
    if (!form.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos');
        form.reportValidity();
        return;
    }

    const itemCobroSelect = document.getElementById('selected-item-cobro');
    if (itemCobroSelect && !itemCobroSelect.value) {
        alert('Por favor, seleccione un Ítem de Cobro');
        itemCobroSelect.focus();
        return;
    }
    
    const formData = new FormData(form);
    const { supervisor, obrero } = obtenerDatosCuadrilla(formData);

    // --- CONSTRUCCIÓN DEL RESUMEN ---

    let resumen = `Contrato: ${formData.get('contrato')}, Supervisor: ${supervisor} y Obrero: ${obrero}, al momento de la inspección se encontró `;

    // Medidor y Estado
    const medidorEstado = formData.get('medidor');
    const numeroMedidor = formData.get('numero_medidor');
    resumen += `Medidor ${numeroMedidor} ${medidorEstado}`;

    // Lecturas
    resumen += `, Lectura ${formData.get('lectura')} M3, Litros ${formData.get('litros')}`;

    // Cajetin
    const cajetinEstado = formData.get('cajetin');
    resumen += `, Cajetin ${cajetinEstado}`;
    if (cajetinEstado === 'Mal estado') {
        const cajetinDano = formData.get('cajetin_tipo_dano');
        resumen += ` (${cajetinDano})`;
    }

    // Tipo de Llave y Corte
    const tipoLlave = formData.get('tipo_llave');
    const llaveCorte = formData.get('llave_corte');
    
    if (llaveCorte === 'No tiene') {
        resumen += `, Llave de corte No tiene`;
    } else {
        resumen += `, Tipo de llave de corte ${tipoLlave}, Llave de corte ${llaveCorte}`;
    }

    // Llave de Paso
    const llavePaso = formData.get('llave_paso');
    resumen += `, Llave de paso ${llavePaso}`;

    // --- ACCIONES DE MANTENIMIENTO (Textos agregados por condiciones) ---
    
    if (cajetinEstado === 'Mal estado') {
        resumen += `, se procede a roturar para cambiar cajetin, se resana acera`;
    }

    if (llaveCorte === 'Mal estado') {
        resumen += `, se procede a cambiar la llave de corte en mal estado`;
    }

    if (llavePaso === 'Mal estado') {
        resumen += `, se procede a cambiar llave de paso en mal estado`;
    }


    // --- TAREAS ESPECÍFICAS DE CAMBIO DE MEDIDOR ---
    // Solo si el medidor está en Mal Estado
    if (medidorEstado === 'Mal estado') {
        const litrosCambio = formData.get('tarea_cambio_litros');
        if (litrosCambio) {
            resumen += `, se procede a cambiar medidor, se instala medidor con Lectura 0 m3 y con Litros ${litrosCambio}`;
        }
        
        const selloValija = formData.get('tarea_sello_valija');
        const notificacion = formData.get('tarea_notificacion');
        
        if (selloValija) resumen += `, Se realiza cadena de custodio con sello de valija : ${selloValija}`;
        if (notificacion) resumen += `, Se realiza notificacion por revisión de medidor : ${notificacion}`;
    }


    // --- DETALLES FINALES ---

    resumen += `, El predio es de ${formData.get('predio')}, Color ${formData.get('color')}`;
    
    const perno = formData.get('perno');
    resumen += `, El Perno ${perno}`;
    if (perno === 'No se instala') {
        resumen += ` (${formData.get('perno_razon')})`;
    }

    // Frase final condicional (solo si medidor estaba mal estado, según instrucciones)
    if (medidorEstado === 'Mal estado') {
        resumen += `, Finalmente, se deja medidor en correcta posicion y sin fuga.`;
    }

    // Observación
    const observacion = formData.get('observacion');
    if (observacion && observacion.trim() !== '') {
        resumen += `\nObservación: ${observacion}`;
    }

    mostrarResumen('mantenimiento', resumen);
    
    // Agregar botón guardar (placeholder hasta implementar backend)
    // if (!document.getElementById('btn-guardar-mantenimiento')) { ... }
}

function setupCargaDatosLogicaMantenimiento() {
    const contratoInput = document.getElementById('contrato-mantenimiento');
    const btnCargar = document.getElementById('btn-cargar-datos-corte');
    
    if (!contratoInput || !btnCargar) return;

    contratoInput.addEventListener('input', function() {
        const contrato = this.value;
        const datosGuardados = obtenerCorteLocal(contrato); // Usa función de common.js
        
        if (datosGuardados) {
            btnCargar.style.display = 'inline-block';
            btnCargar.textContent = `🔄 Cargar datos Previos (${new Date().toLocaleTimeString()})`;
        } else {
            btnCargar.style.display = 'none';
        }
    });

    btnCargar.addEventListener('click', function() {
        const contrato = contratoInput.value;
        const datos = obtenerCorteLocal(contrato); // Usa función de common.js
        
        if (!datos) {
            alert('No se encontraron datos guardados para este contrato.');
            return;
        }
        
        if (!confirm('¿Desea cargar los datos del corte realizado anteriormente? Esto reemplazará los valores actuales.')) {
            return;
        }
        
        // Cargar datos
        const form = document.getElementById('inspeccionFormMantenimiento');
        
        // Mapeo simple de campos que coinciden por 'name'
        const mapeoSimple = ['lectura', 'litros', 'color', 'observacion'];
        
        mapeoSimple.forEach(campo => {
            if (datos[campo]) {
                const input = form.querySelector(`[name="${campo}"]`);
                if (input) input.value = datos[campo];
            }
        });

        // Radios
        const mapeoRadios = ['medidor', 'cajetin', 'llave_corte', 'tipo_llave', 'llave_paso', 'predio', 'perno'];
        
        mapeoRadios.forEach(campo => {
            if (datos[campo]) {
                const radio = form.querySelector(`input[name="${campo}"][value="${datos[campo]}"]`);
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change')); // Activar listeners condicionales
                }
            }
        });

        // Sub-condicionales específicos
        if (datos.cajetin === 'Mal estado' && datos.cajetin_tipo_dano) {
            const radio = form.querySelector(`input[name="cajetin_tipo_dano"][value="${datos.cajetin_tipo_dano}"]`);
            if (radio) radio.checked = true;
        }

        if (datos.perno === 'No se instala' && datos.perno_razon) {
            const radio = form.querySelector(`input[name="perno_razon"][value="${datos.perno_razon}"]`);
            if (radio) radio.checked = true;
        }
        
        // Cuadrilla
        const supervisorSelect = document.getElementById('supervisor-mantenimiento');
        const obreroSelect = document.getElementById('obrero-mantenimiento');
        
        // Intentar parsear supervisor/obrero si vienen separados o juntos
        // (La función obtenerDatosCuadrilla en common.js es para leer form, aquí cargamos al form)
        // Asumimos que 'datos' tiene claves del form de corte original
        let supVal = datos.supervisor;
        let obrVal = datos.obrero;
        
        if (supVal && supervisorSelect) supervisorSelect.value = supVal;
        if (obrVal && obreroSelect) obreroSelect.value = obrVal;
        
        if (supervisorSelect) supervisorSelect.dispatchEvent(new Event('change'));
    });
}

async function guardarMantenimientoEnSheets() {
    const form = document.getElementById('inspeccionFormMantenimiento');
    
    // NOTA: No usamos form.checkValidity() aquí porque el formulario está oculto 
    // y los navegadores pueden fallar al reportar validez en elementos no visibles.
    // Asumimos que si el usuario ve este botón (en el resumen), ya pasó la validación inicial.

    const itemCobroSelect = document.getElementById('selected-item-cobro');
    if (itemCobroSelect.value) {
        // Validación extra si se requiere
    } else {
        alert('Seleccione un ítem de cobro');
        return;
    }

    const formData = new FormData(form);
    const datos = {};
    formData.forEach((value, key) => datos[key] = value);
    
    // Llamar a función de googleSheets.js
    await enviarAGSheets('mantenimiento', datos, 'btn-guardar-mantenimiento');
}

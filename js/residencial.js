document.addEventListener('DOMContentLoaded', function() {
    configurarFormularioResidencial();
});

function configurarFormularioResidencial() {
    // Configuración condicionales estándar (Excluyendo los de fuga y prueba que ahora tienen lógica custom)
    configurarInputsCondicionales([
        { selector: 'input[name="estado_medidor"]', field: 'res-estado-medidor-otro-field', value: 'Otro' },
        { selector: '#res-abastecimiento', field: 'res-abastecimiento-otro', type: 'select', value: 'Otro' },
        { selector: 'input[name="caudal_ingreso"]', field: 'res-caudal-detalle', value: 'Sí' }
    ]);

    // Lógica Compleja: Prueba de Consumo y Fugas
    const actualizarEstadoFugas = () => {
        const permitePrueba = document.querySelector('input[name="prueba_consumo"]:checked')?.value;
        const razonNoPermite = document.querySelector('input[name="prueba_razon"]:checked')?.value;
        const fugaDetectada = document.querySelector('input[name="fugas_detectadas"]:checked')?.value;
        
        // Elementos a controlar
        const fugasGroup = document.getElementById('res-fugas-group');
        const personaAtendioGroup = document.getElementById('res-persona-atendio-group');
        const recomendaciones = document.getElementById('res-recomendacion-fugas');
        const detalleNoSeDetecto = document.getElementById('res-no-se-detecto');
        const detalleFugaVisible = document.getElementById('res-fuga-visible-detalle');
        
        // Sub-opciones de "No permite"
        toggleElement('res-prueba-no-detalle', permitePrueba === 'No');
        
        // --- CASO 2: Bloqueo por Usuario Ausente ---
        const esUsuarioAusente = permitePrueba === 'No' && razonNoPermite === 'usuario ausente';
        
        if (fugasGroup) {
            const inputs = fugasGroup.querySelectorAll('input, select, textarea');
            inputs.forEach(input => input.disabled = esUsuarioAusente);
            fugasGroup.style.opacity = esUsuarioAusente ? '0.5' : '1';
        }
        
        if (personaAtendioGroup) {
            const inputs = personaAtendioGroup.querySelectorAll('input, select, textarea');
            inputs.forEach(input => input.disabled = esUsuarioAusente);
            personaAtendioGroup.style.opacity = esUsuarioAusente ? '0.5' : '1';
        }

        // --- Visibilidad de Detalles y Recomendaciones ---
        // Resetear todo primero
        if (detalleNoSeDetecto) detalleNoSeDetecto.classList.remove('active');
        if (detalleFugaVisible) detalleFugaVisible.classList.remove('active');
        if (recomendaciones) recomendaciones.style.display = 'none';

        if (esUsuarioAusente) return; // Si está ausente, no mostramos nada más de fugas

        if (permitePrueba === 'Sí') {
            // Caso 1: Permite prueba = Sí
            if (fugaDetectada === 'No se detecto') {
                if (detalleNoSeDetecto) detalleNoSeDetecto.classList.add('active');
                // Recomendación OCULTA
            } else if (fugaDetectada === 'Se detectó fuga visible') {
                if (detalleFugaVisible) detalleFugaVisible.classList.add('active');
                // Recomendación OCULTA
            } else if (fugaDetectada === 'Se detectó fuga no visible') {
                if (recomendaciones) recomendaciones.style.display = 'block';
            }
        } else if (permitePrueba === 'No') {
            // Caso 3: Permite prueba = No (y NO es usuario ausente, ya filtrado arriba)
             if (fugaDetectada === 'Se detectó fuga no visible') {
                if (recomendaciones) recomendaciones.style.display = 'block';
            }
            // Para 'No se detecto' y 'Se detectó fuga visible' NO se despliega nada
        }
    };

    // Listeners para la lógica compleja
    const inputsComplejos = [
        'input[name="prueba_consumo"]',
        'input[name="prueba_razon"]',
        'input[name="fugas_detectadas"]'
    ];
    
    inputsComplejos.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('change', actualizarEstadoFugas);
        });
    });

    // Pruebas de consumo (Razón específico detalles)
    document.querySelectorAll('input[name="prueba_razon"]').forEach(radio => {
        radio.addEventListener('change', function() {
            toggleElement('res-usuario-no-permite', this.value === 'usuario no permite el ingreso');
            toggleElement('res-otra-razon', this.value === 'otra');
        });
    });

    // Lógica Cadena de Custodio
    // "No debe mostrarse hasta que no se seleccionen esas opciones (Mal estado, Visor Derio, Paralizado, Otro)"
    const estadosMedidor = document.querySelectorAll('input[name="estado_medidor"]');
    const cadenaCustodioField = document.getElementById('res-cadena-custodio');
    
    // Ocultar inicialmente si no hay "Buen estado" seleccionado, o asegurarse de que empiece oculto
    // (En el HTML, quitar style="display:block" si estuviera forzado)
    if (cadenaCustodioField) cadenaCustodioField.classList.remove('active');

    estadosMedidor.forEach(radio => {
        radio.addEventListener('change', function() {
            // Mostrar si NO es "Buen estado"
            const mostrar = this.value !== 'Buen estado';
            if (cadenaCustodioField) {
                cadenaCustodioField.classList.toggle('active', mostrar);
                // Si usamos display: none en CSS para .conditional-field sin .active, esto funciona.
                // Si el estilo inline sigue ahí, hay que quitarlo:
                cadenaCustodioField.style.display = mostrar ? 'block' : 'none';
            }
        });
    });
}

function configurarInputsCondicionales(configs) {
    configs.forEach(config => {
        if (config.type === 'select') {
            const select = document.querySelector(config.selector);
            if (select) {
                select.addEventListener('change', function() {
                    toggleElement(config.field, this.value === config.value);
                });
            }
        } else {
            document.querySelectorAll(config.selector).forEach(radio => {
                radio.addEventListener('change', function() {
                     toggleElement(config.field, this.value === config.value);
                });
            });
        }
    });
}

function toggleElement(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', show);
}

function generarResumenResidencial() {
    const form = document.getElementById('formResidencial');
    if (!form.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos');
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    
    let resumen = `ANÁLISIS DE CONSUMO RESIDENCIAL: Para el contrato ${formData.get('contrato')}, con servicio ${formData.get('servicio')}. `;
    
    // Estado Medidor
    resumen += `Estado del Medidor: ${formData.get('estado_medidor')}`;
    if (formData.get('estado_medidor') === 'Otro') resumen += ` (${formData.get('estado_medidor_otro')})`;
    resumen += `. `;
    
    // Solo agregar info de custodio si el campo era visible (estado != Buen estado) y tiene valor
    if (formData.get('estado_medidor') !== 'Buen estado' && formData.get('numero_modificacion')) {
        resumen += `Se realiza cadena de custodio, número de sello, se modifica número ${formData.get('numero_modificacion')} por revisión de medida, se instala medidor. `;
    }
    
    // Lecturas
    resumen += `Lectura (m³): ${formData.get('lectura_m3')}. `;
    if (formData.get('lectura_litros')) resumen += `Lectura (litros): ${formData.get('lectura_litros')}. `;
    
    // Datos específicos
    resumen += `Descripción de casa: ${formData.get('descripcion')}. Personas que habitan: ${formData.get('personas')}. `;
    resumen += `Cambios en habitantes (6-12 meses): ${formData.get('cambios_habitantes')}. `;
    
    // Abastecimiento
    const abastecimiento = formData.get('abastecimiento');
    resumen += `Abastecimiento: ${abastecimiento}`;
    if (abastecimiento === 'Otro') resumen += ` (${formData.get('abastecimiento_otro')})`;
    resumen += `. `;
    
    // Fugas y Pruebas
    resumen += `Registra caudal de ingreso: ${formData.get('caudal_ingreso')}`;
    if (formData.get('caudal_ingreso') === 'Sí') resumen += ` (${formData.get('caudal_cantidad')} L/min)`;
    resumen += `. `;
    
    resumen += `Prueba de consumo: ${formData.get('prueba_consumo')}`;
    if (formData.get('prueba_consumo') === 'No') {
        const razon = formData.get('prueba_razon');
        resumen += ` - Razón: ${razon}`;
        if (razon === 'usuario no permite el ingreso') resumen += ` (${formData.get('motivo_no_permite')})`;
        if (razon === 'otra') resumen += ` (${formData.get('otra_razon')})`;
    }
    resumen += `. `;
    
    // Fugas
    const fugas = formData.get('fugas_detectadas');
    resumen += `Detección de fugas: ${fugas}`;
    if (fugas === 'No se detecto') resumen += ` (Se revisaron ${formData.get('puntos_agua_no')} puntos)`;
    if (fugas === 'Se detectó fuga visible') resumen += ` (Se revisaron ${formData.get('puntos_agua_si')} puntos, ubicación: ${formData.get('ubicacion_fuga_detalle')})`;
    resumen += `. `;
    
    resumen += `Atendido por: ${formData.get('persona_atendio')}. `;
    
    const obs = formData.get('observacion');
    if (obs) resumen += `Observación: ${obs}. `;
    
    resumen += `Mantenimiento: Se realiza mantenimiento liviano al medidor.`;
    
    mostrarResumen('residencial', resumen);


    
    // Agregar botón de guardar si no existe
    if (!document.getElementById('btn-guardar-residencial')) {
        const resumenDiv = document.getElementById('resumen-residencial');
        const botonCopiar = document.getElementById('copiar-resumen-residencial');
        
        const botonGuardar = document.createElement('button');
        botonGuardar.type = 'button';
        botonGuardar.id = 'btn-guardar-residencial';
        botonGuardar.className = 'btn-guardar';
        botonGuardar.innerHTML = '💾 Guardar en Google Sheets';
        botonGuardar.onclick = () => guardarResidencialEnSheets();
        
        botonCopiar.parentNode.insertBefore(botonGuardar, botonCopiar.nextSibling);
    }


}

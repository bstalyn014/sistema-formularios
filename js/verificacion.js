document.addEventListener('DOMContentLoaded', function() {
    inicializarFormularioVerificacion();
    cargarPersonal('supervisor-verificacion', 'obrero-verificacion');
    setupCuadrillaDisplay('supervisor-verificacion', 'obrero-verificacion', 'verificacion-cuadrilla-display');
    setupLlaveCorteLogica('#formulario-verificacion');
});

function inicializarFormularioVerificacion() {
    configurarListenersCondicionales('#formulario-verificacion', [
        { name: 'medidor', id: 'medidor-razon-verificacion', condition: val => val === 'Mal estado' },
        { name: 'cajetin', id: 'cajetin-razon-verificacion', condition: val => val === 'Mal estado' },
        { name: 'llave_corte', id: 'llave-corte-razon-verificacion', condition: val => val === 'Mal estado' },
        { name: 'llave_paso', id: 'llave-paso-razon-verificacion', condition: val => val === 'Mal estado' },
        { name: 'medio_nudo', id: 'medio-nudo-accesorio-verificacion', condition: val => val === 'No' },
        { name: 'perno', id: 'perno-razon-verificacion', condition: val => val === 'No se coloca' }
    ]);
    
// ... (resto de inicializarFormularioVerificacion y configurarListenersCondicionales se mantiene igual)

    // Lógica específica de verificación
    const verificacionRadios = document.querySelectorAll('#formulario-verificacion input[name="verificacion"]');
    verificacionRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Ocultar todos primero
            document.getElementById('cortado-opciones').classList.remove('active');
            document.getElementById('reconectado-opciones').classList.remove('active');
            document.getElementById('fraude-opciones').classList.remove('active');

            if (this.value === 'se encontró cortado') {
                document.getElementById('cortado-opciones').classList.add('active');
            } else if (this.value === 'se encontró reconectado') {
                document.getElementById('reconectado-opciones').classList.add('active');
            } else if (this.value === 'se encontró posible fraude') {
                document.getElementById('fraude-opciones').classList.add('active');
            }
        });
    });

    // Sub-condicionales
    const cortadoOpcionRadios = document.querySelectorAll('#formulario-verificacion input[name="cortado_opcion"]');
    cortadoOpcionRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const field = document.getElementById('abastecimiento-field');
            if (field) field.classList.toggle('active', this.value === 'Predio habitado, usuario presente');
        });
    });

    document.querySelectorAll('#formulario-verificacion input[name="reconectado_opcion"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const roturaInput = document.getElementById('rotura-medida');
            if (roturaInput) {
                 if (this.value === 'Corte con rotura') {
                    roturaInput.style.display = 'inline-block';
                } else {
                    roturaInput.style.display = 'none';
                    roturaInput.value = '';
                }
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
                    target.classList.toggle('active', config.condition(this.value));
                }
            });
        });
    });
}

function generarResumenVerificacion() {
    const form = document.getElementById('inspeccionFormVerificacion');
    
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
    
    const tipoVerificacion = formData.get('verificacion');
    let detalleVerificacion = '';
    
    if (tipoVerificacion === 'se encontró cortado') {
        const cortadoOpcion = formData.get('cortado_opcion');
        detalleVerificacion = `se encontró cortado (${cortadoOpcion}`;
        
        if (cortadoOpcion === 'Predio habitado, usuario presente' && formData.get('abastecimiento')) {
            detalleVerificacion += `, ${formData.get('abastecimiento')}`;
        }
        detalleVerificacion += ')';
        
    } else if (tipoVerificacion === 'se encontró reconectado') {
        const reconectadoOpcion = formData.get('reconectado_opcion');
        detalleVerificacion = `se encontró reconectado (${reconectadoOpcion}`;
        
        if (reconectadoOpcion === 'Corte con rotura' && document.getElementById('rotura-medida').value) {
            detalleVerificacion += ` ${document.getElementById('rotura-medida').value}`;
        }
        detalleVerificacion += ')';
        
    } else if (tipoVerificacion === 'se encontró posible fraude') {
        const fraudeDetalle = formData.get('fraude_detalle');
        detalleVerificacion = `se encontró posible fraude (Derivar inspección para carro`;
        if (fraudeDetalle) detalleVerificacion += `, ${fraudeDetalle}`;
        detalleVerificacion += ')';
    }
    
    resumen += `, se procedió a realizar la verificación del corte en donde ${detalleVerificacion}`;
    resumen += `, Predio ${formData.get('predio')}, Color ${formData.get('color')}, Perno ${formData.get('perno')}`;
    
    if (formData.get('perno') === 'No se coloca') resumen += ` (${formData.get('perno_razon')})`;
    
    const observacion = formData.get('observacion');
    if (observacion && observacion.trim() !== '') resumen += `, Observación: ${observacion}`;
    
    mostrarResumen('verificacion', resumen);
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarFormularioCorte();
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
    
    resumen += `, Tipo de llave de corte ${formData.get('tipo_llave')}, llave de corte ${formData.get('llave_corte')}`;
    if (formData.get('llave_corte') === 'Mal estado') resumen += ` (${formData.get('llave_corte_razon')})`;
    
    resumen += ` llave de paso ${formData.get('llave_paso')}`;
    if (formData.get('llave_paso') === 'Mal estado') resumen += ` (${formData.get('llave_paso_razon')})`;
    
    resumen += `, medio nudo ${formData.get('medio_nudo')}`;
    if (formData.get('medio_nudo') === 'No') resumen += ` (${formData.get('medio_nudo_accesorio')})`;
    
    resumen += `, se procede a realizar corte del servicio ${formData.get('corte')}, predio ${formData.get('predio')}, color ${formData.get('color')}, perno ${formData.get('perno')}`;
    if (formData.get('perno') === 'No se coloca') resumen += ` (${formData.get('perno_razon')})`;
    
    if (formData.get('observacion')) resumen += `, Observación: ${formData.get('observacion')}`;
    
    mostrarResumen('corte', resumen);
}

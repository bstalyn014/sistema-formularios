// =============================================
// CONFIGURACIÓN INICIAL Y VARIABLES GLOBALES
// =============================================

let formularioActual = '';
let tareaActual = '';

// =============================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema Unificado de Gestión Técnica - Inicializando...');
    
    // Inicializar navegación y eventos
    inicializarEventListeners();
    inicializarBotonesCopiar();
    inicializarItemsCobro();
    inicializarCamposCondicionales();
    
    console.log('Sistema inicializado correctamente');
});

// =============================================
// FUNCIONES DE NAVEGACIÓN PRINCIPAL
// =============================================

function seleccionarTarea(tipo) {
    console.log('Seleccionando tarea:', tipo);
    tareaActual = tipo;
    
    // Ocultar todos los elementos visibles
    ocultarTodosLosElementos();
    
    if (tipo === 'analisis') {
        // Mostrar submenú de análisis
        mostrarElemento('submenu-analisis');
    } else {
        // Mostrar formulario correspondiente
        mostrarFormulario(tipo);
    }
    
    // Desplazar al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function seleccionarFormulario(tipo) {
    console.log('Seleccionando formulario de análisis:', tipo);
    formularioActual = tipo;
    
    // Ocultar todos los elementos
    ocultarTodosLosElementos();
    
    // Mostrar el formulario seleccionado
    mostrarFormulario(tipo);
    
    // Desplazar al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function volverAlMenuPrincipal() {
    console.log('Volviendo al menú principal...');
    ocultarTodosLosElementos();
    mostrarElemento('menu-principal');
    formularioActual = '';
    tareaActual = '';
}

function volverAlSubmenuAnalisis() {
    console.log('Volviendo al submenú de análisis...');
    ocultarTodosLosElementos();
    mostrarElemento('submenu-analisis');
}

// =============================================
// FUNCIONES DE VISIBILIDAD
// =============================================

function ocultarTodosLosElementos() {
    const elementos = document.querySelectorAll('.menu-section, .formulario, .resumen');
    elementos.forEach(elemento => {
        elemento.classList.remove('active');
    });
}

function mostrarElemento(id) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.classList.add('active');
    }
}

function mostrarFormulario(tipo) {
    const formularioId = `formulario-${tipo}`;
    mostrarElemento(formularioId);
}

// =============================================
// FUNCIONES PARA CAMPOS CONDICIONALES
// =============================================

function inicializarCamposCondicionales() {
    console.log('Inicializando campos condicionales...');
    
    // Inicializar todos los formularios
    inicializarFormularioCorte();
    inicializarFormularioReconexion();
    inicializarFormularioVerificacion();
    inicializarFormularioResidencial();
    inicializarFormularioComercial();
}

function inicializarFormularioCorte() {
    const form = document.getElementById('formulario-corte');
    if (!form) return;
    
    // Medidor - Mal estado
    const medidorRadios = form.querySelectorAll('input[name="medidor"]');
    medidorRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('medidor-razon-corte');
            if (this.value === 'Mal estado') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
    
    // Cajetin - Mal estado
    const cajetinRadios = form.querySelectorAll('input[name="cajetin"]');
    cajetinRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('cajetin-razon-corte');
            if (this.value === 'Mal estado') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
    
    // Llave de corte - Mal estado
    const llaveCorteRadios = form.querySelectorAll('input[name="llave_corte"]');
    llaveCorteRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('llave-corte-razon-corte');
            if (this.value === 'Mal estado') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
    
    // Llave de paso - Mal estado
    const llavePasoRadios = form.querySelectorAll('input[name="llave_paso"]');
    llavePasoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('llave-paso-razon-corte');
            if (this.value === 'Mal estado') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
    
    // Medio nudo - No
    const medioNudoRadios = form.querySelectorAll('input[name="medio_nudo"]');
    medioNudoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const accesorioField = document.getElementById('medio-nudo-accesorio-corte');
            if (this.value === 'No') {
                accesorioField.classList.add('active');
            } else {
                accesorioField.classList.remove('active');
            }
        });
    });
    
    // Perno - No se coloca
    const pernoRadios = form.querySelectorAll('input[name="perno"]');
    pernoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('perno-razon-corte');
            if (this.value === 'No se coloca') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
}

function inicializarFormularioVerificacion() {
    const form = document.getElementById('formulario-verificacion');
    if (!form) return;
    
    // Verificación tipo
    const verificacionRadios = form.querySelectorAll('input[name="verificacion"]');
    verificacionRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Ocultar todos los campos condicionales primero
            document.getElementById('cortado-opciones')?.classList.remove('active');
            document.getElementById('reconectado-opciones')?.classList.remove('active');
            document.getElementById('fraude-opciones')?.classList.remove('active');
            
            // Mostrar el correspondiente
            if (this.value === 'se encontró cortado') {
                document.getElementById('cortado-opciones')?.classList.add('active');
            } else if (this.value === 'se encontró reconectado') {
                document.getElementById('reconectado-opciones')?.classList.add('active');
            } else if (this.value === 'se encontró posible fraude') {
                document.getElementById('fraude-opciones')?.classList.add('active');
            }
        });
    });
    
    // Cortado opciones - Predio habitado
    const cortadoRadios = form.querySelectorAll('input[name="cortado_opcion"]');
    cortadoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const abastecimientoField = document.getElementById('abastecimiento-field');
            if (this.value === 'Predio habitado, usuario presente') {
                abastecimientoField?.classList.add('active');
            } else {
                abastecimientoField?.classList.remove('active');
            }
        });
    });
    
    // Corte con rotura
    const reconectadoRadios = form.querySelectorAll('input[name="reconectado_opcion"]');
    reconectadoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const roturaMedida = document.getElementById('rotura-medida');
            if (this.value === 'Corte con rotura') {
                roturaMedida.style.display = 'inline-block';
                roturaMedida.required = true;
            } else {
                roturaMedida.style.display = 'none';
                roturaMedida.required = false;
            }
        });
    });
    
    // Inicializar otros campos condicionales (medidor, cajetin, etc.)
    inicializarCamposComunesVerificacion();
}

function inicializarCamposComunesVerificacion() {
    const form = document.getElementById('formulario-verificacion');
    if (!form) return;
    
    // Medidor - Mal estado
    const medidorRadios = form.querySelectorAll('input[name="medidor"]');
    medidorRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('medidor-razon-verificacion');
            if (this.value === 'Mal estado') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
    
    // Cajetin - Mal estado
    const cajetinRadios = form.querySelectorAll('input[name="cajetin"]');
    cajetinRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('cajetin-razon-verificacion');
            if (this.value === 'Mal estado') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
    
    // Llave de corte - Mal estado
    const llaveCorteRadios = form.querySelectorAll('input[name="llave_corte"]');
    llaveCorteRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('llave-corte-razon-verificacion');
            if (this.value === 'Mal estado') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
    
    // Llave de paso - Mal estado
    const llavePasoRadios = form.querySelectorAll('input[name="llave_paso"]');
    llavePasoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('llave-paso-razon-verificacion');
            if (this.value === 'Mal estado') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
    
    // Medio nudo - No
    const medioNudoRadios = form.querySelectorAll('input[name="medio_nudo"]');
    medioNudoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const accesorioField = document.getElementById('medio-nudo-accesorio-verificacion');
            if (this.value === 'No') {
                accesorioField.classList.add('active');
            } else {
                accesorioField.classList.remove('active');
            }
        });
    });
    
    // Perno - No se coloca
    const pernoRadios = form.querySelectorAll('input[name="perno"]');
    pernoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const razonField = document.getElementById('perno-razon-verificacion');
            if (this.value === 'No se coloca') {
                razonField.classList.add('active');
            } else {
                razonField.classList.remove('active');
            }
        });
    });
}

// Agrega funciones similares para los otros formularios
function inicializarFormularioReconexion() {
    // Similar a inicializarFormularioCorte
}

function inicializarFormularioResidencial() {
    // Inicializar campos condicionales del formulario residencial
}

function inicializarFormularioComercial() {
    // Inicializar campos condicionales del formulario comercial
}

// =============================================
// FUNCIONES PARA GENERAR RESUMENES
// =============================================

function generarResumenCorte() {
    console.log('Generando resumen de corte...');
    
    const formulario = document.getElementById('inspeccionFormCorte');
    
    if (!formulario.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos del formulario de corte');
        formulario.reportValidity();
        return;
    }
    
    const formData = new FormData(formulario);
    
    // Procesar información de la cuadrilla
    const cuadrillaCompleta = formData.get('cuadrilla');
    let supervisor = '';
    let obrero = '';
    
    if (cuadrillaCompleta && cuadrillaCompleta !== "Seleccione una cuadrilla") {
        const partes = cuadrillaCompleta.split(' / ');
        if (partes.length === 2) {
            supervisor = partes[0].trim();
            obrero = partes[1].trim();
        } else {
            supervisor = cuadrillaCompleta;
            obrero = "No especificado";
        }
    }
    
    // Construir el resumen
    let resumen = `Contrato: ${formData.get('contrato')}, la cuadrilla con supervisor: ${supervisor} y obrero: ${obrero}, al momento de la inspección se encontró servicio App ${formData.get('servicio')} medidor ${formData.get('medidor')}`;
    
    if (formData.get('medidor') === 'Mal estado' && formData.get('medidor_razon')) {
        resumen += ` (${formData.get('medidor_razon')})`;
    }
    
    resumen += `, lectura ${formData.get('lectura')} M3, litros ${formData.get('litros')}, cajetin ${formData.get('cajetin')}`;
    
    if (formData.get('cajetin') === 'Mal estado' && formData.get('cajetin_tipo_dano')) {
        resumen += ` (${formData.get('cajetin_tipo_dano')})`;
    }
    
    resumen += `, Tipo de llave de corte ${formData.get('tipo_llave')}, llave de corte ${formData.get('llave_corte')}`;
    
    if (formData.get('llave_corte') === 'Mal estado' && formData.get('llave_corte_razon')) {
        resumen += ` (${formData.get('llave_corte_razon')})`;
    }
    
    resumen += ` llave de paso ${formData.get('llave_paso')}`;
    
    if (formData.get('llave_paso') === 'Mal estado' && formData.get('llave_paso_razon')) {
        resumen += ` (${formData.get('llave_paso_razon')})`;
    }
    
    resumen += `, medio nudo ${formData.get('medio_nudo')}`;
    
    if (formData.get('medio_nudo') === 'No' && formData.get('medio_nudo_accesorio')) {
        resumen += ` (${formData.get('medio_nudo_accesorio')})`;
    }
    
    resumen += `, se procede a realizar corte del servicio ${formData.get('corte')}, predio ${formData.get('predio')}, color ${formData.get('color')}, perno ${formData.get('perno')}`;
    
    if (formData.get('perno') === 'No se coloca' && formData.get('perno_razon')) {
        resumen += ` (${formData.get('perno_razon')})`;
    }
    
    if (formData.get('observacion')) {
        resumen += `, Observación: ${formData.get('observacion')}`;
    }
    
    console.log('Resumen generado:', resumen);
    mostrarResumen('corte', resumen);
}

function generarResumenReconexion() {
    console.log('Generando resumen de reconexión...');
    
    const formulario = document.getElementById('inspeccionFormReconexion');
    
    if (!formulario.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos del formulario de reconexión');
        formulario.reportValidity();
        return;
    }
    
    const formData = new FormData(formulario);
    
    // Procesar información de la cuadrilla
    const cuadrillaCompleta = formData.get('cuadrilla');
    let supervisor = '';
    let obrero = '';
    
    if (cuadrillaCompleta && cuadrillaCompleta !== "Seleccione una cuadrilla") {
        const partes = cuadrillaCompleta.split(' / ');
        if (partes.length === 2) {
            supervisor = partes[0].trim();
            obrero = partes[1].trim();
        } else {
            supervisor = cuadrillaCompleta;
            obrero = "No especificado";
        }
    }
    
    // Construir el resumen
    let resumen = `Contrato: ${formData.get('contrato')}, la cuadrilla con supervisor: ${supervisor} y obrero: ${obrero}, al momento de la inspección se encontró el Servicio App ${formData.get('servicio')}, Medidor ${formData.get('medidor')}`;
    
    if (formData.get('medidor') === 'Mal estado' && formData.get('medidor_razon')) {
        resumen += ` (${formData.get('medidor_razon')})`;
    }
    
    resumen += `, Lectura ${formData.get('lectura')} M3, Litros ${formData.get('litros')}, Cajetin ${formData.get('cajetin')}`;
    
    if (formData.get('cajetin') === 'Mal estado' && formData.get('cajetin_tipo_dano')) {
        resumen += ` (${formData.get('cajetin_tipo_dano')})`;
    }
    
    resumen += `, Tipo de llave de corte ${formData.get('tipo_llave')}, Llave de corte ${formData.get('llave_corte')}`;
    
    if (formData.get('llave_corte') === 'Mal estado' && formData.get('llave_corte_razon')) {
        resumen += ` (${formData.get('llave_corte_razon')})`;
    }
    
    resumen += `, Llave de paso ${formData.get('llave_paso')}`;
    
    if (formData.get('llave_paso') === 'Mal estado' && formData.get('llave_paso_razon')) {
        resumen += ` (${formData.get('llave_paso_razon')})`;
    }
    
    resumen += `, Medio nudo ${formData.get('medio_nudo')}`;
    
    if (formData.get('medio_nudo') === 'No' && formData.get('medio_nudo_accesorio')) {
        resumen += ` (${formData.get('medio_nudo_accesorio')})`;
    }
    
    // Parte específica de reconexión
    const tipoReconexion = formData.get('reconexion');
    if (tipoReconexion === 'ya estaba reconectado') {
        resumen += `, se encontró el servicio reconectado`;
    } else {
        resumen += `, se procede a realizar la reconexión del servicio ${tipoReconexion}`;
    }
    
    resumen += `, Predio ${formData.get('predio')}, Color ${formData.get('color')}, Perno ${formData.get('perno')}`;
    
    if (formData.get('perno') === 'No se coloca' && formData.get('perno_razon')) {
        resumen += ` (${formData.get('perno_razon')})`;
    }
    
    // Agregar ítem de cobro si existe
    const itemCobro = formData.get('item_cobro');
    if (itemCobro && itemCobro.trim() !== '') {
        resumen += `, Item de cobro: ${itemCobro}`;
    }
    
    if (formData.get('observacion')) {
        resumen += `, Observación: ${formData.get('observacion')}`;
    }
    
    console.log('Resumen de reconexión generado:', resumen);
    mostrarResumen('reconexion', resumen);
}

function generarResumenVerificacion() {
    console.log('Generando resumen de verificación...');
    
    const formulario = document.getElementById('inspeccionFormVerificacion');
    
    if (!formulario) {
        console.error('No se encontró el formulario de verificación');
        return;
    }
    
    if (!formulario.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos del formulario de verificación');
        formulario.reportValidity();
        return;
    }
    
    const formData = new FormData(formulario);
    
    // Procesar información de la cuadrilla
    const cuadrillaCompleta = formData.get('cuadrilla');
    let supervisor = '';
    let obrero = '';
    
    if (cuadrillaCompleta && cuadrillaCompleta !== "Seleccione una cuadrilla") {
        const partes = cuadrillaCompleta.split(' / ');
        if (partes.length === 2) {
            supervisor = partes[0].trim();
            obrero = partes[1].trim();
        } else {
            supervisor = cuadrillaCompleta;
            obrero = "No especificado";
        }
    }
    
    // Construir el resumen base
    let resumen = `Contrato: ${formData.get('contrato')}, la cuadrilla con supervisor: ${supervisor} y obrero: ${obrero}, al momento de la inspección se encontró el Servicio App ${formData.get('servicio')}, Medidor ${formData.get('medidor')}`;
    
    if (formData.get('medidor') === 'Mal estado' && formData.get('medidor_razon')) {
        resumen += ` (${formData.get('medidor_razon')})`;
    }
    
    resumen += `, Lectura ${formData.get('lectura')} M3, Litros ${formData.get('litros')}, Cajetin ${formData.get('cajetin')}`;
    
    if (formData.get('cajetin') === 'Mal estado' && formData.get('cajetin_tipo_dano')) {
        resumen += ` (${formData.get('cajetin_tipo_dano')})`;
    }
    
    resumen += `, Tipo de llave de corte ${formData.get('tipo_llave')}, Llave de corte ${formData.get('llave_corte')}`;
    
    if (formData.get('llave_corte') === 'Mal estado' && formData.get('llave_corte_razon')) {
        resumen += ` (${formData.get('llave_corte_razon')})`;
    }
    
    resumen += `, Llave de paso ${formData.get('llave_paso')}`;
    
    if (formData.get('llave_paso') === 'Mal estado' && formData.get('llave_paso_razon')) {
        resumen += ` (${formData.get('llave_paso_razon')})`;
    }
    
    resumen += `, Medio nudo ${formData.get('medio_nudo')}`;
    
    if (formData.get('medio_nudo') === 'No' && formData.get('medio_nudo_accesorio')) {
        resumen += ` (${formData.get('medio_nudo_accesorio')})`;
    }
    
    // Parte específica de verificación
    const tipoVerificacion = formData.get('verificacion');
    let detalleVerificacion = '';
    
    if (tipoVerificacion === 'se encontró cortado') {
        const cortadoOpcion = formData.get('cortado_opcion');
        if (cortadoOpcion) {
            detalleVerificacion = `se encontró cortado (${cortadoOpcion}`;
            
            if (cortadoOpcion === 'Predio habitado, usuario presente' && formData.get('abastecimiento')) {
                detalleVerificacion += `, ${formData.get('abastecimiento')}`;
            }
            
            detalleVerificacion += ')';
        } else {
            detalleVerificacion = 'se encontró cortado (sin especificar)';
        }
        
    } else if (tipoVerificacion === 'se encontró reconectado') {
        const reconectadoOpcion = formData.get('reconectado_opcion');
        if (reconectadoOpcion) {
            detalleVerificacion = `se encontró reconectado (${reconectadoOpcion}`;
            
            if (reconectadoOpcion === 'Corte con rotura') {
                const roturaMedida = document.getElementById('rotura-medida').value;
                if (roturaMedida) {
                    detalleVerificacion += ` ${roturaMedida}`;
                }
            }
            
            detalleVerificacion += ')';
        } else {
            detalleVerificacion = 'se encontró reconectado (sin especificar)';
        }
        
    } else if (tipoVerificacion === 'se encontró posible fraude') {
        const fraudeDetalle = formData.get('fraude_detalle');
        detalleVerificacion = `se encontró posible fraude (Derivar inspección para carro`;
        
        if (fraudeDetalle) {
            detalleVerificacion += `, ${fraudeDetalle}`;
        }
        
        detalleVerificacion += ')';
    } else {
        detalleVerificacion = 'sin especificar';
    }
    
    resumen += `, se procedió a realizar la verificación del corte en donde ${detalleVerificacion}`;
    
    resumen += `, Predio ${formData.get('predio')}, Color ${formData.get('color')}, Perno ${formData.get('perno')}`;
    
    if (formData.get('perno') === 'No se coloca' && formData.get('perno_razon')) {
        resumen += ` (${formData.get('perno_razon')})`;
    }
    
    if (formData.get('observacion')) {
        resumen += `, Observación: ${formData.get('observacion')}`;
    }
    
    console.log('Resumen de verificación generado:', resumen);
    mostrarResumen('verificacion', resumen);
}

function generarResumenResidencial() {
    console.log('Generando resumen residencial...');
    
    const formulario = document.getElementById('formResidencial');
    
    if (!formulario.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos del formulario residencial');
        formulario.reportValidity();
        return;
    }
    
    // Aquí va la lógica específica para el formulario residencial
    let resumen = "Resumen del análisis residencial - Función en desarrollo";
    
    mostrarResumen('residencial', resumen);
}

function generarResumenComercial() {
    console.log('Generando resumen comercial...');
    
    const formulario = document.getElementById('formComercial');
    
    if (!formulario.checkValidity()) {
        alert('Por favor, complete todos los campos requeridos del formulario comercial');
        formulario.reportValidity();
        return;
    }
    
    // Aquí va la lógica específica para el formulario comercial
    let resumen = "Resumen del análisis comercial - Función en desarrollo";
    
    mostrarResumen('comercial', resumen);
}

// =============================================
// FUNCIÓN COMÚN PARA MOSTRAR RESUMENES
// =============================================

function mostrarResumen(tipo, contenido) {
    console.log(`Mostrando resumen de ${tipo}...`);
    console.log('Contenido a mostrar:', contenido);
    
    // Ocultar formulario actual
    const formularioElemento = document.getElementById(`formulario-${tipo}`);
    if (formularioElemento) {
        formularioElemento.classList.remove('active');
    }
    
    // Mostrar resumen
    const resumenElemento = document.getElementById(`resumen-${tipo}`);
    const contenidoElemento = document.getElementById(`resumen-contenido-${tipo}`);
    
    console.log('Elemento resumen encontrado:', !!resumenElemento);
    console.log('Elemento contenido encontrado:', !!contenidoElemento);
    
    if (resumenElemento && contenidoElemento) {
        contenidoElemento.textContent = contenido;
        resumenElemento.classList.add('active');
        
        // Desplazar al resumen
        setTimeout(() => {
            resumenElemento.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
        
        console.log('Resumen mostrado correctamente');
    } else {
        console.error(`No se encontró el elemento resumen-${tipo} o resumen-contenido-${tipo}`);
    }
}

// =============================================
// FUNCIONES PARA VOLVER A FORMULARIOS
// =============================================

function volverAlFormularioCorte() {
    ocultarTodosLosElementos();
    mostrarElemento('formulario-corte');
    document.getElementById('inspeccionFormCorte').reset();
    // Restablecer campos condicionales
    document.getElementById('medidor-razon-corte')?.classList.remove('active');
    document.getElementById('cajetin-razon-corte')?.classList.remove('active');
    document.getElementById('llave-corte-razon-corte')?.classList.remove('active');
    document.getElementById('llave-paso-razon-corte')?.classList.remove('active');
    document.getElementById('medio-nudo-accesorio-corte')?.classList.remove('active');
    document.getElementById('perno-razon-corte')?.classList.remove('active');
}

function volverAlFormularioReconexion() {
    ocultarTodosLosElementos();
    mostrarElemento('formulario-reconexion');
    document.getElementById('inspeccionFormReconexion').reset();
}

function volverAlFormularioVerificacion() {
    ocultarTodosLosElementos();
    mostrarElemento('formulario-verificacion');
    document.getElementById('inspeccionFormVerificacion').reset();
    // Restablecer campos condicionales
    document.getElementById('cortado-opciones')?.classList.remove('active');
    document.getElementById('reconectado-opciones')?.classList.remove('active');
    document.getElementById('fraude-opciones')?.classList.remove('active');
    document.getElementById('abastecimiento-field')?.classList.remove('active');
    document.getElementById('medidor-razon-verificacion')?.classList.remove('active');
    document.getElementById('cajetin-razon-verificacion')?.classList.remove('active');
    document.getElementById('llave-corte-razon-verificacion')?.classList.remove('active');
    document.getElementById('llave-paso-razon-verificacion')?.classList.remove('active');
    document.getElementById('medio-nudo-accesorio-verificacion')?.classList.remove('active');
    document.getElementById('perno-razon-verificacion')?.classList.remove('active');
}

function volverAlFormularioResidencial() {
    ocultarTodosLosElementos();
    mostrarElemento('formulario-residencial');
    document.getElementById('formResidencial').reset();
}

function volverAlFormularioComercial() {
    ocultarTodosLosElementos();
    mostrarElemento('formulario-comercial');
    document.getElementById('formComercial').reset();
}

// =============================================
// FUNCIONES PARA COPIAR RESUMENES
// =============================================

function inicializarBotonesCopiar() {
    console.log('Configurando botones de copiar...');
    
    const tipos = ['corte', 'reconexion', 'verificacion', 'residencial', 'comercial'];
    
    tipos.forEach(tipo => {
        const boton = document.getElementById(`copiar-resumen-${tipo}`);
        if (boton) {
            boton.addEventListener('click', () => copiarResumen(tipo));
        }
    });
}

function copiarResumen(tipo) {
    const textoResumen = document.getElementById(`resumen-contenido-${tipo}`)?.textContent;
    const botonCopiar = document.getElementById(`copiar-resumen-${tipo}`);
    
    if (!textoResumen || !textoResumen.trim()) {
        alert('No hay resumen para copiar. Genera el reporte primero.');
        return;
    }
    
    if (!botonCopiar) {
        alert('Error: No se encontró el botón de copiar.');
        return;
    }
    
    // Intentar usar la API moderna del portapapeles
    navigator.clipboard.writeText(textoResumen.trim())
        .then(() => {
            mostrarFeedbackCopiado(botonCopiar);
        })
        .catch(err => {
            console.error('Error al copiar con API moderna:', err);
            // Fallback para navegadores más antiguos
            copiarConFallback(textoResumen.trim(), botonCopiar);
        });
}

function mostrarFeedbackCopiado(boton) {
    const textoOriginal = boton.textContent;
    const iconoOriginal = boton.innerHTML;
    
    boton.textContent = '✅ ¡Copiado!';
    boton.classList.add('copiado');
    boton.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.innerHTML = iconoOriginal;
        boton.classList.remove('copiado');
        boton.style.backgroundColor = '';
    }, 2000);
}

function copiarConFallback(texto, boton) {
    try {
        const areaTemporal = document.createElement('textarea');
        areaTemporal.value = texto;
        areaTemporal.style.position = 'fixed';
        areaTemporal.style.left = '-999999px';
        areaTemporal.style.top = '-999999px';
        document.body.appendChild(areaTemporal);
        areaTemporal.select();
        areaTemporal.setSelectionRange(0, 99999); // Para móviles
        
        const exito = document.execCommand('copy');
        document.body.removeChild(areaTemporal);
        
        if (exito) {
            mostrarFeedbackCopiado(boton);
        } else {
            alert('No se pudo copiar el texto. Por favor, copia manualmente.');
        }
    } catch (error) {
        console.error('Error en fallback de copiado:', error);
        alert('Error al copiar. Por favor, copia manualmente.');
    }
}

// =============================================
// FUNCIONES PARA ÍTEMS DE COBRO
// =============================================

const itemsCobro = [
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
    console.log('Inicializando ítems de cobro...');
    
    const datalist = document.getElementById('items-cobro-list');
    if (!datalist) return;
    
    // Limpiar datalist existente
    datalist.innerHTML = '';
    
    // Llenar el datalist con las opciones
    itemsCobro.forEach(item => {
        const option = document.createElement('option');
        option.value = item.nombre;
        option.setAttribute('data-precio', item.precio);
        datalist.appendChild(option);
    });
    
    console.log(`Se cargaron ${itemsCobro.length} ítems de cobro`);
}

// =============================================
// INICIALIZACIÓN DE EVENT LISTENERS
// =============================================

function inicializarEventListeners() {
    console.log('Configurando event listeners...');
    
    // Configurar evento para el campo de rotura-medida
    const corteConRoturaRadio = document.querySelector('input[name="reconectado_opcion"][value="Corte con rotura"]');
    if (corteConRoturaRadio) {
        corteConRoturaRadio.addEventListener('change', function() {
            const roturaMedida = document.getElementById('rotura-medida');
            if (this.checked) {
                roturaMedida.style.display = 'inline-block';
                roturaMedida.required = true;
            }
        });
    }
}

// =============================================
// EXPORTACIÓN DE FUNCIONES PARA USO GLOBAL
// =============================================

window.seleccionarTarea = seleccionarTarea;
window.seleccionarFormulario = seleccionarFormulario;
window.volverAlMenuPrincipal = volverAlMenuPrincipal;
window.volverAlSubmenuAnalisis = volverAlSubmenuAnalisis;
window.generarResumenCorte = generarResumenCorte;
window.generarResumenReconexion = generarResumenReconexion;
window.generarResumenVerificacion = generarResumenVerificacion;
window.generarResumenResidencial = generarResumenResidencial;
window.generarResumenComercial = generarResumenComercial;
window.volverAlFormularioCorte = volverAlFormularioCorte;
window.volverAlFormularioReconexion = volverAlFormularioReconexion;
window.volverAlFormularioVerificacion = volverAlFormularioVerificacion;
window.volverAlFormularioResidencial = volverAlFormularioResidencial;
window.volverAlFormularioComercial = volverAlFormularioComercial;

console.log('Sistema Unificado de Gestión Técnica - Cargado correctamente');
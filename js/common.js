// =============================================
// FUNCIONES DE UTILIDAD (COMPARTIDAS)
// =============================================

const PERSONAL = [
    "ARIAS SOLORZANO MICHAEL ANDRES",
    "BARREZUETA CARBO ALLAN PETER",
    "BRAVO VARGAS JOSE ALEJANDRO",
    "CABRERA SILVA JOSE ALBERTO",
    "COFRE VALVERDE CARLOS ANDRES",
    "CARRANZA BRAVO PETER JAHIR",
    "ESPINOZA SANCHEZ JOSUE AUGUSTO",
    "GUERRERO FERNANDEZ RODOLFO ANDRES",
    "GUZHÑAY LUIS",
    "LANDIN QUIÑONEZ CAMILO FERNANDO",
    "MARCILLO ALVARADO GILSON ALBERTO",
    "MARTINEZ VALVERDE CHRISTIAN",
    "MONTENEGRO TORRES KEVIN MARTIN",
    "MORAN TOMALA MOISES ALBERTO",
    "MOTA GARCIA LUIS ALBERTO",
    "ORDOÑEZ LUCANO EDISON ALEX",
    "PAUCAR LOPEZ JAVIER ENRIQUE",
    "PEREZ RODRIGUEZ MARIO ANTHONY",
    "RODRIGUEZ VERA ELIAS JOSÉ",
    "TIGUA PLUAS RICHARD ALEX",
    "YAGUAL GONZALEZ ERICK JOSUE",
    "ZHUNIO CHELE KEVIN JAVIER",
    "ZUÑIGA CAJAPE ANGELLO ISRAEL"
];

function cargarPersonal(supervisorId, obreroId) {
    const supervisorSelect = document.getElementById(supervisorId);
    const obreroSelect = document.getElementById(obreroId);

    if (!supervisorSelect || !obreroSelect) return;

    // Limpiar opciones existentes (manteniendo la opción por defecto)
    supervisorSelect.innerHTML = '<option value="">Seleccione un supervisor</option>';
    obreroSelect.innerHTML = '<option value="">Seleccione un obrero</option>';

    PERSONAL.sort().forEach(nombre => {
        const optionS = document.createElement('option');
        optionS.value = nombre;
        optionS.textContent = nombre;
        supervisorSelect.appendChild(optionS);

        const optionO = document.createElement('option');
        optionO.value = nombre;
        optionO.textContent = nombre;
        obreroSelect.appendChild(optionO);
    });
}

function obtenerDatosCuadrilla(formData) {
    // Intenta obtener datos de campos individuales primero
    const supervisor = formData.get('supervisor');
    const obrero = formData.get('obrero');

    if (supervisor && obrero) {
        return { supervisor, obrero };
    }

    // Fallback para soporte legacy o si falla algo
    const cuadrillaCompleta = formData.get('cuadrilla');
    if (!cuadrillaCompleta || cuadrillaCompleta === "Seleccione una cuadrilla") {
        return { supervisor: '', obrero: '' };
    }

    const partes = cuadrillaCompleta.split(' / ');
    if (partes.length === 2) {
        return { 
            supervisor: partes[0].trim(), 
            obrero: partes[1].trim() 
        };
    } else {
        return { 
            supervisor: cuadrillaCompleta, 
            obrero: "No especificado" 
        };
    }
}

function mostrarResumen(tipo, contenido) {
    console.log('Mostrando resumen para:', tipo);
    // Ocultar contenido del formulario (header y form), mantener contenedor
    const formularioContainer = document.querySelector('.formulario.active') || document.querySelector('.formulario');
    
    if (formularioContainer) {
        const header = formularioContainer.querySelector('header');
        const form = formularioContainer.querySelector('form');
        if (header) header.style.display = 'none';
        if (form) form.style.display = 'none';
    }
    
    // Mostrar resumen
    const resumenElement = document.getElementById(`resumen-${tipo}`);
    const contenidoElement = document.getElementById(`resumen-contenido-${tipo}`);
    
    if (resumenElement && contenidoElement) {
        contenidoElement.textContent = contenido;
        resumenElement.classList.add('active');
        resumenElement.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error(`No se encontraron elementos de resumen: resumen-${tipo} o resumen-contenido-${tipo}`);
    }
}

function inicializarBotonesCopiar() {
    const buttons = document.querySelectorAll('.btn-copiar');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tipo = this.id.replace('copiar-resumen-', '');
            copiarResumen(tipo, this);
        });
    });
}

function copiarResumen(tipo, boton) {
    const contenido = document.getElementById(`resumen-contenido-${tipo}`).textContent;
    if (!contenido) return;
    
    navigator.clipboard.writeText(contenido).then(() => {
        const originalText = boton.textContent;
        boton.textContent = '✅ ¡Copiado!';
        boton.classList.add('copiado');
        setTimeout(() => {
            boton.textContent = originalText;
            boton.classList.remove('copiado');
        }, 2000);
    }).catch(err => alert('Error al copiar: ' + err));
}

function setupCuadrillaDisplay(supervisorId, obreroId, displayId) {
    const supervisorSelect = document.getElementById(supervisorId);
    const obreroSelect = document.getElementById(obreroId);
    const displayElement = document.getElementById(displayId);

    if (!supervisorSelect || !obreroSelect || !displayElement) return;

    function updateDisplay() {
        const supervisor = supervisorSelect.value;
        const obrero = obreroSelect.value;

        if (supervisor && obrero) {
            displayElement.textContent = `Cuadrilla: ${supervisor} / ${obrero}`;
            displayElement.classList.add('active');
        } else {
            displayElement.classList.remove('active');
        }
    }

    supervisorSelect.addEventListener('change', updateDisplay);
    obreroSelect.addEventListener('change', updateDisplay);
}

function volverAlFormulario(tipo) {
    const resumen = document.getElementById(`resumen-${tipo}`);
    const formularioContainer = document.querySelector('.formulario.active') || document.querySelector('.formulario');

    if (resumen) {
        resumen.classList.remove('active');
        resumen.style.display = 'none';
    }
    
    if (formularioContainer) {
        const header = formularioContainer.querySelector('header');
        const form = formularioContainer.querySelector('form');
        
        if (header) header.style.display = 'block';
        if (form) {
            form.style.display = 'block';
            form.reset();
        }
        
        // Resetear campos condicionales
        document.querySelectorAll('.conditional-field').forEach(field => {
            field.classList.remove('active');
            field.style.display = 'none'; // Asegurar que se oculten visualmente
        });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// DATOS Y LÓGICA DE ITEMS DE COBRO
// =============================================

const ITEMS_COBRO_DATA = [
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

function cargarItemsCobro(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione un ítem de cobro</option>';

    ITEMS_COBRO_DATA.forEach(item => {
        const option = document.createElement('option');
        option.value = item.nombre;
        option.textContent = item.nombre;
        select.appendChild(option);
    });
}

// =============================================
// LÓGICA COMÚN PARA LLAVES
// =============================================
function setupLlaveCorteLogica(contexto) {
    const llaveCorteRadios = document.querySelectorAll(`${contexto} input[name="llave_corte"]`);
    const tipoLlaveRadios = document.querySelectorAll(`${contexto} input[name="tipo_llave"]`);
    
    // Función para manejar el estado
    const actualizarEstadoTipoLlave = (valor) => {
        const esNoTiene = valor === 'No tiene';
        
        tipoLlaveRadios.forEach(radio => {
            radio.disabled = esNoTiene;
            if (esNoTiene) {
                radio.checked = false;
                // Opcional: Agregar clase visual para indicar deshabilitado
                radio.parentElement.style.opacity = '0.5';
                radio.parentElement.style.cursor = 'not-allowed';
            } else {
                radio.parentElement.style.opacity = '1';
                radio.parentElement.style.cursor = 'pointer';
            }
        });
    };

    // Listener para cambios
    llaveCorteRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            actualizarEstadoTipoLlave(this.value);
            
            // Lógica existente para "Mal estado" (condicional de razón)
            // Se asume que esa lógica ya está cubierta por configurarListenersCondicionales
            // Aquí solo manejamos el bloqueo de "Tipo de llave"
        });
    });
}

// =============================================
// PERSISTENCIA LOCAL (CORTE -> RECONEXIÓN)
// =============================================
function guardarCorteLocal(contrato, datos) {
    if (!contrato) return;
    try {
        const cortesGuardados = JSON.parse(localStorage.getItem('cortesRecientes') || '{}');
        // Guardar con timestamp para poder limpiar antiguos si se necesitase
        cortesGuardados[contrato] = {
            timestamp: new Date().getTime(),
            datos: datos
        };
        localStorage.setItem('cortesRecientes', JSON.stringify(cortesGuardados));
        console.log(`Datos de corte guardados para contrato: ${contrato}`);
    } catch (e) {
        console.error('Error al guardar en localStorage:', e);
    }
}

function obtenerCorteLocal(contrato) {
    if (!contrato) return null;
    try {
        const cortesGuardados = JSON.parse(localStorage.getItem('cortesRecientes') || '{}');
        const registro = cortesGuardados[contrato];
        
        if (registro) {
            // Opcional: Validar antigüedad (ej. : borrar si tiene más de 24 horas)
            // Por ahora retornamos siempre que exista
            return registro.datos;
        }
    } catch (e) {
        console.error('Error al leer de localStorage:', e);
    }
    return null;
}

// Inicialización común
document.addEventListener('DOMContentLoaded', function() {
    inicializarBotonesCopiar();
});

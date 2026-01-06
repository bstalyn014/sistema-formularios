// =============================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// =============================================

// REEMPLAZA ESTA URL CON LA DE TU SCRIPT DESPLEGADO
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw4VYdh-h4J-vXD7qVLlTOnic7WezgbkeHOHZtvxGJHb1AKgyiZF3uzHvOZgWbIg1pu/exec';


// =============================================
// FUNCIÓN GENERAL PARA ENVIAR DATOS
// =============================================


// Variable global para controlar estado de envío
let enProcesoDeEnvio = false;


// =============================================
// FUNCIÓN GENERAL PARA ENVIAR DATOS
// =============================================


async function enviarAGSheets(tipo, datos, btnId = null) {
  // Evitar envíos duplicados si ya hay uno en proceso
  if (enProcesoDeEnvio) {
      console.log('⏳ Envío en proceso, ignorando clic adicional...');
      return false;
  }

  const btn = btnId ? document.getElementById(btnId) : null;
  const btnTextoOriginal = btn ? btn.innerHTML : '';

  try {
    enProcesoDeEnvio = true;

    // Deshabilitar botón visualmente
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Enviando...';
    }

    // Compatibilidad: Reconstruir campo 'cuadrilla' si existen supervisor y obrero
    if (datos.supervisor && datos.obrero) {
        datos.cuadrilla = `${datos.supervisor} / ${datos.obrero}`;
    }

    // Agregar tipo a los datos
    datos.tipo = tipo;
    
    // Mostrar loading
    mostrarMensajeEstado('⏳ Enviando datos a Google Sheets...', 'info');
    
    // Enviar datos
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos)
    });
    
    // Mostrar mensaje de éxito
    mostrarMensajeEstado('✅ Datos guardados exitosamente en Google Sheets', 'success');
    
    // ÉXITO: Mantener botón deshabilitado y cambiar texto
    if (btn) {
        btn.innerHTML = '✅ Enviado';
        btn.classList.add('enviado'); // Agregar clase para estilo verde específico
        // No reactivamos 'enProcesoDeEnvio' aquí para prevenir reenvíos del mismo formulario
        // El usuario deberá recargar o limpiar (dependiendo del flujo) si quiere enviar otro
        enProcesoDeEnvio = false; 
        // IMPORTANTE: Aunque liberamos la bandera lógica, el botón sigue disabled
        // para que visualmente no le den clic de nuevo al mismo dato.
    } else {
        enProcesoDeEnvio = false;
    }
    
    return true;
  } catch (error) {
    console.error('Error al enviar a Google Sheets:', error);
    mostrarMensajeEstado('❌ Error al guardar. Intenta nuevamente.', 'error');
    
    // ERROR: Reactivar todo para permitir reintento
    enProcesoDeEnvio = false;
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = btnTextoOriginal;
        btn.classList.remove('enviado');
    }
    return false;
  }
}

// =============================================
// FUNCIONES ESPECÍFICAS PARA CADA FORMULARIO
// =============================================

// Función para Residencial
async function guardarResidencialEnSheets() {
  const form = document.getElementById('formResidencial');
  const formData = new FormData(form);
  
  const datos = {};
  formData.forEach((value, key) => {
    datos[key] = value;
  });
  
  // Asumiendo que el botón tiene este ID (verificar residencial.html si es necesario)
  return await enviarAGSheets('residencial', datos, 'btn-guardar-residencial');
}

// Función para Comercial
async function guardarComercialEnSheets() {
  const form = document.getElementById('formComercial');
  const formData = new FormData(form);
  
  const datos = {};
  formData.forEach((value, key) => {
    datos[key] = value;
  });
  
  return await enviarAGSheets('comercial', datos, 'btn-guardar-comercial');
}

// Función para Reconexión
async function guardarReconexionEnSheets() {
  const form = document.getElementById('inspeccionFormReconexion');
  const formData = new FormData(form);
  
  const datos = {};
  formData.forEach((value, key) => {
    datos[key] = value;
  });
  
  return await enviarAGSheets('reconexion', datos, 'btn-guardar-reconexion');
}

// =============================================
// FUNCIÓN PARA MOSTRAR MENSAJES DE ESTADO
// =============================================

function mostrarMensajeEstado(mensaje, tipo) {
  // Crear o actualizar el contenedor de mensajes
  let contenedorMensaje = document.getElementById('mensaje-estado');
  
  if (!contenedorMensaje) {
    contenedorMensaje = document.createElement('div');
    contenedorMensaje.id = 'mensaje-estado';
    contenedorMensaje.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(contenedorMensaje);
  }
  
  // Configurar según tipo
  const colores = {
    success: '#27ae60',
    error: '#e74c3c',
    info: '#3498db',
    warning: '#f39c12'
  };
  
  contenedorMensaje.style.backgroundColor = colores[tipo] || '#2c3e50';
  contenedorMensaje.textContent = mensaje;
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    contenedorMensaje.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      contenedorMensaje.remove();
    }, 300);
  }, 5000);
}

// =============================================
// AGREGAR ESTILOS PARA ANIMACIONES
// =============================================

function agregarEstilosAnimacion() {
  const estilos = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    .btn-guardar {
      background-color: #8e44ad;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-left: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-guardar:hover {
      background-color: #7d3c98;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .btn-guardar:disabled {
      background-color: #95a5a6; /* Gris para "Cargando..." */
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    /* Estilo específico para cuando ya se envió (aunque esté disabled) */
    .btn-guardar.enviado:disabled {
      background-color: #27ae60 !important; /* Verde éxito */
      opacity: 0.8; /* Leve transparencia para indicar inactivo pero visible */
    }
  `;
  
  const styleSheet = document.createElement("style");
  styleSheet.textContent = estilos;
  document.head.appendChild(styleSheet);
}

// Inicializar estilos al cargar
document.addEventListener('DOMContentLoaded', agregarEstilosAnimacion);
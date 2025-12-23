// =============================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// =============================================

// REEMPLAZA ESTA URL CON LA DE TU SCRIPT DESPLEGADO
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw4VYdh-h4J-vXD7qVLlTOnic7WezgbkeHOHZtvxGJHb1AKgyiZF3uzHvOZgWbIg1pu/exec';


// =============================================
// FUNCIÓN GENERAL PARA ENVIAR DATOS
// =============================================


async function enviarAGSheets(tipo, datos) {
  try {
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
    
    return true;
  } catch (error) {
    console.error('Error al enviar a Google Sheets:', error);
    mostrarMensajeEstado('❌ Error al guardar. Intenta nuevamente.', 'error');
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
  
  return await enviarAGSheets('residencial', datos);
}

// Función para Comercial
async function guardarComercialEnSheets() {
  const form = document.getElementById('formComercial');
  const formData = new FormData(form);
  
  const datos = {};
  formData.forEach((value, key) => {
    datos[key] = value;
  });
  
  return await enviarAGSheets('comercial', datos);
}

// Función para Reconexión
async function guardarReconexionEnSheets() {
  const form = document.getElementById('inspeccionFormReconexion');
  const formData = new FormData(form);
  
  const datos = {};
  formData.forEach((value, key) => {
    datos[key] = value;
  });
  
  return await enviarAGSheets('reconexion', datos);
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
      background-color: #95a5a6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `;
  
  const styleSheet = document.createElement("style");
  styleSheet.textContent = estilos;
  document.head.appendChild(styleSheet);
}

// Inicializar estilos al cargar
document.addEventListener('DOMContentLoaded', agregarEstilosAnimacion);
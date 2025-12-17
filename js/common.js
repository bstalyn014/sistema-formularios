// =============================================
// FUNCIONES DE UTILIDAD (COMPARTIDAS)
// =============================================

function obtenerDatosCuadrilla(formData) {
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

// Inicialización común
document.addEventListener('DOMContentLoaded', function() {
    inicializarBotonesCopiar();
});

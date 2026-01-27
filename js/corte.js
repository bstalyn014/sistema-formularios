document.addEventListener("DOMContentLoaded", function () {
  inicializarFormularioCorte();
  cargarPersonal("supervisor-corte", "obrero-corte");
  setupCuadrillaDisplay(
    "supervisor-corte",
    "obrero-corte",
    "corte-cuadrilla-display"
  );
  cargarItemsCobro("selected-item-cobro-corte");
  setupLlaveCorteLogica("#formulario-corte");
});

function inicializarFormularioCorte() {
  configurarListenersCondicionales("#formulario-corte", [
    {
      name: "cajetin",
      id: "cajetin-razon-corte",
      condition: (val) => val === "Mal estado",
    },
    {
      name: "perno",
      id: "perno-razon-corte",
      condition: (val) => val === "No se instala",
    },
  ]);
}

function configurarListenersCondicionales(contexto, configs) {
  configs.forEach((config) => {
    const radios = document.querySelectorAll(
      `${contexto} input[name="${config.name}"]`
    );
    radios.forEach((radio) => {
      radio.addEventListener("change", function () {
        const target = document.getElementById(config.id);
        if (target) {
          target.classList.toggle("active", config.condition(this.value));
        }
      });
    });
  });
}

function generarResumenCorte() {
  const form = document.getElementById("inspeccionForm");

  // Validación manual personalizada para saltar "tipo_llave" si está deshabilitado
  const tipoLlaveRadios = form.querySelectorAll('input[name="tipo_llave"]');
  let tipoLlaveRequerido = true;
  if (tipoLlaveRadios.length > 0 && tipoLlaveRadios[0].disabled) {
    tipoLlaveRequerido = false;
    // Quitar required temporalmente para validación
    tipoLlaveRadios.forEach((r) => (r.required = false));
  } else {
    tipoLlaveRadios.forEach((r) => (r.required = true));
  }

  if (!form.checkValidity()) {
    alert("Por favor, complete todos los campos requeridos");
    // Forzar mostrar validación HTML5
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const { supervisor, obrero } = obtenerDatosCuadrilla(formData);

  let resumen = `Contrato: ${formData.get(
    "contrato"
  )}, Supervisor: ${supervisor} y Obrero: ${obrero}, al momento de la inspección se procede a dejar el servicio de aapp habilitado. Se realiza el corte del servicio ${formData.get(
    "corte"
  )}. Se encontró medidor en ${formData.get("medidor")}`;

  resumen += `, lectura ${formData.get("lectura")} M3, litros ${formData.get(
    "litros"
  )}, Cajetin ${formData.get("cajetin")}`;
  if (formData.get("cajetin") === "Mal estado")
    resumen += ` (${formData.get("cajetin_tipo_dano")})`;

  // Lógica para Tipo de Llave y Llave de Corte
  const llaveCorteEstado = formData.get("llave_corte");
  if (llaveCorteEstado === "No tiene") {
    resumen += `, Llave de corte No tiene`;
  } else {
    resumen += `, Tipo de llave de corte ${formData.get(
      "tipo_llave"
    )}, Llave de corte ${llaveCorteEstado}`;
  }

  resumen += `, Llave de paso ${formData.get("llave_paso")}`;

  resumen += `, Predio ${formData.get("predio")}, Color ${formData.get(
    "color"
  )}, Perno ${formData.get("perno")}`;
  if (formData.get("perno") === "No se instala")
    resumen += ` (${formData.get("perno_razon")})`;

  if (formData.get("observacion"))
    resumen += `, Observación: ${formData.get("observacion")}`;

  const datosParaGuardar = {};
  formData.forEach((value, key) => (datosParaGuardar[key] = value));
  guardarCorteLocal(formData.get("contrato"), datosParaGuardar);

  mostrarResumen("corte", resumen);

  // Resetear visualmente la sección extra de reconexión
  const extraReconexion = document.getElementById("resumen-reconexion-extra");
  if (extraReconexion) extraReconexion.style.display = "none";
}

function generarResumenReconexionDesdeCorte() {
  // Obtener datos del formulario de CORTE existente
  const form = document.getElementById("inspeccionForm");
  const formData = new FormData(form);

  // Obtener item de cobro seleccionado en la SECCIÓN EXTRA
  const itemCobroInput = document.getElementById("selected-item-cobro-corte");
  const itemCobro = itemCobroInput ? itemCobroInput.value : "";

  // Validación Item de Cobro
  if (!itemCobro) {
    alert(
      "Por favor, seleccione un Ítem de Cobro para generar el resumen de reconexión."
    );
    if (itemCobroInput) itemCobroInput.focus();
    return;
  }

  // MAPPING DE LÓGICA (Corte -> Reconexión)
  const corteValor = formData.get("corte");
  let reconexionValor = "";

  if (corteValor === "Con ficha") {
    reconexionValor = "Se retira ficha";
  } else if (corteValor === "Con ficha y llave trabada") {
    reconexionValor = "Se retira ficha y se destraba llave";
  } else if (corteValor === "Solo llave trabada") {
    reconexionValor = "Se destraba llave";
  } else {
    reconexionValor = corteValor;
  }

  // Mapeo a gerundio para el resumen
  let accionTexto = reconexionValor;
  if (reconexionValor === "Se retira ficha") accionTexto = "retirando ficha";
  else if (reconexionValor === "Se retira ficha y se destraba llave")
    accionTexto = "retirando ficha y destrabando llave";
  else if (reconexionValor === "Se destraba llave")
    accionTexto = "destrabando llave";

  const { supervisor, obrero } = obtenerDatosCuadrilla(formData);

  // CONSTRUIR RESUMEN DE RECONEXIÓN
  let resumen = `Contrato: ${formData.get(
    "contrato"
  )}, Supervisor: ${supervisor} y Obrero: ${obrero}, al momento de la inspección se procede a dejar el servicio de aapp habilitado. Se realiza la reconexión del servicio ${accionTexto}. Se encontró el Medidor en ${formData.get(
    "medidor"
  )}`;

  resumen += `, Lectura ${formData.get("lectura")} M3, Litros ${formData.get(
    "litros"
  )}, Cajetin ${formData.get("cajetin")}`;
  if (formData.get("cajetin") === "Mal estado")
    resumen += ` (${formData.get("cajetin_tipo_dano")})`;

  // Lógica para Tipo de Llave y Llave de Corte
  const llaveCorteEstado = formData.get("llave_corte");
  if (llaveCorteEstado === "No tiene") {
    resumen += `, Llave de corte No tiene`;
  } else {
    resumen += `, Tipo de llave de corte ${formData.get(
      "tipo_llave"
    )}, Llave de corte ${llaveCorteEstado}`;
  }

  resumen += `, Llave de paso ${formData.get("llave_paso")}`;

  resumen += `, Predio ${formData.get("predio")}, Color ${formData.get(
    "color"
  )}, Perno ${formData.get("perno")}`;
  if (formData.get("perno") === "No se instala")
    resumen += ` (${formData.get("perno_razon")})`;

  const observacion = formData.get("observacion");
  if (observacion && observacion.trim() !== "")
    resumen += `, Observación: ${observacion}`;

  // Mostrar en el contenedor extra
  const contenidoElement = document.getElementById(
    "resumen-contenido-reconexion-extra"
  );
  const contenedorElement = document.getElementById("resumen-reconexion-extra");

  if (contenidoElement && contenedorElement) {
    contenidoElement.textContent = resumen;
    contenedorElement.style.display = "block";
    contenedorElement.classList.add("active");
    contenedorElement.scrollIntoView({ behavior: "smooth" });
  }
}

async function guardarReconexionDesdeCorte() {
  const form = document.getElementById("inspeccionForm");
  const formData = new FormData(form);

  // Obtener item de cobro
  const itemCobroInput = document.getElementById("selected-item-cobro-corte");
  const itemCobro = itemCobroInput ? itemCobroInput.value : "";

  // Mapeo inverso para guardar los datos correctos en el sheet
  const corteValor = formData.get("corte");
  let reconexionValor = "";
  if (corteValor === "Con ficha") reconexionValor = "Se retira ficha";
  else if (corteValor === "Con ficha y llave trabada")
    reconexionValor = "Se retira ficha y se destraba llave";
  else if (corteValor === "Solo llave trabada")
    reconexionValor = "Se destraba llave";
  else reconexionValor = corteValor;

  // Construir objeto de datos
  const datos = {};
  formData.forEach((value, key) => {
    // Excluir campos específicos de corte que no aplican o se transforman
    if (key !== "corte") {
      datos[key] = value;
    }
  });

  // Agregar campos transformados/nuevos
  datos["reconexion"] = reconexionValor;
  datos["item_cobro"] = itemCobro;

  await enviarAGSheets("reconexion", datos, "btn-guardar-reconexion-extra");
}

/**
ARCHIVO: js/ui.js
ROL: Utilidades de UI (validación, mostrar resultados, limpiar secciones, toast, copiar al portapapeles, colapsables).

TOC:
  1) validarCampos(campos)
  2) mostrarResultado(id, mensaje, isError=false)
  3) limpiarSeccion(seccion)
  4) mostrarToast(mensaje)
  5) copiarResultado(id)
  6) toggleCollapse(id)

Dependencias:
  - Usa IDs del DOM: resultadoElect, resultadoGas1, resultadoTiempo, toast, etc.
  - Sin dependencias externas.

Convenciones:
  - 'campos' es un array de objetos {id, nombre, min}.
  - No cambiar IDs de inputs sin actualizar este archivo.

*/
// Validar campos (min inclusive)
function validarCampos(campos) {
  for (const {id, nombre, min} of campos) {
    const valor = parseFloat(document.getElementById(id).value);
    if (isNaN(valor) || valor < min) {
      return `Por favor, ingresa un valor válido para "${nombre}".`;
    }
  }
  return null;
}

// Mostrar resultado, activar botones copiar y limpiar
function mostrarResultado(id, mensaje, isError = false) {
  const div = document.getElementById(id);
  const texto = div.querySelector('.result-text');
  const botones = div.querySelector('.button-group');

  texto.textContent = mensaje;
  div.style.display = "flex";
  if (isError) {
    div.classList.add("error");
    if (botones) botones.style.display = "none";
  } else {
    div.classList.remove("error");
    if (botones) botones.style.display = "flex";
  }
}

// Limpiar resultados y inputs de una sección
function limpiarSeccion(seccion) {
  let inputs;
  let resultadoDiv;
  switch(seccion) {
    case 'electricidad':
      inputs = ['potencia','tiempoUsoElect','frecuencia','precioKwh'];
      resultadoDiv = 'resultadoElect';
      break;
    case 'gas1':
      inputs = ['btuCilindro1','btuQuemador1','tiempoUsoGas1','precioCilindro1'];
      resultadoDiv = 'resultadoGas1';
      break;
    case 'tiempo':
      inputs = ['tiempoLoteMin','cantidadProductos','salarioHora'];
      resultadoDiv = 'resultadoTiempo';
      break;
    default:
      return;
  }
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if(el.tagName.toLowerCase() === 'select'){
      el.selectedIndex = 0;
    } else {
      el.value = '';
    }
  });
  const div = document.getElementById(resultadoDiv);
  if(div){
    div.style.display = 'none';
    const texto = div.querySelector('.result-text');
    if(texto) texto.textContent = '';
    const botones = div.querySelector('.button-group');
    if(botones) botones.style.display = 'none';
    div.classList.remove('error');
  }
}

// Mostrar notificación visual
function mostrarToast(mensaje) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// Copiar texto resultado al portapapeles (sin alert)
function copiarResultado(id) {
  const div = document.getElementById(id);
  const texto = div.querySelector('.result-text').textContent;
  if (!texto) {
    mostrarToast('No hay resultado para copiar.');
    return;
  }
  navigator.clipboard.writeText(texto).then(() => {
    mostrarToast('Resultado copiado al portapapeles.');
  }).catch(() => {
    mostrarToast('No se pudo copiar el texto.');
  });
}

// Collapse
function toggleCollapse(id) {
  const content = document.getElementById(id);
  const btn = document.querySelector(`[aria-controls="${id}"]`);
  if (content.classList.contains('show')) {
    content.classList.remove('show');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '► ' + btn.textContent.replace(/^▼ |^► /, '');
  } else {
    content.classList.add('show');
    btn.setAttribute('aria-expanded', 'true');
    btn.textContent = '▼ ' + btn.textContent.replace(/^▼ |^► /, '');
  }
}

/**
ARCHIVO: js/main.js
ROL: Orquestación del "Resumen de Subtotales".

TOC:
  1) actualizarResumen() → Lee resultados de secciones y compone el resumen.

Lee del DOM:
  - #resultadoElect .result-text, #resultadoGas1 .result-text, #resultadoTiempo .result-text
  - Tabla de materiales: toma cada '.costo' para listar costos unitarios

Escritura en DOM:
  - #listaMateriales, #subtotalElect, #subtotalGas, #subtotalTiempo, #totalFinal

Reglas de negocio:
  - El total final suma Electricidad + Gas + Mano de obra
  - Materiales se listan por costo unitario, no se suman al total

*/
function actualizarResumen() {
  // ===== Materiales: mostrar solo costo unitario línea por línea =====
  const filas = document.querySelectorAll("#tablaMateriales tbody tr");
  let listaHTML = '';
  filas.forEach(fila => {
    const producto = fila.cells[0].querySelector("input").value || "(sin nombre)";
    const costoText = fila.querySelector(".costo").textContent;
    if(costoText && costoText !== '-' && !costoText.includes('⚠')) {
      listaHTML += `<div>${producto}: ${costoText}</div>`;
    }
  });
  document.getElementById("listaMateriales").innerHTML = listaHTML || "Sin materiales calculados";

  // ===== Electricidad =====
  const electText = document.getElementById("resultadoElect").querySelector(".result-text").textContent;
  let subtotalElect = 0;
  if(electText && electText.includes('$')){
    subtotalElect = parseFloat(electText.replace(/[^0-9.-]+/g,""));
  }
  document.getElementById("subtotalElect").textContent = `$${subtotalElect.toFixed(2)}`;

  // ===== Gas =====
  const gasText = document.getElementById("resultadoGas1").querySelector(".result-text").textContent;
  let subtotalGas = 0;
  if(gasText && gasText.includes('$')){
    subtotalGas = parseFloat(gasText.replace(/[^0-9.-]+/g,""));
  }
  document.getElementById("subtotalGas").textContent = `$${subtotalGas.toFixed(2)}`;

  // ===== Mano de obra =====
  const tiempoText = document.getElementById("resultadoTiempo").querySelector(".result-text").textContent;
  let subtotalTiempo = 0;
  if(tiempoText && tiempoText.includes('$')){
    subtotalTiempo = parseFloat(tiempoText.replace(/[^0-9.-]+/g,""));
  }
  document.getElementById("subtotalTiempo").textContent = `$${subtotalTiempo.toFixed(2)}`;

  // ===== Total =====
  const total = subtotalElect + subtotalGas + subtotalTiempo; // Materiales no se suma al total
  document.getElementById("totalFinal").textContent = `$${total.toFixed(2)}`;
}

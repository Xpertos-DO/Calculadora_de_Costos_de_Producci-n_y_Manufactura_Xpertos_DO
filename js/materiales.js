/**
ARCHIVO: js/materiales.js
ROL: Gestión de materiales (agregar/eliminar filas) y cálculo de equivalencias/costos por unidad.

TOC:
  1) agregarMaterial()     → Inserta fila editable y engancha eventos
  2) eliminarFila(btn)     → Borra fila y refresca totales
  3) calcularMateriales()  → Convierte unidades y calcula costo por unidad

Dependencias:
  - Requiere 'categoriaDeUnidad' y 'factores' definidos en calculos.js
  - Requiere 'actualizarResumen' definido en main.js
  - IDs/estructura del DOM: #tablaMateriales, #resultadoMateriales

Notas:
  - No mezclar categorías (masa/volumen/longitud/área/unidad). Si se mezclan, marca '⚠ Incompatible'.
  - Mantener precisión de toFixed(4) para costos unitarios.

*/
// === Helpers de UI de unidades (agrupadas por magnitud) ===
const _etiquetasMagnitud = {
  masa: "Masa (peso)",
  volumen: "Volumen",
  longitud: "Longitud",
  area: "Área",
  unidad: "Unidades (conteo)",
};
const _ordenCategorias = ["masa", "volumen", "longitud", "area", "unidad"];
const _ordenUnidades = {
  masa: ["kg", "g", "lb", "oz"],
  volumen: ["L", "ml", "gal", "floz"],
  longitud: ["m", "cm", "mm", "in", "ft"],
  area: ["m2", "cm2", "in2", "ft2"],
  unidad: ["u"],
};
const _labelUnidad = {
  kg: "kg", g: "g", lb: "lb", oz: "oz",
  L: "L", ml: "ml", gal: "gal (US)", floz: "fl oz (US)",
  m: "m", cm: "cm", mm: "mm", in: "in", ft: "ft",
  m2: "m²", cm2: "cm²", in2: "in²", ft2: "ft²",
  u: "unidad"
};

// Construye las <option> de un <select>, con soporte para <optgroup> por magnitud
function _poblarSelectUnidades(select, categorias, usarGrupos = true) {
  select.innerHTML = ""; // limpia
  // Placeholder
  const ph = document.createElement("option");
  ph.value = ""; ph.textContent = "--";
  select.appendChild(ph);

  if (usarGrupos && categorias.length > 1) {
    _ordenCategorias.forEach(cat => {
      if (!categorias.includes(cat)) return;
      const og = document.createElement("optgroup");
      og.label = _etiquetasMagnitud[cat];
      _ordenUnidades[cat].forEach(u => {
        const opt = document.createElement("option");
        opt.value = u; opt.textContent = _labelUnidad[u] || u;
        og.appendChild(opt);
      });
      select.appendChild(og);
    });
  } else {
    const cat = categorias[0];
    _ordenUnidades[cat].forEach(u => {
      const opt = document.createElement("option");
      opt.value = u; opt.textContent = _labelUnidad[u] || u;
      select.appendChild(opt);
    });
  }
}

// Inicializa los dos selects de una fila recién creada
function _initSelectsFila(fila) {
  const selCompra = fila.querySelector("select.unidad-compra");
  const selTransf = fila.querySelector("select.unidad-transf");
  const chipMagnitudCompra = fila.querySelector(".magnitud-compra");
  const chipMagnitudTransf = fila.querySelector(".magnitud-transf");

  // Compra: todas las categorías, agrupadas
  _poblarSelectUnidades(selCompra, _ordenCategorias, true);

  // Transformación: deshabilitado hasta que elijan compra
  selTransf.disabled = true;
  _poblarSelectUnidades(selTransf, ["masa"], false); // relleno neutro

  // Mostrar/actualizar chip de magnitud
  const _setChip = (el, cat) => {
    el.textContent = cat ? `Magnitud: ${_etiquetasMagnitud[cat]}` : "";
  };

  selCompra.addEventListener("change", () => {
    const u = selCompra.value;
    const cat = u ? categoriaDeUnidad(u) : null;
    _setChip(chipMagnitudCompra, cat);

    // Re-armar transformación con la misma magnitud
    if (cat) {
      _poblarSelectUnidades(selTransf, [cat], false);
      selTransf.disabled = false;

      // Opcional: preseleccionar la MISMA unidad como destino
      const same = [...selTransf.options].find(o => o.value === u);
      selTransf.value = same ? u : "";
      _setChip(chipMagnitudTransf, cat);

      // Aviso amable
      try { mostrarToast(`Transformación limitada a ${_etiquetasMagnitud[cat]}.`); } catch(e){}
    } else {
      selTransf.disabled = true;
      selTransf.value = "";
      _setChip(chipMagnitudTransf, null);
    }

    // Recalcular cuando cambia
    calcularMateriales();
  });
  selTransf.addEventListener("change", calcularMateriales);
}

// === Reemplazo: agregarMaterial con selects “inteligentes” y chips de magnitud ===
function agregarMaterial() {
  const tbody = document.querySelector("#tablaMateriales tbody");

  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td data-label="Producto">
      <input type="text" placeholder="Ej: Harina">
    </td>

    <td data-label="Cantidad compra">
      <input type="number" min="0" step="0.01" placeholder="Ej: 100">
    </td>

    <td data-label="Unidad compra">
      <select class="unidad-compra"></select>
      <div class="help magnitud-compra"></div>
    </td>

    <td data-label="Precio total">
      <input type="number" min="0" step="0.01" placeholder="Ej: 10.00">
    </td>

    <td data-label="Unidad transformación">
      <select class="unidad-transf" disabled></select>
      <div class="help magnitud-transf"></div>
    </td>

    <td data-label="Cantidad equivalente" class="equivalente">-</td>
    <td data-label="Costo por unidad" class="costo">-</td>
    <td data-label="">
      <button class="clear" onclick="eliminarFila(this)">X</button>
    </td>
  `;
  tbody.appendChild(fila);

  // Inicializa selects y chips de magnitud
  _initSelectsFila(fila);

  // Escuchar cambios de inputs para recalcular
  fila.querySelectorAll("input,select").forEach(el => {
    el.addEventListener("input", calcularMateriales);
  });

  actualizarResumen();
}

function eliminarFila(btn) {
  btn.closest("tr").remove();
  calcularMateriales();
  actualizarResumen(); // Actualiza resumen al eliminar fila
}

function calcularMateriales() {
  const filas = document.querySelectorAll("#tablaMateriales tbody tr");
  let resultados = [];

  filas.forEach(fila => {
    const producto = fila.cells[0].querySelector("input").value || "(sin nombre)";
    const cantidad = parseFloat(fila.cells[1].querySelector("input").value) || 0;
    const unidadCompra = fila.cells[2].querySelector("select").value;
    const precioTotal = parseFloat(fila.cells[3].querySelector("input").value) || 0;
    const unidadTransf = fila.cells[4].querySelector("select").value;

    if (cantidad > 0 && precioTotal > 0 && unidadCompra && unidadTransf) {
      const catCompra = categoriaDeUnidad(unidadCompra);
      const catTransf = categoriaDeUnidad(unidadTransf);

      if (catCompra && catCompra === catTransf) {
        // convertir a unidad base
        const baseCompra = cantidad * factores[catCompra].unidades[unidadCompra];
        // convertir a unidad destino
        const cantidadTransformada = baseCompra / factores[catTransf].unidades[unidadTransf];

        const costoPorUnidad = precioTotal / cantidadTransformada;

        fila.querySelector(".equivalente").textContent = `${cantidadTransformada.toFixed(2)} ${unidadTransf}`;
        fila.querySelector(".costo").textContent = `$${costoPorUnidad.toFixed(4)} / ${unidadTransf}`;

        resultados.push(`${producto}: $${costoPorUnidad.toFixed(4)} / ${unidadTransf}`);
      } else {
        fila.querySelector(".equivalente").textContent = "⚠ Incompatible";
        fila.querySelector(".costo").textContent = "-";
      }
    } else {
      fila.querySelector(".equivalente").textContent = "-";
      fila.querySelector(".costo").textContent = "-";
    }
  });

  // Mostrar en el subtotal listado de costos unitarios
  if (resultados.length > 0) {
    document.querySelector("#resultadoMateriales .result-text").innerHTML =
      resultados.join("<br>");
  } else {
    document.querySelector("#resultadoMateriales .result-text").textContent =
      "Sin materiales calculados";
  }
   actualizarResumen();
}

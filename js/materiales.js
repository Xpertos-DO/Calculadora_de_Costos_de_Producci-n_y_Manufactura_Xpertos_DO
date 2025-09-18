function agregarMaterial() {
  const tbody = document.querySelector("#tablaMateriales tbody");

  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td data-label="Producto"><input type="text" placeholder="Ej: Harina"></td>
    <td data-label="Cantidad compra"><input type="number" min="0" step="0.01" placeholder="Ej: 100"></td>
    <td data-label="Unidad compra">
      <select>
        <option value="">--</option>
        <!-- MASA -->
        <option value="kg">kg</option>
        <option value="g">g</option>
        <option value="lb">lb</option>
        <option value="oz">oz</option>
        <!-- VOLUMEN -->
        <option value="L">L</option>
        <option value="ml">ml</option>
        <option value="gal">gal (US)</option>
        <option value="floz">oz líquida (US)</option>
        <!-- LONGITUD -->
        <option value="m">m</option>
        <option value="cm">cm</option>
        <option value="mm">mm</option>
        <option value="in">pulgada</option>
        <option value="ft">pie</option>
        <!-- AREA -->
        <option value="m2">m²</option>
        <option value="cm2">cm²</option>
        <option value="in2">in²</option>
        <option value="ft2">ft²</option>
        <!-- UNIDAD -->
        <option value="u">unidad</option>
      </select>
    </td>
    <td data-label="Precio total"><input type="number" min="0" step="0.01" placeholder="Ej: 10.00"></td>
    <td data-label="Unidad transformación">
      <select>
        <option value="">--</option>
        <!-- MASA -->
        <option value="kg">kg</option>
        <option value="g">g</option>
        <option value="lb">lb</option>
        <option value="oz">oz</option>
        <!-- VOLUMEN -->
        <option value="L">L</option>
        <option value="ml">ml</option>
        <option value="gal">gal (US)</option>
        <option value="floz">oz líquida (US)</option>
        <!-- LONGITUD -->
        <option value="m">m</option>
        <option value="cm">cm</option>
        <option value="mm">mm</option>
        <option value="in">pulgada</option>
        <option value="ft">pie</option>
        <!-- AREA -->
        <option value="m2">m²</option>
        <option value="cm2">cm²</option>
        <option value="in2">in²</option>
        <option value="ft2">ft²</option>
        <!-- UNIDAD -->
        <option value="u">unidad</option>
      </select>
    </td>
    <td data-label="Cantidad equivalente" class="equivalente">-</td>
    <td data-label="Costo por unidad" class="costo">-</td>
    <td data-label=""><button class="clear" onclick="eliminarFila(this)">X</button></td>
  `;
  tbody.appendChild(fila);

  fila.querySelectorAll("input,select").forEach(el => {
    el.addEventListener("input", calcularMateriales);
  });
  actualizarResumen(); // Actualiza resumen al agregar fila
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
    
    const unidadTransformacion = fila.cells[4].querySelector("select").value;


    if (cantidad > 0 && precioTotal > 0 && unidadCompra && unidadTransformacion) {
      const catTransf = categoriaDeUnidad(unidadTransformacion);
      const cantidadTransformada = baseCompra / factores[catTransf].unidades[unidadTransformacion];

      if (catCompra && catCompra === catTransf) {
        // convertir a unidad base
        const baseCompra = cantidad * factores[catCompra].unidades[unidadCompra];
        // convertir a unidad destino
        const cantidadTransformada = baseCompra / factores[catTransf].unidades[unidadTransf];

        const costoPorUnidad = precioTotal / cantidadTransformada;

        fila.querySelector(".equivalente").textContent = `${cantidadTransformada.toFixed(2)} ${unidadTransformacion}`;
        fila.querySelector(".costo").textContent = `$${costoPorUnidad.toFixed(4)} / ${unidadTransformacion}`;

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

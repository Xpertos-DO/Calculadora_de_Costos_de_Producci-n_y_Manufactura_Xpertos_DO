// ==== FACTORES DE CONVERSIÓN ====
// Todas convertidas a una "unidad base" de su categoría
const factores = {
  masa: { base: "g", unidades: { g:1, kg:1000, lb:453.592, oz:28.3495 } },
  volumen: { base: "ml", unidades: { ml:1, L:1000, gal:3785.41, floz:29.5735 } },
  longitud: { base: "m", unidades: { m:1, cm:0.01, mm:0.001, in:0.0254, ft:0.3048 } },
  area: { base: "m2", unidades: { m2:1, cm2:0.0001, in2:0.00064516, ft2:0.092903 } },
  unidad: { base: "u", unidades: { u:1 } }
};

// Buscar categoría de una unidad
function categoriaDeUnidad(u) {
  for (const cat in factores) {
    if (u in factores[cat].unidades) return cat;
  }
  return null;
}

// ==== Cálculo Electricidad ====
function calcularElectricidad() {
  const campos = [
    {id: "potencia", nombre: "Consumo del equipo (W)", min: 0.1},
    {id: "tiempoUsoElect", nombre: "Duración de un lote (h)", min: 0.01},
    {id: "frecuencia", nombre: "Lotes al mes", min: 1},
    {id: "precioKwh", nombre: "Costo por kWh de electricidad", min: 0.001},
  ];
  const error = validarCampos(campos);
  if (error) {
    mostrarResultado("resultadoElect", error, true);
    return;
  }
  const W = parseFloat(document.getElementById("potencia").value);
  const horas = parseFloat(document.getElementById("tiempoUsoElect").value);
  const lotes = parseFloat(document.getElementById("frecuencia").value);
  const precio = parseFloat(document.getElementById("precioKwh").value);
  const total = (W * horas * lotes / 1000) * precio;
  mostrarResultado("resultadoElect", `Costo mensual: $${total.toFixed(2)}`);
}

// ==== Cálculo Gas ====
function calcularGas(num) {
  const campos = [
    {id: `btuCilindro${num}`, nombre: "Capacidad total de gas del cilindro (BTU)", min: 1},
    {id: `btuQuemador${num}`, nombre: "Potencia del quemador (BTU/h)", min: 1},
    {id: `tiempoUsoGas${num}`, nombre: "Duración de uso del quemador por lote (h)", min: 0.01},
    {id: `precioCilindro${num}`, nombre: "Costo de llenado del cilindro", min: 0.01},
  ];
  const error = validarCampos(campos);
  if (error) {
    mostrarResultado(`resultadoGas${num}`, error, true);
    return;
  }
  const btuCil = parseFloat(document.getElementById(`btuCilindro${num}`).value);
  const btuQuem = parseFloat(document.getElementById(`btuQuemador${num}`).value);
  const horas = parseFloat(document.getElementById(`tiempoUsoGas${num}`).value);
  const precioCil = parseFloat(document.getElementById(`precioCilindro${num}`).value);
  const total = ((btuQuem * horas) / btuCil) * precioCil;
  mostrarResultado(`resultadoGas${num}`, `Costo por lote: $${total.toFixed(2)}`);
}

// ==== Cálculo Tiempo (Mano de obra) ====
function calcularTiempo() {
  const campos = [
    {id: "tiempoLoteMin", nombre: "Duración total de producción por lote (min)", min: 0.1},
    {id: "cantidadProductos", nombre: "Unidades producidas por lote", min: 1},
    {id: "salarioHora", nombre: "Costo por hora de mano de obra", min: 0.01},
  ];
  const error = validarCampos(campos);
  if (error) {
    mostrarResultado("resultadoTiempo", error, true);
    return;
  }
  const min = parseFloat(document.getElementById("tiempoLoteMin").value);
  const unidades = parseFloat(document.getElementById("cantidadProductos").value);
  const salario = parseFloat(document.getElementById("salarioHora").value);
  const total = (min / 60 / unidades) * salario;
  mostrarResultado("resultadoTiempo", `Costo por unidad: $${total.toFixed(2)}`);
}

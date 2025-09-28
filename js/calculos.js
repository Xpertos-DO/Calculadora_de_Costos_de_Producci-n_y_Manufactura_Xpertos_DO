/**
ARCHIVO: js/calculos.js
ROL: Cálculos de negocio y factores de conversión.

TOC:
  A) FACTORES DE CONVERSIÓN
     - objeto 'factores' por categoría (masa, volumen, longitud, área, unidad)
     - categoriaDeUnidad(u)
  B) CÁLCULOS
     - calcularElectricidad()
     - calcularGas(num)
     - calcularTiempo()

Dependencias:
  - ui.js: validarCampos(...) y mostrarResultado(...)
  - DOM: lee inputs por ID (potencia, tiempoUsoElect, etc.)

Fórmulas:
  - Electricidad: (W × horas × lotes ÷ 1000) × costoKwh
  - Gas: (BTU/h × horas ÷ BTU cilindro) × costo cilindro
  - Tiempo: (min ÷ 60 ÷ unidades) × costoHora

Precauciones:
  - Validar mínimos (>0) antes de calcular.
  - Mantener las IDs del HTML.

*/
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
    {id: "unidadesPorLoteElect", nombre: "Unidades por lote", min: 1},
    {id: "precioKwh", nombre: "Costo por kWh de electricidad", min: 0.001},
  ];
  const error = validarCampos(campos);
  if (error) {
    mostrarResultado("resultadoElect", error, true);
    return;
  }
  const W = parseFloat(document.getElementById("potencia").value);
  const horas = parseFloat(document.getElementById("tiempoUsoElect").value);
  const unidades = parseFloat(document.getElementById("unidadesPorLoteElect").value);
  const precio = parseFloat(document.getElementById("precioKwh").value);
  const costoLoteElect = (W * horas / 1000) * precio;
  const costoUnidadElect = costoLoteElect / unidades;
  mostrarResultado("resultadoElect", `Costo por unidad: $${costoUnidadElect.toFixed(2)} | Costo por lote: $${costoLoteElect.toFixed(2)}`);
}

// ==== Cálculo Gas ====
function calcularGas(num) {
  const campos = [
    {id: `btuPorGalon${num}`, nombre: "BTU por galón de GLP", min: 1},
    {id: `btuQuemador${num}`, nombre: "Potencia del quemador (BTU/h)", min: 1},
    {id: `tiempoUsoGas${num}`, nombre: "Duración de uso del quemador por lote (h)", min: 0.01},
    {id: `precioGalon${num}`, nombre: "Costo por galón de GLP", min: 0.01},
    {id: `unidadesPorLoteGas${num}`, nombre: "Unidades por lote", min: 1},
  ];
  const error = validarCampos(campos);
  if (error) {
    mostrarResultado(`resultadoGas${num}`, error, true);
    return;
  }
  const btuPorGal = parseFloat(document.getElementById(`btuPorGalon${num}`).value);
  const btuQuem = parseFloat(document.getElementById(`btuQuemador${num}`).value);
  const horas = parseFloat(document.getElementById(`tiempoUsoGas${num}`).value);
  const precioGal = parseFloat(document.getElementById(`precioGalon${num}`).value);
  const unidadesLote = parseFloat(document.getElementById(`unidadesPorLoteGas${num}`).value);

  const galonesConsumidos = (btuQuem * horas) / btuPorGal;
  const costoLoteGas = galonesConsumidos * precioGal;
  const costoUnidadGas = costoLoteGas / unidadesLote;

  mostrarResultado(`resultadoGas${num}`, `Costo por unidad: $${costoUnidadGas.toFixed(2)} | Costo por lote: $${costoLoteGas.toFixed(2)} `);
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

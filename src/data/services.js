// unit describes what `qty` counts and how each option's price is applied:
//  'servicio' — flat price per item (qty = number of items)
//  'm2'       — price per m² (qty = m²)
//  'plaza'    — price per plaza/seat (qty = number of plazas)
export const SERVICES = [
  {
    id: 'colchones',
    name: 'Colchones',
    letter: 'C',
    short: 'Elimina ácaros, manchas y malos olores.',
    unit: 'servicio',
    qtyLabel: 'Cantidad',
    sizes: [
      { id: 'individual', label: 'Individual', desc: '1 plaza', price: 900 },
      { id: 'matrimonial', label: 'Matrimonial', desc: '2 plazas', price: 1100 },
      { id: 'queen', label: 'Queen', desc: 'extra grande', price: 1300 },
      { id: 'king', label: 'King', desc: 'extra grande', price: 1500 },
    ],
  },
  {
    id: 'tapetes',
    name: 'Tapetes y alfombras',
    letter: 'T',
    short: 'Lavado profundo que renueva fibras y color.',
    unit: 'm2',
    qtyLabel: 'Metros cuadrados (m²)',
    // Counter-intuitive on purpose: SMALL rugs are the ones that go to the
    // workshop (easy to transport); once a rug is big enough it's cheaper
    // and more practical to clean it on-site at the customer's home.
    workshopThreshold: 5,
    workshopNote: 'Los tapetes de menos de 5 m² se recogen a domicilio, se lavan en nuestro centro de trabajo y se entregan de vuelta.',
    sizes: [
      { id: 'sintetico', label: 'Sintético', desc: 'por m²', price: 300 },
      { id: 'mixto', label: 'Mixto', desc: 'por m²', price: 450 },
      { id: 'natural', label: 'Natural', desc: 'por m²', price: 400 },
      { id: 'oriental', label: 'Oriental', desc: 'por m²', price: 600 },
    ],
  },
  {
    id: 'salas',
    name: 'Salas y sillones',
    letter: 'S',
    short: 'Tapicería como nueva, sin desmontar nada.',
    unit: 'plaza',
    qtyLabel: 'Número de plazas',
    sizes: [
      { id: 'sintetico', label: 'Sintético', desc: 'por plaza', price: 300 },
      { id: 'mixto', label: 'Mixto', desc: 'por plaza', price: 450 },
      { id: 'natural', label: 'Natural', desc: 'por plaza', price: 400 },
      { id: 'gamuza', label: 'Gamuza', desc: 'por plaza', price: 600 },
    ],
  },
];

// Optional add-on treatments. Priced per "application", each covering ~3
// m²/plazas of the main service — so a bigger job automatically needs (and
// is charged for) more applications if the customer opts in.
export const EXTRA_APPLICATION_UNITS = 3;

export const EXTRAS = [
  { id: 'enzimatico', label: 'Lavado enzimático', price: 200 },
  { id: 'antiacaros', label: 'Antiácaros extra', price: 150 },
  { id: 'repelente', label: 'Repelente', price: 250 },
  { id: 'sanitizador', label: 'Sanitizador extra', price: 200 },
  { id: 'moho', label: 'Eliminación de moho', price: 450 },
];

export function findService(id) {
  return SERVICES.find((s) => s.id === id) || null;
}

export function findExtra(id) {
  return EXTRAS.find((e) => e.id === id) || null;
}

export function fromPriceLabel(svc) {
  return Math.min(...svc.sizes.map((z) => z.price));
}

export function applicationsFor(qty) {
  return Math.max(1, Math.ceil(qty / EXTRA_APPLICATION_UNITS));
}

// extraIds -> priced breakdown, scaled by how many "applications" the
// current qty needs. Shared by the wizard UI and the server so the price
// the customer sees always matches what gets charged.
export function computeExtrasBreakdown(extraIds, qty) {
  const applications = applicationsFor(qty);
  return (extraIds || [])
    .map((id) => findExtra(id))
    .filter(Boolean)
    .map((extra) => ({
      id: extra.id,
      label: extra.label,
      unitPrice: extra.price,
      applications,
      amount: extra.price * applications,
    }));
}

export function sumExtras(breakdown) {
  return breakdown.reduce((sum, e) => sum + e.amount, 0);
}

export function unitSuffix(unit) {
  if (unit === 'm2') return '/m²';
  if (unit === 'plaza') return '/plaza';
  return '';
}

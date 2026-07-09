export const SERVICES = [
  {
    id: 'tapetes',
    name: 'Tapetes y alfombras',
    letter: 'T',
    short: 'Lavado profundo que renueva fibras y color.',
    sizes: [
      { id: 'chico', label: 'Chico', desc: 'hasta 1.5 m²', price: 250 },
      { id: 'mediano', label: 'Mediano', desc: '1.5 a 4 m²', price: 400 },
      { id: 'grande', label: 'Grande', desc: 'más de 4 m²', price: 650, workshop: true },
    ],
    workshopNote: 'Los tapetes grandes se recogen y lavan en nuestro centro de trabajo.',
  },
  {
    id: 'colchones',
    name: 'Colchones',
    letter: 'C',
    short: 'Elimina ácaros, manchas y malos olores.',
    sizes: [
      { id: 'individual', label: 'Individual', desc: '1 plaza', price: 350 },
      { id: 'matrimonial', label: 'Matrimonial', desc: '2 plazas', price: 450 },
      { id: 'king', label: 'King / Queen', desc: 'extra grande', price: 550 },
    ],
  },
  {
    id: 'salas',
    name: 'Salas y sillones',
    letter: 'S',
    short: 'Tapicería como nueva, sin desmontar nada.',
    sizes: [
      { id: '2plazas', label: '2 plazas', desc: 'sofá pequeño', price: 500 },
      { id: '3plazas', label: '3 plazas', desc: 'sofá grande', price: 650 },
      { id: 'seccional', label: 'Seccional', desc: 'sala completa', price: 900 },
    ],
  },
];

export function findService(id) {
  return SERVICES.find((s) => s.id === id) || null;
}

export function fromPriceLabel(svc) {
  return Math.min(...svc.sizes.map((z) => z.price));
}

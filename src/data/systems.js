// OBD code groups shown on code pages and the code index.
export const SYSTEM_LABELS = {
  catalizador: 'Catalizador y sondas',
  mezcla: 'Mezcla aire-combustible',
  encendido: 'Encendido y fallas de cilindro',
  evap: 'Sistema EVAP (vapores de gasolina)',
  sensores: 'Sensores del motor',
  distribucion: 'Distribución y árbol de levas',
  enfriamiento: 'Enfriamiento',
  transmision: 'Transmisión',
  red: 'Red de comunicación (CAN)',
};

export const SEVERITY = {
  low: { label: 'Gravedad baja', short: 'Baja' },
  medium: { label: 'Gravedad media', short: 'Media' },
  high: { label: 'Gravedad alta', short: 'Alta' },
};

export const COST = {
  bajo: { mark: '$', label: 'Costo bajo' },
  medio: { mark: '$$', label: 'Costo medio' },
  alto: { mark: '$$$', label: 'Costo alto' },
};

// Letter prefix of an OBD-II code (SAE J2012).
export const PREFIX = { P: 'motor y transmisión (powertrain)', B: 'carrocería (body)', C: 'chasis', U: 'red de comunicación' };

export const codePath = (code) => `/codigos-obd/${code.toLowerCase()}/`;

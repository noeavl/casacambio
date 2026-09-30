/**
 * Catálogo curado de divisas para elegir al dar de alta un tipo de cambio,
 * en vez de capturar código y nombre a mano. Cubre las monedas más
 * comunes en una casa de cambio en México (dólar, euro y las principales
 * de Centro y Sudamérica), no el catálogo ISO 4217 completo.
 */
export interface CurrencyCatalogEntry {
  code: string;
  nameEs: string;
  nameEn: string;
}

export const CURRENCY_CATALOG: CurrencyCatalogEntry[] = [
  { code: 'USD', nameEs: 'Dólar estadounidense', nameEn: 'US Dollar' },
  { code: 'EUR', nameEs: 'Euro', nameEn: 'Euro' },
  { code: 'CAD', nameEs: 'Dólar canadiense', nameEn: 'Canadian Dollar' },
  { code: 'GBP', nameEs: 'Libra esterlina', nameEn: 'British Pound' },
  { code: 'CHF', nameEs: 'Franco suizo', nameEn: 'Swiss Franc' },
  { code: 'JPY', nameEs: 'Yen japonés', nameEn: 'Japanese Yen' },
  { code: 'CNY', nameEs: 'Yuan chino', nameEn: 'Chinese Yuan' },
  { code: 'KRW', nameEs: 'Won surcoreano', nameEn: 'South Korean Won' },
  { code: 'AUD', nameEs: 'Dólar australiano', nameEn: 'Australian Dollar' },
  { code: 'NZD', nameEs: 'Dólar neozelandés', nameEn: 'New Zealand Dollar' },
  { code: 'BRL', nameEs: 'Real brasileño', nameEn: 'Brazilian Real' },
  { code: 'ARS', nameEs: 'Peso argentino', nameEn: 'Argentine Peso' },
  { code: 'COP', nameEs: 'Peso colombiano', nameEn: 'Colombian Peso' },
  { code: 'CLP', nameEs: 'Peso chileno', nameEn: 'Chilean Peso' },
  { code: 'PEN', nameEs: 'Sol peruano', nameEn: 'Peruvian Sol' },
  { code: 'UYU', nameEs: 'Peso uruguayo', nameEn: 'Uruguayan Peso' },
  { code: 'BOB', nameEs: 'Boliviano', nameEn: 'Bolivian Boliviano' },
  { code: 'GTQ', nameEs: 'Quetzal guatemalteco', nameEn: 'Guatemalan Quetzal' },
  { code: 'HNL', nameEs: 'Lempira hondureño', nameEn: 'Honduran Lempira' },
  { code: 'CRC', nameEs: 'Colón costarricense', nameEn: 'Costa Rican Colón' },
  { code: 'BZD', nameEs: 'Dólar beliceño', nameEn: 'Belize Dollar' },
  { code: 'PAB', nameEs: 'Balboa panameño', nameEn: 'Panamanian Balboa' },
  { code: 'DOP', nameEs: 'Peso dominicano', nameEn: 'Dominican Peso' },
  { code: 'CUP', nameEs: 'Peso cubano', nameEn: 'Cuban Peso' },
  { code: 'INR', nameEs: 'Rupia india', nameEn: 'Indian Rupee' },
];

/** Nombre de una divisa del catálogo, según el idioma activo de la app. */
export function currencyDisplayName(entry: CurrencyCatalogEntry, language: 'es' | 'en'): string {
  return language === 'en' ? entry.nameEn : entry.nameEs;
}

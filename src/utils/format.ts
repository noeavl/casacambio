/** Formatea un número con separador de miles y decimales fijos. */
export function formatNumber(value: number, decimals = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  const fixed = Math.abs(safe).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = safe < 0 ? '-' : '';
  return dec ? `${sign}${grouped}.${dec}` : `${sign}${grouped}`;
}

/** Formatea un importe con su código de moneda, ej. "1,250.00 MXN". */
export function formatMoney(value: number, currency: string, decimals = 2): string {
  return `${formatNumber(value, decimals)} ${currency}`.trim();
}

/** Convierte texto capturado por el usuario a número (acepta coma o punto). */
export function parseAmount(input: string): number {
  if (!input) return 0;
  const normalized = input.replace(/\s/g, '').replace(/,/g, '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

/** Deja en el texto solo dígitos y un separador decimal. */
export function sanitizeAmountInput(input: string): string {
  const cleaned = input.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/** Identificador local simple, suficiente para registros en el dispositivo. */
export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildFolio(prefix: string, sequence: number): string {
  const clean = prefix.trim() || 'REC';
  return `${clean}-${String(sequence).padStart(5, '0')}`;
}

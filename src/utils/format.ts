/**
 * Formatting Utilities — Currency (GHS), dates, and numbers.
 */

/**
 * Format a number as Ghanaian Cedis (GH₵).
 * e.g. formatCurrency(1299.5) → "GH₵ 1,299.50"
 */
export function formatCurrency(amount: number, currency = 'GHS'): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format an ISO date string to a readable date.
 * e.g. formatDate("2026-05-01T12:00:00Z") → "May 1, 2026"
 */
export function formatDate(isoString: string, format: 'short' | 'long' | 'time' | 'relative' = 'short'): string {
  const date = new Date(isoString);

  if (format === 'time') {
    return date.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' });
  }

  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
  }

  return date.toLocaleDateString('en-GH', {
    year: format === 'long' ? 'numeric' : undefined,
    month: format === 'long' ? 'long' : 'short',
    day: 'numeric',
  });
}

/**
 * Format a phone number for display.
 * e.g. formatPhone("233555123456") → "+233 55 512 3456"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('233')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

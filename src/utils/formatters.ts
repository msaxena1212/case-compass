/**
 * Global formatting utilities for LegalDesk
 */

/**
 * Formats a date string or Date object into a localized string.
 * Default: DD MMM YYYY (e.g., 18 Mar 2026)
 */
export const formatDate = (date: string | Date | undefined | null, options: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
}) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-IN', options);
};

/**
 * Formats a date string or Date object into a localized time string.
 * Default: HH:MM AM/PM
 */
export const formatTime = (date: string | Date | undefined | null) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Time';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a number as currency (INR).
 */
export const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculates the relative time from now (e.g., "2 days ago", "In 3 hours")
 */
export const formatRelativeTime = (date: string | Date | undefined | null) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
  
  if (Math.abs(diffInDays) > 30) return formatDate(d);
  
  const rtf = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });
  
  if (Math.abs(diffInDays) >= 1) {
    return rtf.format(diffInDays, 'day');
  }
  
  const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
  if (Math.abs(diffInHours) >= 1) {
    return rtf.format(diffInHours, 'hour');
  }
  
  const diffInMinutes = Math.round(diffInMs / (1000 * 60));
  return rtf.format(diffInMinutes, 'minute');
};

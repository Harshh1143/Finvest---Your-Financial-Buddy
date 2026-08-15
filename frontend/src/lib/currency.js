export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹'
};

export function getCurrencySymbol(user) {
  const code = user?.settings?.currency || 'USD';
  return CURRENCY_SYMBOLS[code] || '$';
}

export function formatCurrency(amount, user) {
  const symbol = getCurrencySymbol(user);
  const formatted = Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol}${formatted}`;
}

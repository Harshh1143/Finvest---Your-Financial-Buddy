export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'Fr.',
  CNY: '¥'
};

// Default fallback exchange rates relative to 1 USD
export let exchangeRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  JPY: 155.0,
  CAD: 1.36,
  AUD: 1.51,
  CHF: 0.90,
  CNY: 7.23
};

// Asynchronously fetch live rates from free keyless open-er api relative to USD
fetch('https://open.er-api.com/v6/latest/USD')
  .then(res => res.json())
  .then(data => {
    if (data && data.rates) {
      Object.assign(exchangeRates, data.rates);
      console.log('✅ Live conversion rates synchronized successfully from API');
    }
  })
  .catch(err => {
    console.error('⚠️ Failed to fetch live conversion rates, using fallbacks:', err);
  });

export function getCurrencySymbol(userOrCode) {
  const code = typeof userOrCode === 'string' ? userOrCode : (userOrCode?.settings?.currency || 'USD');
  return CURRENCY_SYMBOLS[code] || '$';
}

export function formatCurrency(amountInUSD, userOrCode) {
  const code = typeof userOrCode === 'string' ? userOrCode : (userOrCode?.settings?.currency || 'USD');
  const rate = exchangeRates[code] || 1;
  const converted = Number(amountInUSD || 0) * rate;
  
  const symbol = getCurrencySymbol(code);
  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol}${formatted}`;
}

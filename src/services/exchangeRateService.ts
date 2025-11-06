// Exchange rate service using Frankfurter.app (free, no API key needed)

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

const STORAGE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fallback rates in case API is down
const FALLBACK_RATES: ExchangeRates = {
  base: 'USD',
  rates: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    AUD: 1.52,
    CAD: 1.36,
    CHF: 0.88,
    CNY: 7.24,
    INR: 83.12,
    MXN: 17.15,
    SGD: 1.34,
    HKD: 7.83,
    NZD: 1.64,
    KRW: 1320.50,
    THB: 35.20,
    MYR: 4.72,
    PHP: 56.30,
    IDR: 15650.00,
    VND: 24500.00
  },
  lastUpdated: new Date().toISOString()
};

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' }
];

/**
 * Get cached exchange rates from localStorage
 */
const getCachedRates = (): ExchangeRates | null => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as ExchangeRates;
    const age = Date.now() - new Date(data.lastUpdated).getTime();

    if (age < CACHE_DURATION) {
      return data;
    }

    return null;
  } catch (error) {
    console.error('Error reading cached rates:', error);
    return null;
  }
};

/**
 * Save exchange rates to localStorage
 */
const cacheRates = (rates: ExchangeRates): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
  } catch (error) {
    console.error('Error caching rates:', error);
  }
};

/**
 * Fetch latest exchange rates from Frankfurter.app
 * Falls back to cached or hardcoded rates if API fails
 */
export const fetchExchangeRates = async (baseCurrency: string = 'USD'): Promise<ExchangeRates> => {
  try {
    // Check cache first
    const cached = getCachedRates();
    if (cached && cached.base === baseCurrency) {
      console.log('Using cached exchange rates');
      return cached;
    }

    // Fetch from API
    const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    const rates: ExchangeRates = {
      base: baseCurrency,
      rates: {
        [baseCurrency]: 1, // Include base currency
        ...data.rates
      },
      lastUpdated: new Date().toISOString()
    };

    // Cache the rates
    cacheRates(rates);

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);

    // Try to use cached rates even if expired
    const cached = getCachedRates();
    if (cached) {
      console.log('Using expired cached rates');
      return cached;
    }

    // Ultimate fallback to hardcoded rates
    console.log('Using fallback exchange rates');
    return FALLBACK_RATES;
  }
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // If rates are in base currency, convert directly
  if (rates.base === fromCurrency) {
    const rate = rates.rates[toCurrency];
    if (!rate) {
      console.warn(`No rate found for ${toCurrency}`);
      return amount;
    }
    return amount * rate;
  }

  // If converting to base currency
  if (rates.base === toCurrency) {
    const rate = rates.rates[fromCurrency];
    if (!rate) {
      console.warn(`No rate found for ${fromCurrency}`);
      return amount;
    }
    return amount / rate;
  }

  // Convert through base currency (from -> base -> to)
  const fromRate = rates.rates[fromCurrency];
  const toRate = rates.rates[toCurrency];

  if (!fromRate || !toRate) {
    console.warn(`Missing rates for ${fromCurrency} or ${toCurrency}`);
    return amount;
  }

  // Convert to base currency, then to target currency
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
};

/**
 * Get currency symbol by code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
};

/**
 * Get currency name by code
 */
export const getCurrencyName = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.name || currencyCode;
};

/**
 * Force refresh exchange rates (clears cache and fetches new)
 */
export const refreshExchangeRates = async (baseCurrency: string = 'USD'): Promise<ExchangeRates> => {
  localStorage.removeItem(STORAGE_KEY);
  return fetchExchangeRates(baseCurrency);
};

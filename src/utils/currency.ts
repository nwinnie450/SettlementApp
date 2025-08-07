// Currency utilities and exchange rate management

// Free exchange rate API endpoint (no API key required)
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest';

// Fallback API for redundancy
const FALLBACK_API_URL = 'https://api.fxratesapi.com/latest';

// Local storage keys
const STORAGE_KEY_RATES = 'groupsettle_exchange_rates';
const STORAGE_KEY_RATES_TIMESTAMP = 'groupsettle_rates_timestamp';

// Cache duration (1 hour)
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Default fallback rates if API is unavailable
const DEFAULT_RATES = {
  USD: { SGD: 1.35, MYR: 4.65, CNY: 7.25, EUR: 0.92, GBP: 0.79, JPY: 148 },
  SGD: { USD: 0.74, MYR: 3.45, CNY: 5.37, EUR: 0.68, GBP: 0.59, JPY: 109.8 },
  MYR: { USD: 0.215, SGD: 0.29, CNY: 1.56, EUR: 0.20, GBP: 0.17, JPY: 31.8 },
  CNY: { USD: 0.138, SGD: 0.186, MYR: 0.64, EUR: 0.127, GBP: 0.109, JPY: 20.4 },
  EUR: { USD: 1.087, SGD: 1.47, MYR: 5.06, CNY: 7.88, GBP: 0.86, JPY: 161 },
  GBP: { USD: 1.267, SGD: 1.71, MYR: 5.89, CNY: 9.17, EUR: 1.16, JPY: 187 },
  JPY: { USD: 0.0068, SGD: 0.0091, MYR: 0.0315, CNY: 0.049, EUR: 0.0062, GBP: 0.0053 }
};

// Supported currencies with their display info
export const SUPPORTED_CURRENCIES = {
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  SEK: { name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  DKK: { name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' }
};

interface CachedRates {
  rates: Record<string, number>;
  baseCurrency: string;
  timestamp: number;
}

/**
 * Get cached exchange rates from localStorage
 */
function getCachedRates(): CachedRates | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_RATES);
    if (!cached) return null;
    
    const data: CachedRates = JSON.parse(cached);
    
    // Check if cache is still valid (less than 1 hour old)
    const now = Date.now();
    if (now - data.timestamp > CACHE_DURATION) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to parse cached exchange rates:', error);
    return null;
  }
}

/**
 * Cache exchange rates to localStorage
 */
function cacheRates(rates: Record<string, number>, baseCurrency: string): void {
  try {
    const data: CachedRates = {
      rates,
      baseCurrency,
      timestamp: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache exchange rates:', error);
  }
}

/**
 * Fetch exchange rates from API
 */
async function fetchRatesFromAPI(baseCurrency: string = 'USD'): Promise<Record<string, number> | null> {
  const urls = [
    `${EXCHANGE_API_URL}/${baseCurrency}`,
    `${FALLBACK_API_URL}?base=${baseCurrency}`
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different API response formats
      if (data.rates) {
        return data.rates;
      } else if (data.conversion_rates) {
        return data.conversion_rates;
      }
      
      throw new Error('Invalid API response format');
    } catch (error) {
      console.warn(`Failed to fetch from ${url}:`, error);
    }
  }
  
  return null;
}

/**
 * Get exchange rates with caching
 */
export async function getExchangeRates(
  baseCurrency: string = 'USD',
  forceRefresh: boolean = false
): Promise<Record<string, number> | null> {
  // Try to get cached rates first (unless force refresh is requested)
  if (!forceRefresh) {
    const cached = getCachedRates();
    if (cached && cached.baseCurrency === baseCurrency) {
      return cached.rates;
    }
  }
  
  // Fetch fresh rates from API
  const freshRates = await fetchRatesFromAPI(baseCurrency);
  
  if (freshRates) {
    cacheRates(freshRates, baseCurrency);
    return freshRates;
  }
  
  // If API fails, try to return cached rates even if expired
  const cached = getCachedRates();
  if (cached && cached.baseCurrency === baseCurrency) {
    console.warn('Using expired exchange rates due to API failure');
    return cached.rates;
  }
  
  // As last resort, use default rates
  const defaultForBase = DEFAULT_RATES[baseCurrency as keyof typeof DEFAULT_RATES];
  if (defaultForBase) {
    console.warn('Using default exchange rates due to API and cache failure');
    return defaultForBase;
  }
  
  return null;
}

/**
 * Convert amount between currencies
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  customRates?: Record<string, number>
): Promise<{ convertedAmount: number; rate: number; } | null> {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return { convertedAmount: amount, rate: 1 };
  }
  
  let rates: Record<string, number> | null;
  
  if (customRates) {
    rates = customRates;
  } else {
    rates = await getExchangeRates(fromCurrency);
  }
  
  if (!rates) {
    // Try default rates as fallback
    const defaultForBase = DEFAULT_RATES[fromCurrency as keyof typeof DEFAULT_RATES];
    if (defaultForBase) {
      rates = defaultForBase;
    } else {
      return null;
    }
  }
  
  const rate = rates[toCurrency];
  if (typeof rate !== 'number') {
    return null;
  }
  
  const convertedAmount = amount * rate;
  
  return { convertedAmount, rate };
}

/**
 * Format currency amount with proper symbol and formatting
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;
  
  const currency = SUPPORTED_CURRENCIES[currencyCode as keyof typeof SUPPORTED_CURRENCIES];
  
  // Format the number
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  });
  
  // Build the display string
  let result = '';
  
  if (showSymbol && currency?.symbol) {
    result = `${currency.symbol}${formattedAmount}`;
  } else {
    result = formattedAmount;
  }
  
  if (showCode) {
    result += ` ${currencyCode}`;
  }
  
  return result;
}

/**
 * Get currency info
 */
export function getCurrencyInfo(currencyCode: string) {
  return SUPPORTED_CURRENCIES[currencyCode as keyof typeof SUPPORTED_CURRENCIES] || {
    name: currencyCode,
    symbol: currencyCode,
    flag: '💰'
  };
}

/**
 * Get all supported currencies as array for UI components
 */
export function getSupportedCurrencies() {
  return Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => ({
    code,
    ...info
  }));
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Get cache age in milliseconds
 */
export function getCacheAge(): number | null {
  const cached = getCachedRates();
  if (!cached) return null;
  
  return Date.now() - cached.timestamp;
}

/**
 * Check if cache is fresh (less than 1 hour old)
 */
export function isCacheFresh(): boolean {
  const age = getCacheAge();
  if (age === null) return false;
  
  return age < CACHE_DURATION;
}

/**
 * Clear cached exchange rates
 */
export function clearCachedRates(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_RATES);
    localStorage.removeItem(STORAGE_KEY_RATES_TIMESTAMP);
  } catch (error) {
    console.warn('Failed to clear cached rates:', error);
  }
}
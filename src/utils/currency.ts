import { ExchangeRate, ExchangeRateResponse } from '../types';

// Free exchange rate API endpoint (no API key required)
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest';

// Fallback API for redundancy
const FALLBACK_API_URL = 'https://api.fxratesapi.com/latest';

// Local storage keys
const STORAGE_KEY_RATES = 'groupsettle_exchange_rates';
const STORAGE_KEY_RATES_TIMESTAMP = 'groupsettle_rates_timestamp';

// Cache duration (24 hours in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface CachedRates {
  rates: Record<string, number>;
  baseCurrency: string;
  timestamp: number;
}

/**
 * Supported currencies with their display information
 */
export const SUPPORTED_CURRENCIES = {
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  KRW: { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  SEK: { name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  DKK: { name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  PLN: { name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  CZK: { name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  HUF: { name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  RON: { name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' }
};

/**
 * Get cached exchange rates from localStorage
 */
function getCachedRates(): CachedRates | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_RATES);
    if (!cached) return null;
    
    const data = JSON.parse(cached) as CachedRates;
    
    // Check if cache is still valid
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to parse cached exchange rates:', error);
    return null;
  }
}\n\n/**\n * Cache exchange rates to localStorage\n */\nfunction cacheRates(rates: Record<string, number>, baseCurrency: string): void {\n  try {\n    const data: CachedRates = {\n      rates,\n      baseCurrency,\n      timestamp: Date.now()\n    };\n    \n    localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(data));\n  } catch (error) {\n    console.warn('Failed to cache exchange rates:', error);\n  }\n}\n\n/**\n * Fetch exchange rates from API\n */\nasync function fetchRatesFromAPI(baseCurrency: string = 'USD'): Promise<Record<string, number> | null> {\n  const urls = [\n    `${EXCHANGE_API_URL}/${baseCurrency}`,\n    `${FALLBACK_API_URL}?base=${baseCurrency}`\n  ];\n  \n  for (const url of urls) {\n    try {\n      const response = await fetch(url);\n      \n      if (!response.ok) {\n        throw new Error(`HTTP ${response.status}`);\n      }\n      \n      const data = await response.json();\n      \n      // Handle different API response formats\n      if (data.rates) {\n        return data.rates;\n      } else if (data.conversion_rates) {\n        return data.conversion_rates;\n      }\n      \n      throw new Error('Invalid API response format');\n    } catch (error) {\n      console.warn(`Failed to fetch from ${url}:`, error);\n    }\n  }\n  \n  return null;\n}\n\n/**\n * Get exchange rates with caching\n */\nexport async function getExchangeRates(\n  baseCurrency: string = 'USD',\n  forceRefresh: boolean = false\n): Promise<Record<string, number> | null> {\n  // Try to get cached rates first (unless force refresh is requested)\n  if (!forceRefresh) {\n    const cached = getCachedRates();\n    if (cached && cached.baseCurrency === baseCurrency) {\n      return cached.rates;\n    }\n  }\n  \n  // Fetch fresh rates from API\n  const freshRates = await fetchRatesFromAPI(baseCurrency);\n  \n  if (freshRates) {\n    cacheRates(freshRates, baseCurrency);\n    return freshRates;\n  }\n  \n  // If API fails, try to return cached rates even if expired\n  const cached = getCachedRates();\n  if (cached && cached.baseCurrency === baseCurrency) {\n    console.warn('Using expired exchange rates due to API failure');\n    return cached.rates;\n  }\n  \n  return null;\n}\n\n/**\n * Convert amount between currencies\n */\nexport async function convertCurrency(\n  amount: number,\n  fromCurrency: string,\n  toCurrency: string,\n  customRates?: Record<string, number>\n): Promise<{ convertedAmount: number; rate: number; } | null> {\n  // If currencies are the same, no conversion needed\n  if (fromCurrency === toCurrency) {\n    return { convertedAmount: amount, rate: 1 };\n  }\n  \n  let rates: Record<string, number> | null;\n  \n  if (customRates) {\n    rates = customRates;\n  } else {\n    rates = await getExchangeRates(fromCurrency);\n  }\n  \n  if (!rates) {\n    return null;\n  }\n  \n  const rate = rates[toCurrency];\n  if (typeof rate !== 'number') {\n    return null;\n  }\n  \n  const convertedAmount = amount * rate;\n  \n  return { convertedAmount, rate };\n}\n\n/**\n * Format currency amount with proper symbol and formatting\n */\nexport function formatCurrency(\n  amount: number,\n  currencyCode: string,\n  options: {\n    showSymbol?: boolean;\n    showCode?: boolean;\n    minimumFractionDigits?: number;\n    maximumFractionDigits?: number;\n  } = {}\n): string {\n  const {\n    showSymbol = true,\n    showCode = false,\n    minimumFractionDigits = 2,\n    maximumFractionDigits = 2\n  } = options;\n  \n  const currency = SUPPORTED_CURRENCIES[currencyCode as keyof typeof SUPPORTED_CURRENCIES];\n  \n  // Format the number\n  const formattedAmount = amount.toLocaleString('en-US', {\n    minimumFractionDigits,\n    maximumFractionDigits\n  });\n  \n  // Build the display string\n  let result = '';\n  \n  if (showSymbol && currency?.symbol) {\n    result = `${currency.symbol}${formattedAmount}`;\n  } else {\n    result = formattedAmount;\n  }\n  \n  if (showCode) {\n    result += ` ${currencyCode}`;\n  }\n  \n  return result;\n}\n\n/**\n * Get currency info\n */\nexport function getCurrencyInfo(currencyCode: string) {\n  return SUPPORTED_CURRENCIES[currencyCode as keyof typeof SUPPORTED_CURRENCIES] || {\n    name: currencyCode,\n    symbol: currencyCode,\n    flag: '💰'\n  };\n}\n\n/**\n * Get all supported currencies as array for UI components\n */\nexport function getSupportedCurrencies() {\n  return Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => ({\n    code,\n    ...info\n  }));\n}\n\n/**\n * Check if we're online\n */\nexport function isOnline(): boolean {\n  return navigator.onLine;\n}\n\n/**\n * Get cache age in milliseconds\n */\nexport function getCacheAge(): number | null {\n  const cached = getCachedRates();\n  if (!cached) return null;\n  \n  return Date.now() - cached.timestamp;\n}\n\n/**\n * Check if cache is fresh (less than 1 hour old)\n */\nexport function isCacheFresh(): boolean {\n  const age = getCacheAge();\n  if (age === null) return false;\n  \n  return age < (60 * 60 * 1000); // 1 hour\n}\n\n/**\n * Clear cached exchange rates\n */\nexport function clearCachedRates(): void {\n  try {\n    localStorage.removeItem(STORAGE_KEY_RATES);\n    localStorage.removeItem(STORAGE_KEY_RATES_TIMESTAMP);\n  } catch (error) {\n    console.warn('Failed to clear cached rates:', error);\n  }\n}"
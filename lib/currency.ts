import { XMLParser } from "fast-xml-parser";

const TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";

interface ExchangeRate {
    currency: string;
    buying: number;
    selling: number;
}

// Simple in-memory cache
let ratesCache: ExchangeRate[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getExchangeRates(): Promise<ExchangeRate[]> {
    const now = Date.now();
    if (ratesCache && now - lastFetchTime < CACHE_DURATION) {
        return ratesCache;
    }

    try {
        const res = await fetch(TCMB_URL);
        const xmlData = await res.text();

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });
        const parsed = parser.parse(xmlData);

        const currencies = parsed.Tarih_Date.Currency;
        const rates: ExchangeRate[] = [];

        // Add TRY base
        rates.push({ currency: "TRY", buying: 1, selling: 1 });

        for (const curr of currencies) {
            if (["USD", "EUR", "GBP"].includes(curr["@_Kod"])) {
                rates.push({
                    currency: curr["@_Kod"],
                    buying: parseFloat(curr.ForexBuying),
                    selling: parseFloat(curr.ForexSelling)
                });
            }
        }

        ratesCache = rates;
        lastFetchTime = now;
        return rates;
    } catch (error) {
        console.error("Failed to fetch rates:", error);
        // Fallback if TCMB is down, maybe return empty or cached
        return ratesCache || [{ currency: "TRY", buying: 1, selling: 1 }];
    }
}

export async function convertToUSD(amount: number, currency: string): Promise<number> {
    const rates = await getExchangeRates();
    if (currency === "USD") return amount;

    // Get USD Rate (How much TRY is 1 USD)
    const usdRate = rates.find(r => r.currency === "USD")?.buying;
    if (!usdRate) return amount; // Fallback

    if (currency === "TRY") {
        return amount / usdRate;
    }

    // Convert Other -> TRY -> USD
    // Standard rate in list is "How much TRY is 1 Unit"
    const sourceRate = rates.find(r => r.currency === currency)?.buying;
    if (!sourceRate) return amount; // Fallback if currency not found

    const amountInTry = amount * sourceRate;
    return amountInTry / usdRate;
}

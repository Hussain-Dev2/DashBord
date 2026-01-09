# Currency Conversion System

## Overview
Your dashboard now uses **real-time currency conversion** from USD to IQD (Iraqi Dinar).

## How It Works

### 1. **Direction of Conversion**
- ✅ **USD → IQD** (US Dollar to Iraqi Dinar)
- All amounts in your database are stored in **USD**
- When you switch to IQD, the amounts are **converted on-the-fly**

### 2. **Real-Time Exchange Rates**
- Uses a **free public API**: [exchangerate-api.com](https://api.exchangerate-api.com/v4/latest/USD)
- Updates **automatically every 24 hours**
- Exchange rates are **cached locally** to avoid excessive API calls

### 3. **Caching Strategy**
```
┌─────────────────────────────────────────────┐
│ First Load:                                 │
│  1. Fetch rate from API                     │
│  2. Store in localStorage with timestamp    │
│  3. Display current rate                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Subsequent Loads (within 24 hours):         │
│  1. Check localStorage                      │
│  2. If < 24 hours old, use cached rate     │
│  3. If > 24 hours old, fetch fresh rate    │
└─────────────────────────────────────────────┘
```

### 4. **Fallback Mechanism**
If the API fails for any reason:
- Falls back to **1,310 IQD per USD**
- No interruption to user experience
- Error logged silently to console

## Features

### ✨ **Live Exchange Rate Display**
Hover over the **Currency Selector** (USD/IQD buttons) to see:
- Current exchange rate
- Last update date

### 📊 **Example Conversion**
```
Database Value: $100 USD

Display in USD: $100.00
Display in IQD: 132,000 IQD  (if rate is 1,320)
```

## API Details

### Endpoint
```
GET https://api.exchangerate-api.com/v4/latest/USD
```

### Sample Response
```json
{
  "rates": {
    "IQD": 1315.50,
    "EUR": 0.91,
    ...
  },
  "base": "USD",
  "date": "2026-01-09"
}
```

### Rate Limits
- **Free tier**: No authentication required
- No strict rate limits for reasonable use
- We cache for 24 hours to be respectful

## Files Modified

1. **`src/contexts/CurrencyContext.tsx`**
   - Added exchange rate fetching logic
   - Added caching mechanism
   - Exposed `exchangeRate` and `lastUpdated` values

2. **`src/components/CurrencySelector.tsx`**
   - Added hover tooltip showing current rate
   - Displays last update time

## Testing

To test the currency conversion:
1. Open your dashboard
2. Look at any dollar amount (e.g., Total Revenue)
3. Toggle between USD and IQD
4. The amounts should convert instantly
5. Hover over the currency selector to see the exact rate

## Updating the Rate Manually

If you want to force a rate update:
1. Open browser console
2. Run: `localStorage.removeItem('usd-iqd-rate')`
3. Refresh the page
4. A fresh rate will be fetched

## Production Deployment

The currency conversion works automatically in production. Just ensure:
- ✅ Your deployment has internet access to call the API
- ✅ No CORS restrictions blocking the API call
- ✅ localStorage is enabled in users' browsers

---

**Last Updated**: 2026-01-09  
**Conversion Direction**: USD → IQD  
**Update Frequency**: Every 24 hours  
**Fallback Rate**: 1,310 IQD per USD

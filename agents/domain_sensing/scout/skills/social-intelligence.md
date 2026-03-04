# Social Intelligence Skill

Enables the Scout agent to scrape and analyze social sentiment from X (Twitter) using a secure, airgapped implementation.

## Capabilities

- **Search**: Search recent tweets for specific narratives or tickers.
- **Sentiment**: Perform automated sentiment analysis (Bullish/Bearish/Neutral).
- **User**: Fetch user profile data and metrics.
- **Sandbox**: Built-in fallback mode allows logic testing even without active API tokens.

## Usage

```bash
# Search narratives
node shared_instruments/scripts/social_scraper.mjs search "solana meta"

# Analyze sentiment
node shared_instruments/scripts/social_scraper.mjs sentiment "$PROK"

# Check user influence
node shared_instruments/scripts/social_scraper.mjs user @elonmusk
```

## Security Protocol

- No telemetry or external middleware.
- Only uses local `.x_token` or environment variables.
- Read-only: No posting or interaction capabilities by design.

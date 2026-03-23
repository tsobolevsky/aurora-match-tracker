# Aurora Gaming Match Tracker

A simple Node.js bot that fetches upcoming Aurora Gaming matches across CS2, Dota 2, and MLBB using the Liquipedia API and sends a daily digest to Telegram.

Data provided by Liquipedia (liquipedia.net) — the esports wiki. Please support them!

## Setup

1. Get a Liquipedia API key at api.liquipedia.net
2. Set environment variables:
LIQUIPEDIA_API_KEY=your_key
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
3. Run: node aurora-matches.js

## Credits

- Match data: Liquipedia (CC BY-SA 3.0)
- Built for personal use, shared openly per Liquipedia free API terms

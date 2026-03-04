# Telegram Notification Skill

Allows the Manager agent to send real-time notifications to the team via Telegram.

## Capabilities
- Send task updates to the Manager channel.
- Send warnings to the Auditor channel.
- Send status reports to the Finance channel.

## Usage
Run the script using `node` or as a CLI tool.

```bash
# General usage
node shared_instruments/scripts/telegram-notifier.mjs "Message" [info|warn|task|finance]
```

## Environment Requirements
- `TELEGRAM_BOT_TOKEN`: The API token for the Telegram bot.
- `TELEGRAM_MANAGER_CHAT_ID`: Chat ID for the manager channel.
- `TELEGRAM_AUDITOR_CHAT_ID`: Chat ID for the auditor channel.
- `TELEGRAM_FINANCE_CHAT_ID`: Chat ID for the finance channel.

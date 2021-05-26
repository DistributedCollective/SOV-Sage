# SOV Sage
This codebase manages some Discord bots that provide utilities, information, and quality of life improvements for our user base.

Current active bots:
1. SOV Price
2. SOV Sage

## SOV Price
SOV Price bot is a user that joins and merely exists in the members list. Assigning it a role and displaying the role separetly then having the role displayed on top is preferred.

It has the following two required envrionment variables:
```
# SOV Price
DISCORD_SOV_PRICE_BOT_TOKEN=
DISCORD_SOV_PRICE_BOT_CHANNEL_ID=
```
### Commands

- `$sov` when given, will print out info on the latest SOV price fetch.

## SOV Sage
SOV Sage bot will join as a user, it can be grouped in the same role as `SOV Price` but not necessary.

```
# SOV Sage
DISCORD_SOV_SAGE_BOT_TOKEN=
# Sovryn Wiki API Key
WIKI_API_KEY=
```
### Commands

- `!w` used to fetch information from the Sovryn Wiki
- `!s` used to activate the Sage
- `!utils` random utilities

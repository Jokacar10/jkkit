---
"@ton/appkit-react": patch
---

Rebrand the native asset display from TON to GRAM in the UI. User-facing labels now read GRAM instead of TON:

- Balance "Send" labels and the low-balance modal now reference GRAM ("Not enough GRAM", etc.).
- The native-asset icon is now the GRAM mark: added `GramIconCircle` (and a `--ta-color-gram` token); the amount preview and staking balance block render it for the native asset.

Technical identifiers are unchanged (the `'ton'` token address, field names, locale keys). The `TonIcon` / `TonIconCircle` components and the SDK branding ("TON AppKit") are kept.

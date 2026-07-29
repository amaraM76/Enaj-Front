# enaj extension — redesigned popup

Drop-in visual refresh for the enaj Chrome extension **popup only**. Logic,
API calls, message passing, and all DOM ids are unchanged — only the look was polished.

## What changed

- **All emojis replaced with inline SVG icons** (cart, search, alert, check, bag,
  bookmark, spinner, etc.) for a consistent, modern look.
- **Refined styling** on the same teal brand palette: softer cards with subtle
  shadows and rounded corners, cleaner header, connected "dot" indicator in the
  user bar, unified button styles, and tidier flag / ingredient / result screens.
- **Reusable `.state` screen pattern** with a tinted icon badge for the setup,
  no-product, "not found", and prompt screens.
- Supported-store chip now lists Amazon · Sephora · Ulta · Walmart · Target.

## How to use

Copy these two files into your extension repo, replacing the existing ones:

- `popup.html`
- `popup.js`

No other files need to change. `manifest.json` still points at `popup.html`,
which still loads `popup.js` and preserves every element id
(`setup-screen`, `user-bar`, `user-name`, `disconnect-btn`, `no-product`,
`product-section`, `product-img`, `product-brand`, `product-name`, `scan-btn`,
`loading`, `results`) and the same content-script message (`getProductData`)
and backend endpoints.

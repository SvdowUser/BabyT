# BabyT PFP Generator Asset Guide

The website now includes a simple meme-coin landing page and a browser-based BabyT PFP generator.

## Layer order

The canvas draws every asset in this order:

1. Background
2. Character / Shoes
3. T-Shirt / Body
4. Glasses / Mask
5. Hand Accessory
6. Hat / Headgear

All images should be **1024 × 1024 px**.

Use **transparent PNG** files for every layer except backgrounds. Backgrounds can be normal PNGs or JPGs, but PNG is recommended.

## Important positioning rule

Every asset must be placed on the same 1024 × 1024 canvas.

Do not crop the accessory tightly. The full PNG should still be 1024 × 1024, with the accessory positioned exactly where it should appear on BabyT.

Example:

- A hat layer should be a 1024 × 1024 transparent PNG.
- The hat itself should sit at the top of the canvas where BabyT's head is.
- The rest of the image stays transparent.

This keeps the generator aligned automatically.

## File structure

```text
assets/
  backgrounds/
  characters/
  shirts/
  glasses/
  hand-accessories/
  hats/
```

## Background files

Put your six 1:1 background files here:

```text
assets/backgrounds/bg-01-valhalla-gold.png
assets/backgrounds/bg-02-solana-blue.png
assets/backgrounds/bg-03-meme-green.png
assets/backgrounds/bg-04-pink-chaos.png
assets/backgrounds/bg-05-night-mode.png
assets/backgrounds/bg-06-clean-white.png
```

## Character / Shoes files

Because the shoes are currently attached to the full character, these files should include the full BabyT character with the selected shoes.

```text
assets/characters/character-01-blue-sneakers.png
assets/characters/character-02-red-sneakers.png
assets/characters/character-03-black-sneakers.png
assets/characters/character-04-gold-sneakers.png
```

## T-Shirt / Body files

```text
assets/shirts/shirt-01-babyt-logo.png
assets/shirts/shirt-02-solana.png
assets/shirts/shirt-03-valhalla.png
assets/shirts/shirt-04-pink-hoodie.png
```

## Glasses / Mask files

```text
assets/glasses/glasses-01-black-shades.png
assets/glasses/glasses-02-rainbow-visor.png
assets/glasses/glasses-03-blue-round.png
assets/glasses/glasses-04-laser-eyes.png
```

## Hand Accessory files

```text
assets/hand-accessories/hand-01-baseball-bat.png
assets/hand-accessories/hand-02-solana-coin.png
assets/hand-accessories/hand-03-babyt-flag.png
assets/hand-accessories/hand-04-diamond-hands.png
```

## Hat / Headgear files

```text
assets/hats/hat-01-viking.png
assets/hats/hat-02-solana-cap.png
assets/hats/hat-03-golden-crown.png
assets/hats/hat-04-halo.png
assets/hats/hat-05-beanie.png
```

## What happens when files are missing?

The generator already has simple fallback drawings. That means the website works immediately even before you upload all final PNG assets.

Once you upload the correctly named files, the generator will automatically use your real assets instead of the fallbacks.

## Current socials / links

The site uses these values inside `index.html`:

```text
Contract Address: FDN8ycmEo11HxCssiFZ1nTgdJxyuETvyEc3mD85Hpump
Instagram: https://www.instagram.com/babytung_sol
X: https://x.com/babytcoinsol
TikTok: https://www.tiktok.com/@mythosmondays
Telegram: https://t.me/BabyTCommunity
```

Change these inside the `<body data-...>` attributes in `index.html` if needed.

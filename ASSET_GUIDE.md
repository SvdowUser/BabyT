# BabyT PFP Generator Asset Guide

The BabyT page is now built like a meme-native mobile landing page with a real-asset-only PFP generator.

Important: the generator no longer draws fake placeholder characters. If a PNG file is missing, that layer is skipped. The preview only shows assets that you upload into the folders below.

## Generator behavior

- The website reads `assets/manifest.json`.
- Users choose one active layer at a time.
- The left and right arrow buttons switch the selected trait inside that active layer.
- Layer buttons choose which category is being edited.
- The final canvas is exported as a 1024x1024 PNG.

## Layer order

The canvas draws every selected asset in this order:

1. Background
2. Character / Shoes
3. Shirt
4. Glasses / Mask
5. Hand Accessory
6. Hat / Headgear

## Format rules

- Master size: **1024x1024 px**
- File type: **PNG**
- Backgrounds: full 1:1 image, transparency optional
- All other layers: transparent PNG
- Never crop accessories tightly
- Every file must keep the full 1024x1024 canvas
- The object itself must already be positioned exactly where it belongs on BabyT

## The most important rule

The generator does not move or resize hats, glasses, shirts or items.

It simply stacks 1024x1024 PNGs on top of each other.

That means every accessory file must have the same canvas size as the base character. Example: a glasses layer is still 1024x1024, with only the glasses visible and everything else transparent.

## Recommended asset workflow

1. Finalize the base BabyT character first.
2. Export the base character as 1024x1024 PNG.
3. Create every accessory on top of that exact same canvas.
4. Hide the base character before exporting the accessory PNG.
5. Upload the PNG using the exact filename from the manifest.

## Basis character rule

The master character should be final before you create many accessories:

- same pose
- same camera angle
- same lighting
- same body size
- same shoe scale
- no hats
- no glasses
- no shirt overlay
- ideally no fixed hand item

Important: if hand accessories should be interchangeable later, the base character should not already contain a fixed bat or object.

## File structure

```text
assets/
  manifest.json
  backgrounds/
  characters/
  shirts/
  glasses/
  hand-accessories/
  hats/
```

## Manifest rule

Do not hardcode new asset names in `script.js`.

Add new options in:

```text
assets/manifest.json
```

Example:

```json
{
  "id": "hat-03-golden-crown",
  "name": "Golden Crown",
  "file": "hat-03-golden-crown.png",
  "weight": 12
}
```

`name` is what users see on the website.

`file` is the exact PNG file name.

`weight` controls how often the trait appears when pressing Random.

## Current production filenames

### Backgrounds

```text
assets/backgrounds/bg-01-valhalla-gold.png
assets/backgrounds/bg-02-solana-blue.png
assets/backgrounds/bg-03-meme-green.png
assets/backgrounds/bg-04-pink-chaos.png
assets/backgrounds/bg-05-night-mode.png
assets/backgrounds/bg-06-clean-white.png
```

### Character / Shoes

Because the shoes are currently attached to the full character, each file should contain the full BabyT character with that shoe variation.

```text
assets/characters/character-01-blue-sneakers.png
assets/characters/character-02-red-sneakers.png
assets/characters/character-03-black-sneakers.png
assets/characters/character-04-gold-sneakers.png
```

### Shirts

```text
assets/shirts/shirt-01-babyt-logo.png
assets/shirts/shirt-02-solana-tee.png
assets/shirts/shirt-03-valhalla-tee.png
assets/shirts/shirt-04-pink-hoodie.png
```

### Glasses / Mask

```text
assets/glasses/glasses-01-black-shades.png
assets/glasses/glasses-02-rainbow-visor.png
assets/glasses/glasses-03-blue-round.png
assets/glasses/glasses-04-laser-mask.png
```

### Hand Accessories

```text
assets/hand-accessories/hand-01-baseball-bat.png
assets/hand-accessories/hand-02-solana-coin.png
assets/hand-accessories/hand-03-babyt-flag.png
assets/hand-accessories/hand-04-diamond-hands.png
```

### Hats

```text
assets/hats/hat-01-viking.png
assets/hats/hat-02-solana-cap.png
assets/hats/hat-03-golden-crown.png
assets/hats/hat-04-halo.png
assets/hats/hat-05-beanie.png
```

## Quality checklist

Before uploading a PNG, check:

- file is exactly 1024x1024 px
- transparent space is really transparent
- no unwanted background color
- no cropped edges
- no extra shadows floating outside the object
- no accidental edits to the BabyT body or face
- file name matches `manifest.json`

## Current links

The site uses these values inside `index.html`:

```text
Contract Address: 4EL7nmuUrAJJmV6pKUWskYQTH3hsmdJQnUCP238Vpump
Instagram: https://www.instagram.com/babytung_sol
X: https://x.com/babytcoinsol
TikTok Video: https://vm.tiktok.com/ZGd9NYLDm/
Telegram: https://t.me/BabyTCommunity
```

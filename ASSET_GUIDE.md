# BabyT PFP Generator Asset Guide

The BabyT page is built like a meme-native mobile landing page with a real-asset-only PFP generator.

Important: the generator does not draw fake placeholder characters. If a file is missing, that layer is skipped. The preview only shows assets that are uploaded into the folders below.

## Hero GIF

The top hero area now has a responsive GIF slot where the old round `BT` coin was.

Upload your 1:1 GIF here:

```text
assets/hero/babyt-hero.gif
```

Recommended format:

- 1:1 ratio
- 1024x1024 px if possible
- GIF or animated WebP converted to GIF
- keep the full character inside the square with safe space around the edges
- the website uses `object-fit: contain`, so the GIF will not be cropped on desktop or mobile

If the GIF is missing, the site automatically falls back to the old `BT` circle.

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
- Backgrounds: full 1:1 image
- Accessories: transparent PNG, 1024x1024 px
- Never crop accessories tightly
- Every file must keep the full 1024x1024 canvas
- The object itself must already be positioned exactly where it belongs on BabyT

## The most important rule

The generator does not move or resize hats, glasses, shirts or items.

It simply stacks 1024x1024 assets on top of each other.

That means every accessory file must have the same canvas size as the base character. Example: a glasses layer is still 1024x1024, with only the glasses visible and everything else transparent.

## File structure

```text
assets/
  manifest.json
  hero/
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

`file` is the exact asset filename.

`weight` controls how often the trait appears when pressing Random.

## Current production filenames

### Hero GIF

```text
assets/hero/babyt-hero.gif
```

### Backgrounds

Scene backgrounds:

```text
assets/backgrounds/bg-01-city-center.png
assets/backgrounds/bg-02-beach.png
assets/backgrounds/bg-03-heaven.png
assets/backgrounds/bg-04-sky.png
assets/backgrounds/bg-05-studio-room.png
assets/backgrounds/bg-06-wood-workshop.png
```

Color / comic backgrounds:

```text
assets/backgrounds/bg-07-comic-splash.webp.b64
assets/backgrounds/bg-08-soft-blue.webp.b64
assets/backgrounds/bg-09-soft-red.webp.b64
assets/backgrounds/bg-10-soft-orange.webp.b64
assets/backgrounds/bg-11-soft-yellow.webp.b64
assets/backgrounds/bg-12-soft-green.webp.b64
assets/backgrounds/bg-13-soft-purple.webp.b64
assets/backgrounds/bg-14-soft-pink.webp.b64
assets/backgrounds/bg-15-wood-tone.webp.b64
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

Before uploading a PNG, GIF or B64 asset, check:

- file is exactly 1024x1024 px when possible
- transparent space is really transparent where needed
- no unwanted background color on accessory layers
- no cropped edges
- no extra shadows floating outside the object
- no accidental edits to the BabyT body or face
- file name matches the expected path

## Current links

The site uses these values inside `index.html`:

```text
Contract Address: 4EL7nmuUrAJJmV6pKUWskYQTH3hsmdJQnUCP238Vpump
Instagram: https://www.instagram.com/babytung_sol
X: https://x.com/babytung_sol
TikTok Video: https://vm.tiktok.com/ZGd9NYLDm/
```

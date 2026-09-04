# Crown Pixel v2

Crown Pixel is the crisp, hand-drawn pixel edition of the crowned pigeon. It preserves the original character silhouette, crown, scarf, beak, wings, and proportions at roughly 70×70 logical-pixel density.

## Work registration

The two editions are separate ChatGPT Work pets:

- `woofy goopy` — classic hand-drawn edition; currently active.
- `Crown Pixel` — 8-bit edition; registered but inactive.

Switch between them from **Settings → Pets**. Switching the active pet does not overwrite either edition.

## Files

- `spritesheet.png` — lossless ChatGPT Work Pets v2 atlas.
- `contact-sheet.png` — visual inspection sheet.
- `previews/idle-jump-idle.gif` — representative motion preview.
- `manifest.json` — frame layout and renderer metadata.

## Atlas contract

The atlas is 1536×2288 with 192×208 cells in an 8×11 grid. The first nine rows contain the Work pet states; the final two rows contain sixteen look directions. Unused cells are transparent.

## Electron rendering

Use nearest-neighbor sampling and render at integer multiples whenever possible:

```css
.pet-sprite {
  image-rendering: pixelated;
}
```

Read the cell size, rows, and frame counts from `manifest.json` instead of hard-coding them in the animation controller.

## Credit

Artwork courtesy of @Mustroomf.

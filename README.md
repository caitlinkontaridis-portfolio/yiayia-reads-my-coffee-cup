# Yiayia reads my coffee cup
*Η γιαγιά διαβάζει το φλιτζάνι μου*

## How the computer vision works

All of it lives in `js/vision.js`, written from scratch with no libraries.

1. **Find the cup.** The photo is scaled to 720 px. Otsu thresholding separates bright porcelain from the background; the bright region nearest the centre is taken as the cup and a circle is fitted to it. If that fails, a centred circle is used. In adjust mode you can drag the circle, resize it by its edge, and drag the gold dot to where the handle is.
2. **Separate grounds from porcelain.** Inside the circle, a global Otsu threshold (guarded so an almost clean cup isn't split in half) is combined with an adaptive local-mean threshold that copes with uneven light. Morphological opening removes speckle and closing reconnects broken strokes. The sensitivity slider shifts both thresholds.
3. **Find the shapes.** Connected-component labelling splits the mask into separate blobs.
4. **Measure each shape.** For every blob: area, image moments (elongation and orientation), perimeter and circularity, convex hull and solidity, deepest concavity (notches like the cleft of a heart or a fish's tail), holes, a thinness ratio, and a radial signature whose peaks count the points or arms.
5. **Propose a symbol.** Rules over those measurements propose a symbol with a confidence: ring, eye, line, wavy line, snake, bird, star, tree, cross, triangle, mountain, heart, crescent, fish, circle, dark mass, and money dots (many small specks clustered together). Anything that fits no rule becomes an "unclear figure".
6. **Place it in the cup.** Distance from the centre gives the rim, walls or bottom (time). The angle from the handle gives the handle side (you and home), the far side (work, money, travel), and left or right (fading or approaching).
7. **Write the reading.** `js/reading.js` combines meaning, size and position, adds position-specific notes (a snake near the rim is an immediate danger, a ring by the handle is your own romance), reads the saucer, and orders the story through the cup.

Silhouette rules can't recognise a dog or a horse, which is exactly where human readers use imagination. So each symbol has a "See something else?" menu: relabel it and the reading updates. You can also hide anything that isn't a symbol.

Run the tests with `npm test` (needs Node 18 or newer). They draw synthetic shapes and check that each is classified as intended.

## Files

```
index.html          the three tabs, including Thea Maria's story
images/             put thea-maria.jpg here
apple-touch-icon.png, favicon.png   home-screen and browser icons
css/styles.css      look and feel (light and dark)
js/vision.js        the computer vision pipeline
js/symbols.js       the symbol dictionary and cup geography
js/reading.js       turns shapes and positions into prose
js/app.js           uploads, the calibration canvas, and the UI
test/               synthetic-shape tests and a sample cup photo
```

## Sources

Symbol meanings are summarised in our own words from
[Cappadocia Workshops](https://cappadociaworkshops.com/turkish-coffee-cup-reading-symbols),
[Ekaterina Botziou](https://www.ekaterinabotziou.com/how-to-read-a-greek-coffee-cup/),
[Instructables](https://www.instructables.com/Turkish-Coffee-Fortune-Telling/) and
[GetGreece](https://www.getgreece.com/coffee/greek-coffee-readings).

Made with love, in memory of the cups Thea Maria read. For fun and for the ritual, not for prediction.

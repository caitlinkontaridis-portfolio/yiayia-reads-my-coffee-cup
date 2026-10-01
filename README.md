# Yiayia reads my coffee cup
*Η γιαγιά διαβάζει το φλιτζάνι μου*

Upload a photo of your finished Greek coffee cup and Yiayia reads it. The site finds the cup, picks out the shapes the grounds left behind, works out where each one sits, and reads them the traditional way.

It has three tabs: **Read my cup** (upload and reading), **Our tradition** (how it began with Thea Maria, and what cup reading means in Greek culture), and **The symbols** (a searchable dictionary).

Everything runs in the browser with plain JavaScript. There is no server, nothing to install, and photos never leave the device (unless you choose the optional Claude story, below).

## Put it on GitHub Pages

1. Create a new repository on GitHub, for example `yiayia-reads-my-coffee-cup`.
2. Upload every file in this folder to it, keeping the folders (`css/`, `js/`, `test/`). You can drag the whole folder onto the repository's "Add file → Upload files" page.
3. In the repository, open **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/yiayia-reads-my-coffee-cup/`.

Or from a terminal:

```bash
cd kafemanteia
git init && git add . && git commit -m "Coffee cup reader"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/yiayia-reads-my-coffee-cup.git
git push -u origin main
```

then turn on Pages as in step 3.

## Make it yours

**Thea Maria's photo.** Put a photo named `thea-maria.jpg` in the `images/` folder and it appears, framed, at the top of the "Our tradition" tab. If there's no photo, that space simply doesn't show.

**The story.** Thea Maria's story is in `index.html`, in the section marked `OUR TRADITION`. It's plain text between `<p>` and `</p>` tags, so you can add your own memories, names, or her favourite sayings directly on GitHub with the pencil (edit) button.

## On iPhone

The site is built to work in Safari on iPhone:

- **Choose a photo** offers Take Photo or the Photo Library. iPhone HEIC photos and their rotation are handled.
- The photo scrolls with the page like everything else. To move the circle, tap **Adjust the circle**, drag, then tap **Done**. If Yiayia can't find the cup's edge on her own, adjust mode opens automatically.
- Every button is at least 44 points tall, and text fields are sized so Safari doesn't zoom in when you tap them.
- In Safari, tap Share → **Add to Home Screen** to get a Yiayia icon that opens like an app.

For the best reading, hold the phone level directly above the cup, in daylight, without flash.

## Run it locally

The page uses JavaScript modules, so it needs to be served rather than opened as a file:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

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

## Greek or Turkish timing

The sources disagree about time. In the Greek reading used here, the bottom is the past, the walls the present and the rim the future. The Turkish reading treats the rim as the next week or two, the walls as the coming months and the bottom as the distant future. The page lets you switch.

## Optional: Claude tells the story

Under the reading, "Have Yiayia tell it as a story" sends the photos and the detected symbols to Claude, which writes a warmer, story-like reading in the voice of a yiayia. It uses the visitor's own Anthropic API key, sent directly from their browser to Anthropic. Because GitHub Pages is a public static site, never put your own key in the code.

The model name is set at the top of `js/app.js` (`MODEL`). Change it there if Anthropic retires it.

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

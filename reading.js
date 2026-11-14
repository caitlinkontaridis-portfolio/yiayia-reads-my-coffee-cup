// reading.js — composes a reading from what the vision step found.
import { SYMBOLS, TRADITIONS, SIDES } from './symbols.js';

const SIDE_PHRASE = { handle: 'on your side of the cup', opposite: 'on the far side', left: 'on the fading side', right: 'on the coming side', centre: 'in the very centre' };
const RING_WORDS = { rim: 'near the rim', middle: 'on the walls, halfway down', bottom: 'at the bottom' };

// A few symbols change their message depending on where they sit.
const SPECIAL = {
  snake: { rim: 'So close to the rim, the danger is immediate.', bottom: 'Deep in the cup, it is an old problem that lingers.' },
  scorpion: { rim: 'Near the rim, the threat is present now.', bottom: 'Low in the cup, old grudges are resurfacing.' },
  heart: { handle: 'Beside the handle, the love is in your own life.', rim: 'Near the rim, a new romance may be approaching.' },
  ring: { handle: 'By the handle, this is your own romance.', opposite: 'Opposite the handle, someone close to you may be the one committing.' },
  key: { rim: 'Near the rim, the opportunity is about to arrive.', bottom: 'At the bottom, an old question finally gets its answer.' },
  dots: { handle: 'Near the handle, the money comes to you personally.' },
  dog: { handle: 'By the handle, it is someone already in your inner circle.', opposite: 'Far from the handle, you will meet someone reliable.' },
  bird: { rim: 'Near the rim, the news is almost at your door.' },
  eagle: { rim: 'Near the rim, triumph is imminent.', bottom: 'At the bottom, a long-held ambition finally takes flight.' },
  turtle: { handle: 'Near the handle, it promises security at home.' },
  letter: { handle: 'By the handle, this person is family or a close friend.', opposite: 'Opposite the handle, they come through work or your wider circle.' },
  anchor: { rim: 'Near the rim, it promises success in work and in love.', middle: 'On the walls, it means a journey that goes smoothly.', bottom: 'At the bottom, it means you are well liked and settled among friends.' },
  horseshoe: { rim: 'Near the rim, the luck is arriving now.', handle: 'By the handle, the luck lands at your own door.' },
  sun: { handle: 'Beside the handle, the brightness is in your own home.', rim: 'Near the rim, the good turn is very close.' },
  envelope: { rim: 'Near the rim, the message is almost in your hands.', opposite: 'Opposite the handle, it comes from work or from far away.' },
  bride: { handle: 'By the handle, the happy news is in your own family.' },
  chain: { handle: 'By the handle, the bond is your own.' },
  camel: { opposite: 'Opposite the handle, the good fortune travels from far away.' },
  fountain: { handle: 'Beside the handle, the happiness flows through your home.' },
  bell: { rim: 'Near the rim, you will hear the news very soon.' },
  fox: { handle: 'Close to the handle, this is someone near you, so be gentle but watchful.' },
  flag: { bottom: 'Low in the cup, the warning is about something old you have not finished.' },
  clover: { rim: 'Near the rim, the luck comes soon.' },
};

function place(shape, tradition) {
  const t = TRADITIONS[tradition].rings[shape.loc.ring];
  const side = SIDES[shape.loc.side];
  const where = shape.loc.side === 'centre'
    ? `${RING_WORDS[shape.loc.ring]}, right in the centre`
    : `${RING_WORDS[shape.loc.ring]}, ${shape.loc.side === 'handle' ? 'beside the handle' : shape.loc.side === 'opposite' ? 'opposite the handle' : `on the ${shape.loc.side}`}`;
  return { where, sentence: `It sits ${where}, which speaks to ${t.time} and to ${side.area}.`, time: t.short, side: SIDE_PHRASE[shape.loc.side] };
}

function sizeWord(shape, cupArea) {
  const rel = shape.f.area / cupArea;
  if (shape.key === 'dots') return shape.count > 15 ? 'A generous scatter of' : 'A small cluster of';
  return rel > 0.05 ? 'A large, bold' : rel > 0.012 ? 'A clear' : 'A small, faint';
}

export function composeReading(images, tradition) {
  const cups = images.filter((i) => i.kind === 'cup' && i.result);
  const saucers = images.filter((i) => i.kind === 'saucer' && i.result);
  const out = { overview: '', items: [], saucer: '', closing: '' };
  if (!cups.length && !saucers.length) return out;

  // overview from how much of the cup the grounds cover, and the balance of symbols
  const cov = cups.length ? cups.reduce((s, c) => s + c.result.coverage, 0) / cups.length : 0;
  const kept = cups.flatMap((c, ci) => c.result.shapes
    .filter((s) => s.key !== 'ignore' && SYMBOLS[s.key])
    .map((s) => ({ ...s, imageIndex: images.indexOf(c), cupArea: Math.PI * (c.cup.r * 0.96) ** 2, multi: cups.length > 1, cupNo: ci + 1 })));
  const tone = kept.reduce((s, x) => s + SYMBOLS[x.key].tone, 0);

  if (cups.length) {
    const mood = cov < 0.08
      ? 'Your cup is light and clear. That is a good sign: relief and happiness ahead, with little weighing on you.'
      : cov < 0.25
        ? 'Your cup is balanced, with clean porcelain showing between the grounds. Life has its weight right now, but there is room to breathe.'
        : 'Your cup is dark and heavy. This is a time of strong feelings or real challenges, so look for the clear patches: that is where the light gets in.';
    const lean = !kept.length
      ? 'No clear shapes stand out yet. Try a sharper photo from directly above, or raise the sensitivity.'
      : tone > 1 ? 'Most of what appears is favourable.'
        : tone < -1 ? 'Several cautions appear, so read them as advice, not as fate.'
          : 'The signs are mixed, which usually means the outcome is in your hands.';
    out.overview = `${mood} ${lean}`;
  }

  // read from the most immediate zone inward, so the story flows
  const order = tradition === 'greek' ? ['bottom', 'middle', 'rim'] : ['rim', 'middle', 'bottom'];
  kept.sort((a, b) => order.indexOf(a.loc.ring) - order.indexOf(b.loc.ring) || b.f.area - a.f.area);

  for (const s of kept) {
    const sym = SYMBOLS[s.key];
    const p = place(s, tradition);
    const special = SPECIAL[s.key]?.[s.loc.side] || SPECIAL[s.key]?.[s.loc.ring] || '';
    const lead = `${sizeWord(s, s.cupArea)} ${sym.name.toLowerCase()}.`;
    out.items.push({
      id: s.id, imageIndex: s.imageIndex, key: s.key, conf: s.conf, cupNo: s.multi ? s.cupNo : null,
      title: sym.name, greek: sym.el, time: p.time, side: p.side,
      text: [lead, sym.meaning, p.sentence, special].filter(Boolean).join(' '),
    });
  }

  if (saucers.length) {
    const sc = saucers.reduce((s, c) => s + c.result.coverage, 0) / saucers.length;
    const lump = saucers.some((c) => c.result.shapes.some((s) => s.f.area / (Math.PI * c.cup.r ** 2) > 0.08));
    out.saucer = (sc < 0.06
      ? 'The saucer is mostly clean: harmony at home.'
      : sc < 0.2 ? 'The saucer carries some grounds: ordinary household ups and downs, nothing that won\'t pass.'
        : 'The saucer is heavy with grounds, pointing to stress or unspoken tension at home.')
      + (lump ? ' A thick lump slid down onto it, which is read as a burden lifting from your shoulders.' : '');
  }

  out.closing = 'Keep what makes you smile, my child, and let the rest go with the grounds.';
  return out;
}

// Plain-text summary used to brief Claude for the optional narrative reading.
export function summarize(reading, tradition) {
  const lines = reading.items.map((i) => `- ${i.title} (${i.time}, ${i.side})${i.cupNo ? ` in cup photo ${i.cupNo}` : ''}`);
  return `Tradition: ${TRADITIONS[tradition].label}\nOverall: ${reading.overview}\nSymbols found:\n${lines.join('\n') || '- none clear'}\n${reading.saucer ? `Saucer: ${reading.saucer}` : ''}`;
}

# Trailhead Math

A math adventure game covering the 5th grade curriculum. Climb a mountain one camp at a time: learn the skill, practice it, then beat the boss to unlock the next camp.

**Play it:** https://cloudietuan.github.io/trailhead-math/

## How it works

Each of the 9 camps has three parts:

1. **Field Guide**: a short, hands-on lesson with worked examples and interactive tools (fraction bars, a place-value slider, an area model, a cube builder, a clickable grid, and more).
2. **Practice**: 8 fresh questions with hints and a second try. Correct answers in a row build a combo for bonus coins. Earn up to 3 stars.
3. **Boss battle**: one try per question and 3 hearts. Fast answers land critical hits. Beat the boss (or earn 2 practice stars) to unlock the next camp.

At the top, the **Summit** has a final boss with mixed questions from every camp and a 60-second **Lightning Round**.

Coins and XP unlock new trail buddies in the shop.

## The camps

| # | Camp | Skill | Standard |
|---|------|-------|----------|
| 1 | Base Camp | Order of operations | 5.OA.1 |
| 2 | Tenfold Falls | Powers of 10 and place value | 5.NBT.1–4 |
| 3 | Decimal Creek | Adding and subtracting decimals | 5.NBT.7 |
| 4 | Product Ridge | Multi-digit multiplication | 5.NBT.5 |
| 5 | Divide Pass | Long division | 5.NBT.6 |
| 6 | Fraction Forest | Adding and subtracting fractions | 5.NF.1–2 |
| 7 | Scaling Cliffs | Multiplying fractions | 5.NF.4–6 |
| 8 | Volume Caves | Volume | 5.MD.3–5 |
| 9 | Lookout Grid | The coordinate plane | 5.G.1–2 |

## For grown-ups

- Tap the person icon in the top bar to see progress for every camp, unlock all camps, or turn sound off.
- A good pace is one camp a week, about 15 minutes a day.
- Progress saves in the browser on the device being used. No accounts, no data collected.
- Answers can be typed as whole numbers, decimals, fractions (`3/4`), mixed numbers (`1 1/2`), or points (`(3, 5)`).

## Files

```
index.html        page shell
css/style.css     all styles (light and dark mode)
js/util.js        helpers, answer checking, drawings
js/units.js       question generators, bosses, buddies
js/lessons.js     Field Guide lessons and interactive tools
js/game.js        map, practice, boss battles, shop, saving
```

No build step. Open `index.html` in a browser, or serve the folder with GitHub Pages.

# Brain Brawl

**Math. Code. AI. Beat the bosses.**

A learning game for a kid who's past 5th grade math and wants to code. Three worlds, 24 levels, a boss at the end of every level, and a Titan at the end of every world.

**Play it:** https://cloudietuan.github.io/trailhead-math/

(This used to be Trailhead Math. If you played that on this device, your name and coins carry over.)

## The three worlds

### Math Arena (6th grade, plus some 7th)

| # | Level | Skill | Standard |
|---|-------|-------|----------|
| 1 | Below Zero | Negative numbers | 6.NS.5–7, 7.NS.1–2 |
| 2 | Power Up | Exponents and order of operations | 6.EE.1–2 |
| 3 | Factor Factory | Factors, GCF and LCM | 6.NS.4 |
| 4 | Ratio Rumble | Ratios and unit rates | 6.RP.1–3 |
| 5 | Percent Power | Percents, discounts, tips | 6.RP.3, 7.RP.3 |
| 6 | Flip It | Dividing fractions | 6.NS.1 |
| 7 | Variable Vault | Expressions and variables | 6.EE.2–4 |
| 8 | Balance Battle | Equations and inequalities | 6.EE.5–8, 7.EE.4 |
| 9 | Shape Shifter | Area and surface area | 6.G.1, 6.G.4 |
| 10 | Stat Attack | Mean, median, mode, range | 6.SP.3–5 |

### Code Lab

| # | Level | What he learns |
|---|-------|----------------|
| 1 | Robot Moves | Sequences: program a robot with blocks |
| 2 | Loop Power | Repeat loops and nested loops |
| 3 | Smart Bot | If statements and "repeat until," tested on random maps |
| 4 | Hello, Lua | print, variables, strings |
| 5 | If This, Then That | if / elseif / else, and / or |
| 6 | Loop Lab | for and while loops |
| 7 | Function Junction | Functions, parameters, return |
| 8 | Game Scripts | Tables, events (like Roblox's `Touched`), and fixing an AI's buggy code |

Levels 4–8 use **real Lua**, the language Roblox games are built on (Roblox uses a version called Luau). He types real code in a real editor and it runs in the browser.

### AI Academy

| # | Level | What he learns |
|---|-------|----------------|
| 1 | What Is AI? | AI vs. regular code, the 5 big ideas |
| 2 | Robot Brain | Lab: train a learning bot, watch bias happen, then fix it |
| 3 | Chatbot Secrets | How chatbots predict the next word, hallucinations |
| 4 | Prompt Power | Lab: build prompts and see how the answer changes |
| 5 | Fact Checker | Catch an AI's wrong answers in math, code and facts |
| 6 | Safe & Smart | Privacy, deepfakes, bias, honesty |

## How a level works

1. **Learn**: a short lesson with sliders, live code, or diagrams, plus quick checks.
2. **Practice**: 8 questions, robot puzzles, Lua challenges, or a lab. Earn up to 3 stars.
3. **Boss**: 3 hearts. Fast answers land critical hits.

Beat the boss **or** earn 2 stars to unlock the next level.

Also: coins, XP levels, 11 unlockable heroes, a Star Road with rewards, daily quests, a day streak, and a 60-second Speed Run.

## For grown-ups

- Tap the person icon in the top bar to see progress, turn sound off, or unlock every level.
- **No real chatbot is connected.** Every AI reply in the AI Academy is pre-written, so nothing your kid types leaves the device.
- Progress saves in the browser on the device being used. No accounts, no ads, no data collected.
- A good pace is one level every few days, 15 to 20 minutes at a time.

## Files

```
index.html          page shell
css/style.css       all styles
js/core.js          helpers, answer checking, saving, sound, daily quests
js/art.js           the characters (drawn in code) and icons
js/math.js          Math Arena lessons, question generators, bosses
js/code.js          Lua runner, code editor, robot puzzle engine, Code Lab levels
js/ai.js            AI Academy lessons, labs, question banks
js/app.js           screens: lobby, maps, levels, battles, shop, Star Road
vendor/fengari-web.js   Lua 5.3 in the browser (MIT license)
```

No build step. Open `index.html` in a browser, or serve the folder with GitHub Pages.

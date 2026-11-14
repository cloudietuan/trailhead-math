# Brain Brawl

**Math. Code. AI. Beat the bosses.**

A learning game for a kid who's past 5th grade math and wants to code. Four worlds, 39 levels, a boss at the end of every level, a Titan at the end of every world, and a map full of characters to collect.

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

## What's new in Brain Brawl 2

- **Algebra Peaks**: 9 harder math levels (grades 7 and 8). Proportions and percent change, multi-step equations, circles, volume, probability, exponent laws and scientific notation, the Pythagorean theorem, slope, and systems of equations.
- **AI Academy, levels 7 to 12**: tokens and context windows, a build-a-neuron lab, how training works, advanced prompting, using AI as a tutor instead of a shortcut, and picking the right tool.
- **Echo**: a guide character in the corner. Echo flies a pointer around the screen to give tours, and plays animated "holo-board" explanations of how the math and the AI work. Voice uses the browser's built-in text-to-speech and can be turned off from Echo's menu.
- **The Grid**: six zones of fog-of-war tiles. Correct answers anywhere earn energy. Energy scans tiles. Tiles hide coins, capsules, relics, wild characters to battle, and a guardian that opens the next zone.
- **Collecting**: 44 characters in five rarities (rarer ones give coin, crit-time and heart bonuses), 6 permanent relics, 18 badges, and capsules. Everything is earned by playing. Nothing is for sale.
- **Elite rematches**: beat a boss, then fight a tougher version for a capsule and an extra star.
- A neon restyle.
- **Echo, show me how**: after a wrong answer, Echo walks through that exact question step by step, with its own numbers (and a drawing for some question types).
- **Adaptive mixing**: the game tracks what gets missed and asks it more often in Titan fights, the Grid, Speed Run and raids. The **Weak Spot Drill** is 8 questions on the three shakiest topics.
- **Character power-ups**: a duplicate adds a star to the character (up to 5), and each star adds +5% coins.
- **Weekly Raid**: a new 320 HP boss every week, with a character that can only be won that week.
- **Obby Builder**: 5 courses where real Lua (`walk`, `jump`, `gapAhead`, `atFlag`) runs a character over lava. The later courses are random, so the code has to use loops and ifs.
- **Grown-up report**: the last 7 days of questions, accuracy and minutes, strongest and weakest topics, and a copy-as-text button.
- **Transfer code**: copy progress from one device and paste it on another. No account needed.

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
css/style.css       base styles
css/future.css      neon theme and styles for everything new
js/core.js          helpers, answer checking, saving, sound, daily quests
js/art.js           the characters (drawn in code) and icons
js/math.js          Math Arena lessons, question generators, bosses
js/math2.js         Algebra Peaks (grades 7 and 8)
js/code.js          Lua runner, code editor, robot puzzle engine, Code Lab levels
js/ai.js            AI Academy lessons, labs, question banks
js/ai2.js           AI Academy levels 7 to 12
js/explore.js       the Grid map, wild characters, relics, capsules, badges, Codex
js/guide.js         Echo: pointer tours, animated explainers, step-by-step solving
js/extras.js        adaptive mixing, weak-spot drill, weekly raid, Obby Builder, report, transfer code
js/app.js           screens: lobby, maps, levels, battles, shop, Star Road
vendor/fengari-web.js   Lua 5.3 in the browser (MIT license)
```

No build step. Open `index.html` in a browser, or serve the folder with GitHub Pages.

// AI Academy: how AI works, how to use it well, and how to stay safe.
// Built around the "Five Big Ideas in AI" (AI4K12): perception, representation, learning, natural interaction, societal impact.
// No real chatbot is used. Every AI reply in here is pre-written, so nothing leaves the device.

// Pull questions from a bank in a shuffled cycle so repeats are rare
function bankGen(bank, mk) {
  let order = [];
  return () => { if (!order.length) order = shuffle(bank.map((_, i) => i)); return mk(bank[order.pop()]); };
}
const mc = ([q, right, wrongs, why, hint]) => choice(q, right, wrongs, why, hint || 'Think about how AI actually works.');

const AI_BANK = {
  what: [
    ['A calculator adding 2 + 2. AI or not?', 'Not AI', ['AI'], 'A calculator follows exact rules a person wrote. It never learns or guesses.'],
    ['Your phone unlocking when it sees your face. AI or not?', 'AI', ['Not AI'], 'It learned what your face looks like from examples, then makes a guess each time it sees you.'],
    ['A video app choosing what to show you next. AI or not?', 'AI', ['Not AI'], 'It learns patterns from what you (and millions of others) watched, then predicts what you\'ll like.'],
    ['A light switch. AI or not?', 'Not AI', ['AI'], 'Flip it, the light turns on. Same thing every time. No learning.'],
    ['A chatbot that answers questions in full sentences. AI or not?', 'AI', ['Not AI'], 'Chatbots learned language patterns from huge amounts of text.'],
    ['An email filter that learns which emails are spam. AI or not?', 'AI', ['Not AI'], 'It learned from tons of examples of spam and not-spam.'],
    ['A microwave timer counting down. AI or not?', 'Not AI', ['AI'], 'It just counts down. No learning, no guessing.'],
    ['A robot vacuum that maps your room with sensors. AI or not?', 'AI', ['Not AI'], 'It perceives the room with sensors and builds a map. That\'s AI.'],
    ['A game boss that always does the exact same attack pattern. AI or not?', 'Not AI', ['AI'], 'That\'s a script: fixed instructions. Game devs call it "AI" sometimes, but it isn\'t learning anything.'],
    ['A photo app that finds all your pictures of dogs. AI or not?', 'AI', ['Not AI'], 'It learned what dogs look like from millions of labeled pictures.'],
    ['A Lua script that prints 1 to 10. AI or not?', 'Not AI', ['AI'], 'That\'s regular code. It does exactly what you wrote. Nothing more.'],
    ['A voice assistant understanding "set a timer for 5 minutes". AI or not?', 'AI', ['Not AI'], 'Understanding speech means turning sound into words and meaning. That\'s AI.'],
    ['What is the biggest difference between AI and regular code?', 'AI learns patterns from examples', ['AI is always right', 'AI runs faster', 'AI doesn\'t need computers'], 'Regular code follows rules a person wrote. AI learns its own patterns from data.'],
    ['What does AI mostly do?', 'Makes guesses (predictions) from patterns', ['Knows everything for sure', 'Thinks and feels like a human', 'Only does math'], 'AI makes predictions. Good guesses, often, but still guesses.'],
    ['Which is a <b>sensor</b> an AI might use to perceive the world?', 'A camera', ['A sticker', 'A pencil', 'A rubber band'], 'Cameras, microphones and touch sensors let AI "see", "hear" and "feel".'],
  ],
  learn: [
    ['To teach an AI to spot cats, you give it...', 'Lots of labeled pictures of cats and not-cats', ['One really good cat picture', 'A list of cat names', 'A cat'], 'AI learns from many labeled examples. That\'s called training data.'],
    ['The examples an AI learns from are called...', 'Training data', ['Cheat codes', 'Passwords', 'Wi-Fi'], 'Training data is what the AI studies to find patterns.'],
    ['An AI trained only on pictures of orange cats sees a black cat. What might happen?', 'It might not know it\'s a cat', ['It will definitely know', 'It turns the cat orange', 'It shuts down'], 'If the training data doesn\'t include something, the AI may get it wrong.'],
    ['What makes an AI\'s guesses better?', 'More examples that cover lots of different cases', ['A bigger screen', 'Yelling at it', 'Fewer examples'], 'Lots of varied examples help the AI learn the real pattern.'],
    ['If people label the training data wrong, the AI will...', 'Learn the wrong thing', ['Fix the labels itself', 'Ignore the labels', 'Refuse to learn'], 'Garbage in, garbage out! AI learns whatever its teachers show it.'],
    ['<b>Bias</b> in AI means...', 'It treats some cases unfairly because of its training data', ['It\'s too fast', 'It likes one color', 'It is broken forever'], 'If the training data is lopsided, the AI\'s guesses will be lopsided too.'],
    ['Why test an AI on examples it has <b>never seen</b>?', 'To check it really learned the pattern, not just memorized', ['To confuse it', 'To make it faster', 'No reason'], 'Memorizing isn\'t learning. New examples show if it really "gets it".'],
    ['A face-unlock AI was trained mostly on adults. Who might it struggle with?', 'Kids', ['Adults', 'Nobody', 'Only people with hats'], 'It saw few kids in training, so it learned less about kids\' faces. That\'s bias.'],
  ],
  talk: [
    ['A chatbot tells you about a book that doesn\'t exist, with a made-up author. This is called...', 'A hallucination', ['A virus', 'A Wi-Fi glitch', 'A cheat code'], 'When AI confidently makes something up, it\'s called a hallucination.'],
    ['Why can chatbots sound totally sure even when they\'re wrong?', 'They pick likely-sounding words, not checked facts', ['They are lying on purpose', 'They are always right', 'Their batteries are low'], 'Chatbots predict what words usually come next. Sounding right isn\'t the same as being right.'],
    ['A chatbot tells you a surprising "fact". Best move?', 'Check it with a trusted source', ['Believe it right away', 'Share it with everyone', 'Ask the same chatbot if it\'s sure'], 'Check books, trusted websites, or ask a teacher.'],
    ['How did chatbots learn to write?', 'By reading huge amounts of text and finding patterns', ['A teacher typed every answer', 'They went to school', 'They were born knowing'], 'They studied patterns in billions of sentences.'],
    ['A chatbot is mostly predicting...', 'The next word', ['The weather', 'Your password', 'Lottery numbers'], 'One word at a time, it guesses what comes next.'],
  ],
  prompt: [
    ['You want to understand photosynthesis. Which prompt is best?', 'Explain photosynthesis to a 6th grader in 3 short steps with an example.', ['photosynthesis', 'Write my science report on photosynthesis.', 'Tell me stuff.'], 'It says who you are, what you want, and how you want it.'],
    ['You have a math test Friday. Which prompt is best?', 'Give me 5 practice problems on dividing fractions, one at a time, and tell me if I\'m right.', ['math', 'Give me the answers to my worksheet.', 'Is math hard?'], 'It turns the AI into a coach that quizzes you.'],
    ['You need a name for your obstacle course game. Which prompt is best?', 'Give me 10 fun names for an obstacle course game with a lava and space theme.', ['name', 'Name my game.', 'What is a game?'], 'Details (lava, space, 10 names) get you better answers.'],
    ['What are the 4 parts of a strong prompt in this game?', 'Role, Task, Details, Format', ['Hello, Please, Thanks, Bye', 'Short, Shorter, Shortest, Done', 'Bold, Italic, Big, Small'], 'Role (who the AI should be), Task (what to do), Details, and Format.'],
    ['The AI\'s answer was way too long. Best next message?', 'Make that shorter: 3 bullet points.', ['Ugh, wrong.', 'Start a totally new topic', 'Type the same thing again'], 'You can steer the AI with follow-ups. Be specific about what to change.'],
    ['Which is a good way to use AI for homework?', 'Ask it to explain a step you\'re stuck on', ['Copy its answer', 'Have it write the whole thing', 'Never check its work'], 'Use AI to learn, not to skip learning. Follow your class rules too.'],
    ['You want feedback on your story. Which prompt is best?', 'I\'m 11 and wrote this story. Tell me 2 things that work and 1 thing to improve.', ['Fix it.', 'Rewrite my story so it\'s good.', 'story'], 'Asking for specific feedback keeps the story yours and helps you improve.'],
  ],
  check: [
    ['Botley says: "There are 366 days in a leap year." True or false?', 'True', ['False'], 'Leap years add February 29, so 366 days. Botley got this one right.'],
    ['Botley says: "A triangle has 4 sides." True or false?', 'False', ['True'], 'Triangles have 3 sides. "Tri" means three.'],
    ['Botley says: "Spiders are insects." True or false?', 'False', ['True'], 'Spiders have 8 legs, so they\'re arachnids, not insects (6 legs).'],
    ['Botley says: "1 kilometer is 1,000 meters." True or false?', 'True', ['False'], '"Kilo" means 1,000. Botley is right.'],
    ['Botley says: "The Moon is bigger than Earth." True or false?', 'False', ['True'], 'Earth is about 4 times wider than the Moon.'],
    ['Botley says: "Lua tables start counting at 1." True or false?', 'True', ['False'], 'Right! In Lua, the first item is items[1].'],
    ['Botley says: "Lightning never strikes the same place twice." True or false?', 'False', ['True'], 'That\'s a myth! Tall buildings get hit many times a year.'],
    ['Botley says this code prints 1 to 5:<pre class="codeq">' + 'for i = 1, 4 do\n  print(i)\nend' + '</pre>Is Botley right?', 'No, it stops at 4', ['Yes, it prints 1 to 5', 'It prints nothing'], 'The loop stops at 4. To reach 5, change it to <code>for i = 1, 5</code>.'],
    ['Botley says this code <b>adds</b> 10 coins:<pre class="codeq">player.coins = 10</pre>Is Botley right?', 'No, it sets coins to exactly 10', ['Yes, it adds 10', 'It deletes the coins'], 'To add, you need <code>player.coins = player.coins + 10</code>.'],
    ['Botley says this prints "Win":<pre class="codeq">local s = 50\nif s > 50 then\n  print("Win")\nelse\n  print("Lose")\nend</pre>Is Botley right?', 'No, it prints Lose', ['Yes, it prints Win', 'It prints both'], '50 > 50 is false (50 is not MORE than 50), so the else runs.'],
  ],
  safe: [
    ['A chatbot asks for your home address to "send you a prize". What do you do?', 'Don\'t share it, and tell a trusted adult', ['Share it, prizes are cool', 'Share only your street', 'Share your school instead'], 'Never share where you live. Real prizes don\'t need that from a chatbot.'],
    ['Which is OK to share with an AI chatbot?', 'Your favorite video game', ['Your password', 'Your full name and school', 'Your home address'], 'Hobbies are fine. Personal info that identifies you is not.'],
    ['You need to write a book report. Best use of AI?', 'Ask for tips to organize your ideas, then write it yourself', ['Have AI write it and turn it in', 'Copy a report from AI and change one word', 'Ask AI to pretend to be you'], 'Using AI to learn is great. Turning in AI\'s work as yours isn\'t honest.'],
    ['You see a video of a famous person saying something wild. What should you think?', 'It might be AI-made. Check trusted news first', ['It must be real, it\'s a video', 'Share it right away', 'Videos can\'t be faked'], 'AI can make fake videos and voices, called deepfakes. Be a detective.'],
    ['An AI image generator always draws "a scientist" as the same kind of person. That\'s an example of...', 'Bias from its training data', ['A fair result', 'A computer virus', 'A great feature'], 'Scientists are every kind of person. The AI learned a lopsided pattern.'],
    ['Someone makes an AI-edited embarrassing picture of a classmate. What\'s right?', 'Don\'t share it, and tell an adult', ['Share it, it\'s just a joke', 'Make another one', 'Post it but delete it later'], 'Fake pictures can really hurt people. Don\'t spread them.'],
    ['You used AI to help with an assignment. Should you tell your teacher?', 'Yes, be honest and follow class rules', ['No, keep it secret', 'Only if they ask twice', 'Blame the AI'], 'Honesty about how you used AI builds trust.'],
    ['A chatbot says something that makes you feel scared or uncomfortable. You should...', 'Stop and tell a trusted adult', ['Keep chatting', 'Keep it a secret', 'Argue with it all night'], 'You can always close the app and talk to someone you trust.'],
    ['Before using a new AI app, you should...', 'Check with a parent and its age rules', ['Just sign up', 'Use your parent\'s password', 'Make a fake birthday'], 'Lots of AI apps have age rules. A grown-up can help you pick safe ones.'],
    ['An AI says you\'re wrong about something you\'re sure about. What do you do?', 'Check a trusted source. AI can be wrong too', ['Always believe the AI', 'Always believe yourself', 'Give up'], 'Neither you nor the AI is always right. Check the facts!'],
  ],
};

// Next-word predictions: a peek at how chatbots pick words
const NEXT = [
  ['Once upon a', [['time', 92], ['hill', 3], ['dragon', 2], ['banana', 1]]],
  ['Peanut butter and', [['jelly', 85], ['toast', 6], ['honey', 5], ['socks', 1]]],
  ['Thank you very', [['much', 95], ['nice', 2], ['fast', 1], ['purple', 1]]],
  ['Happy birth', [['day', 97], ['cake', 1], ['stone', 1], ['ninja', 1]]],
  ['I scored a', [['goal', 48], ['point', 22], ['touchdown', 15], ['pizza', 1]]],
  ['Press the jump', [['button', 80], ['key', 12], ['rope', 4], ['cloud', 1]]],
  ['Let\'s play a', [['game', 75], ['song', 10], ['trick', 8], ['sandwich', 1]]],
  ['The sky is', [['blue', 70], ['clear', 12], ['falling', 3], ['spicy', 1]]],
  ['Brush your', [['teeth', 88], ['hair', 10], ['dog', 1], ['homework', 1]]],
];
function nextWordQ() {
  const [start, words] = pick(NEXT);
  const bars = `<div class="probs">${words.map(([w, p]) => `<div><span>${w}</span><i style="width:${Math.max(2, p)}%"></i><b>${p}%</b></div>`).join('')}</div>`;
  return choice(`A chatbot is finishing this sentence:<div class="nw">"${start} ___"</div>Which word will it <b>most likely</b> pick?`, words[0][0], words.slice(1).map(w => w[0]), `${bars}The AI picks words based on what usually came next in all the text it learned from. "${words[0][0]}" shows up most often after "${start}".`, 'Which word do YOU hear most after those words?');
}

// "Check Botley's work": AI answers math, you catch the mistakes
function checkBotQ() {
  if (R(0, 2) === 0) return mc(pick(AI_BANK.check));
  let q; do { q = pick(MATH.filter(l => ['neg', 'pow', 'pct', 'ratio', 'expr', 'eq', 'gcf'].includes(l.id))).gen(); } while (q.kind !== 'num' || q.frac || /<svg|chips/.test(q.q));
  const v = q.value, f = x => n2(r4(x));
  const wrongish = () => { let w; do { w = v + pick([1, -1, 2, -2, 10, -10, v || 5, -2 * v || 3]); } while (w === v); return w; };
  const claim = R(0, 1) ? v : wrongish();
  const right = claim === v ? '✅ Botley is right' : `❌ Wrong. It's ${f(v)}`;
  const others = claim === v ? [`❌ Wrong. It's ${f(wrongish())}`, `❌ Wrong. It's ${f(wrongish())}`] : ['✅ Botley is right', `❌ Wrong. It's ${f(wrongish())}`];
  return choice(`<div class="botq">${q.q.replace(/^Solve it\./, '')}</div><div class="bubble"><b>🤖 Botley:</b> The answer is <b>${f(claim)}</b>.</div>Is Botley right?`, right, others, `The real answer is <b>${f(v)}</b>. ${q.why}${claim === v ? '' : ' AI can get math wrong, especially with several steps. Always check!'}`, 'Do the problem yourself first. Then compare.');
}

// ─── Lab: Train the Bot (learning from data, and how bias sneaks in) ───
function trainLab(el, done) {
  const COL = { red: '#FF5A5F', blue: '#4D8CFF' }, EYES = ['big', 'one', 'three'], MOUTH = ['smile', 'grin', 'o', 'fangs'];
  const mk = (color, size, spikes) => ({ color, size, spikes, eyes: pick(EYES), mouth: pick(MOUTH) });
  const truth = c => (c.spikes === 'spiky' ? 'danger' : 'friendly');
  const drawC = c => `<div class="crit ${c.size}">${creature({ color: COL[c.color], acc: c.spikes === 'spiky' ? 'spikes' : '', eyes: c.eyes, mouth: c.mouth })}</div>`;
  const FEAT = [['color', ['red', 'blue']], ['size', ['big', 'small']], ['spikes', ['spiky', 'smooth']]];
  function learn(data) { let best = null; FEAT.forEach(([f, vals]) => vals.forEach(v => { const acc = data.filter(d => (d.c[f] === v ? 'danger' : 'friendly') === d.label).length; if (!best || acc > best.acc) best = { f, v, acc }; })); return best; }
  const predict = (rule, c) => (c[rule.f] === rule.v ? 'danger' : 'friendly');
  const brain = rule => `<div class="brain"><b>🤖 What the bot learned:</b> "If it's <b>${rule.v.toUpperCase()}</b>, it's dangerous."</div>`;
  const tag = l => (l === 'danger' ? '<span class="tag dz">⚠️ Danger</span>' : '<span class="tag fr">💚 Friendly</span>');
  let stars = 0, stage = 1;

  // Stage 1: you label, the bot learns
  const train = shuffle([['red', 'big', 'spiky'], ['red', 'small', 'spiky'], ['blue', 'big', 'spiky'], ['blue', 'small', 'spiky'], ['red', 'big', 'smooth'], ['red', 'small', 'smooth'], ['blue', 'big', 'smooth'], ['blue', 'small', 'smooth']]).map(a => mk(...a));
  const labels = {}; let tries1 = 0;
  function s1() {
    el.innerHTML = `<div class="lab"><p class="eyebrow">Step 1 of 3 · You are the teacher</p><h3>Teach the bot which creatures are dangerous</h3><div class="rulecard">📜 The rule in this world: creatures <b>with spikes</b> are dangerous. All others are friendly.</div><p>Label all 8 creatures. The bot will study your labels and try to figure out the rule by itself.</p>
    <div class="critgrid">${train.map((c, i) => `<div class="critcard ${labels[i] || ''}">${drawC(c)}<div class="lbtn"><button data-i="${i}" data-l="danger" class="${labels[i] === 'danger' ? 'on' : ''}">⚠️ Danger</button><button data-i="${i}" data-l="friendly" class="${labels[i] === 'friendly' ? 'on' : ''}">💚 Friendly</button></div></div>`).join('')}</div>
    <div class="row center"><button class="btn green go" ${Object.keys(labels).length < 8 ? 'disabled' : ''}>Train the bot!</button></div><div class="labout"></div></div>`;
    el.querySelectorAll('.lbtn button').forEach(b => b.onclick = () => { labels[b.dataset.i] = b.dataset.l; Sfx.tap(); s1(); });
    el.querySelector('.go').onclick = () => {
      tries1++;
      const rule = learn(train.map((c, i) => ({ c, label: labels[i] })));
      const test = Array.from({ length: 6 }, () => mk(pick(['red', 'blue']), pick(['big', 'small']), pick(['spiky', 'smooth'])));
      if (!test.some(c => c.spikes === 'spiky')) test[0].spikes = 'spiky'; if (!test.some(c => c.spikes === 'smooth')) test[1].spikes = 'smooth';
      const ok = test.filter(c => predict(rule, c) === truth(c)).length;
      const pass = ok >= 5;
      el.querySelector('.labout').innerHTML = `${brain(rule)}<p><b>Now the bot is tested on 6 creatures it has never seen:</b></p><div class="critgrid small">${test.map(c => `<div class="critcard ${predict(rule, c) === truth(c) ? 'ok' : 'bad'}">${drawC(c)}${tag(predict(rule, c))}<b class="mark">${predict(rule, c) === truth(c) ? '✓' : '✗'}</b></div>`).join('')}</div>
      <p class="big ${pass ? 'good' : 'bad'}">The bot got <b>${ok} out of 6</b> right.</p><p>${pass ? 'Your labels taught it the real rule. That\'s machine learning: it found the pattern from examples, all by itself.' : 'Some of your labels were wrong, so the bot learned the wrong pattern. Check each creature for spikes and train again!'}</p>
      ${pass ? '<div class="row center"><button class="btn next">Next step</button></div>' : ''}`;
      if (pass) { if (tries1 === 1) stars++; Sfx.good(); el.querySelector('.next').onclick = () => { stage = 2; s2(); }; } else Sfx.bad();
      el.querySelector('.labout').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }
  // Stage 2: someone else's lopsided data
  const biased = [mk('red', 'big', 'spiky'), mk('red', 'big', 'spiky'), mk('red', 'big', 'spiky'), mk('blue', 'small', 'smooth'), mk('blue', 'small', 'smooth'), mk('blue', 'small', 'smooth')].map(c => ({ c, label: truth(c) }));
  function s2() {
    const rule = learn(biased), test = [mk('blue', 'small', 'spiky'), mk('red', 'big', 'smooth'), mk('red', 'small', 'spiky'), mk('blue', 'big', 'smooth')];
    let tries = 0;
    el.innerHTML = `<div class="lab"><p class="eyebrow">Step 2 of 3 · Something's wrong</p><h3>A new bot learned from someone else's data</h3><p>Here's all the training data it saw. Every label is correct!</p><div class="critgrid small">${biased.map(d => `<div class="critcard">${drawC(d.c)}${tag(d.label)}</div>`).join('')}</div>${brain(rule)}
    <p><b>Test time:</b></p><div class="critgrid small">${test.map(c => `<div class="critcard ${predict(rule, c) === truth(c) ? 'ok' : 'bad'}">${drawC(c)}${tag(predict(rule, c))}<b class="mark">${predict(rule, c) === truth(c) ? '✓' : '✗'}</b></div>`).join('')}</div>
    <p class="big bad">It got 2 wrong, even though every label was right. Why?</p><div class="choices col">${shuffle(['All the dangerous ones it saw were red, so it learned "red = danger"', 'The bot is broken', 'Blue creatures are always friendly', 'It needed a faster computer']).map(t => `<button class="choice">${t}</button>`).join('')}</div><div class="labout"></div></div>`;
    el.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      tries++; const right = b.textContent.startsWith('All the dangerous');
      b.classList.add(right ? 'right' : 'wrong');
      if (right) { if (tries === 1) stars++; Sfx.good(); el.querySelectorAll('.choice').forEach(x => (x.disabled = true));
        el.querySelector('.labout').innerHTML = `<p>Exactly. Every dangerous creature in its data was <b>red</b> AND <b>big</b> AND <b>spiky</b>, so the bot couldn't tell which one really mattered. It guessed color. This is called <b>bias</b>. It happens to real AI too, like face-unlock that works worse on faces it rarely saw.</p><div class="row center"><button class="btn next">Fix it!</button></div>`;
        el.querySelector('.next').onclick = () => { stage = 3; s3(); }; }
      else { Sfx.bad(); b.disabled = true; }
    });
  }
  // Stage 3: fix the bias with better data
  function s3() {
    const opts = [['blue', 'small', 'spiky'], ['red', 'big', 'smooth'], ['red', 'big', 'spiky'], ['blue', 'small', 'smooth']].map(a => { const c = mk(...a); return { c, label: truth(c) }; });
    const sel = new Set(); let tries = 0;
    const drawS3 = () => {
      el.innerHTML = `<div class="lab"><p class="eyebrow">Step 3 of 3 · Fix the bias</p><h3>Pick 2 new examples to add to the training data</h3><p>Choose the ones that will teach the bot that <b>spikes</b> matter, not color.</p>
      <div class="critgrid">${opts.map((o, i) => `<button class="critcard pickable ${sel.has(i) ? 'picked' : ''}" data-i="${i}">${drawC(o.c)}${tag(o.label)}</button>`).join('')}</div>
      <div class="row center"><button class="btn green go" ${sel.size !== 2 ? 'disabled' : ''}>Retrain the bot</button></div><div class="labout"></div></div>`;
      el.querySelectorAll('.pickable').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (sel.has(i)) sel.delete(i); else if (sel.size < 2) sel.add(i); Sfx.tap(); drawS3(); });
      el.querySelector('.go').onclick = () => {
        tries++; const rule = learn([...biased, ...[...sel].map(i => opts[i])]), win = rule.f === 'spikes';
        el.querySelector('.labout').innerHTML = brain(rule) + (win ? `<p class="big good">Fixed! Now the bot knows spikes are what matter.</p><p>Adding examples that <b>break</b> the misleading pattern (a blue spiky one, or a red smooth one) taught it the real rule. Real AI teams do exactly this: they collect more <b>diverse</b> data.</p><div class="row center"><button class="btn next">Finish lab</button></div>` : `<p class="big bad">Still biased.</p><p>Those examples look just like the old data (red and spiky, or blue and smooth). Pick examples that break the pattern!</p>`);
        if (win) { if (tries === 1) stars++; Sfx.good(); el.querySelector('.next').onclick = () => done(Math.max(1, stars)); } else { Sfx.bad(); sel.clear(); setTimeout(drawS3, 2600); }
      };
    };
    drawS3();
  }
  s1();
}

// ─── Lab: Prompt Builder ───
const MISSIONS = [
  { name: 'Math Coach', goal: 'You\'re stuck on dividing fractions. Get the AI to help you <b>learn</b> it, not just hand you answers.',
    slots: [['Role', [['You are a patient math coach for a 6th grader.', 2], ['You are a robot.', 1], ['(skip it)', 0, 'Telling the AI who to be helps it pitch the answer at your level.']]],
      ['Task', [['Explain how to divide fractions, step by step.', 2], ['Tell me about fractions.', 1, 'Too vague. Fractions is a huge topic.'], ['Solve all 20 problems on my worksheet.', 0, 'That gets answers, not learning. And it\'s probably against class rules.']]],
      ['Details', [['Use a pizza example, then give me 1 practice problem to try.', 2], ['Make it good.', 1, '"Good" doesn\'t tell the AI anything.'], ['Use the hardest words you know.', 0, 'That makes it harder to learn!']]],
      ['Format', [['Keep it to 3 short steps.', 2], ['(skip it)', 1], ['Write one giant paragraph.', 0, 'Giant paragraphs are hard to follow.']]]],
    resp: { great: 'Sure! Dividing fractions asks "how many fit?" 🍕\n1. KEEP the first number.\n2. CHANGE ÷ to ×.\n3. FLIP the second fraction, then multiply.\n\nPizza example: 3 pizzas ÷ 1/4 = 3 × 4 = 12 slices.\n\nYour turn: what is 2 ÷ 1/3?', ok: 'Fractions are parts of a whole. You can add, subtract, multiply and divide them. There are many rules for fractions, like finding common denominators, simplifying, and using reciprocals. Fractions are used in cooking, building, and lots of other places...', bad: 'Here are your answers: 1) 4  2) 6  3) 3/8  4) 12 ...\n\n(You got answers. But you didn\'t learn how. On the test, you\'re on your own!)' } },
  { name: 'Game Designer', goal: 'Get ideas for obstacles in an <b>obstacle course game</b> you want to build.',
    slots: [['Role', [['You are a game designer who helps kids build their first game.', 2], ['You are smart.', 1], ['(skip it)', 0, 'A role helps the AI think like an expert.']]],
      ['Task', [['Give me 5 ideas for obstacles in my obstacle course game.', 2], ['Give me ideas.', 1, 'Ideas for what? Be specific.'], ['Build the whole game for me.', 0, 'AI can\'t build your whole game, and then it wouldn\'t be yours!']]],
      ['Details', [['The theme is lava and space, and it should take about 5 minutes to beat.', 2], ['Make it cool.', 1, '"Cool" is a vibe, not a detail.'], ['My username is CoolKid2015 and I live on Oak Street.', 0, '⚠️ Never share your username or where you live with an AI or anyone online.', true]]],
      ['Format', [['Put them in a list with one sentence each.', 2], ['(skip it)', 1], ['Use as many words as possible.', 0, 'Long answers bury the good ideas.']]]],
    resp: { great: 'Lava + space obstacle ideas:\n1. Meteor Hop: jump across floating rocks while meteors fall.\n2. Lava Tide: the lava rises every 30 seconds.\n3. Zero-G Zone: low gravity makes jumps floaty and tricky.\n4. Laser Grid: time your run between moving lasers.\n5. Crumble Bridge: tiles drop a second after you step on them.', ok: 'Here are some ideas: jumping, obstacles, moving parts, maybe lava? You could add checkpoints too. Games are fun when they are challenging but not too hard. Good luck!', bad: 'I can\'t build a whole game for you, but I can help you plan one.\n\n(⚠️ Also: never share where you live or your real username online!)' } },
  { name: 'Bug Hunter', goal: 'Your loop prints 1 to 4, but you wanted 1 to 5. Get the AI to help you fix it <b>and</b> understand why.',
    slots: [['Role', [['You are a coding tutor who explains bugs simply.', 2], ['You are a computer.', 1], ['(skip it)', 0, 'A tutor role gets explanations, not just fixes.']]],
      ['Task', [['Help me find the bug and explain why it happens.', 2], ['Fix it.', 1, 'You\'ll get a fix, but you won\'t learn why.'], ['My code is broken lol', 0, 'The AI has no idea what code or what\'s broken.']]],
      ['Details', [['Here\'s my code: for i = 1, 4 do print(i) end. I want it to print 1 to 5.', 2], ['It\'s a loop in Lua.', 1, 'Paste the actual code so the AI can see it.'], ['Here\'s my Roblox password so you can log in and look.', 0, '⚠️ NEVER share a password with anyone, including AI.', true]]],
      ['Format', [['Show the fixed line, then explain in 2 sentences.', 2], ['(skip it)', 1], ['Explain it like a 500-page textbook.', 0, 'Way too much!']]]],
    resp: { great: 'Fixed line:\nfor i = 1, 5 do print(i) end\n\nThe second number in a for loop is where it stops, and Lua includes that number. Your loop stopped at 4, so change it to 5.', ok: 'Loops can have bugs for lots of reasons. Check the start and end numbers, your spelling, and whether you closed it with "end". It\'s hard to say more without seeing the code.', bad: 'I can\'t see your code, so I\'m only guessing.\n\n(⚠️ And NEVER share a password with anyone, including an AI!)' } },
];
function promptLab(el, done) {
  let mi = 0, firstTry = 0, tries = 0; const pickd = {};
  // Shuffle each row's options once, so the best answer isn't always first
  const orders = MISSIONS.map(m => m.slots.map(([, opts]) => shuffle(opts.map((_, i) => i))));
  function draw() {
    const m = MISSIONS[mi];
    el.innerHTML = `<div class="lab"><p class="eyebrow">Mission ${mi + 1} of ${MISSIONS.length} · ${m.name}</p><h3>Build a prompt</h3><div class="rulecard">🎯 ${m.goal}</div>
    ${m.slots.map(([name, opts], si) => `<div class="slot"><p class="slotname">${si + 1}. ${name}</p><div class="opts">${orders[mi][si].map(oi => `<button class="opt ${pickd[si] === oi ? 'on' : ''}" data-s="${si}" data-o="${oi}">${esc(opts[oi][0])}</button>`).join('')}</div></div>`).join('')}
    <div class="promptbox"><b>Your prompt:</b> <span>${m.slots.map(([, opts], si) => pickd[si] != null && !opts[pickd[si]][0].startsWith('(') ? esc(opts[pickd[si]][0]) : '').filter(Boolean).join(' ') || '<i>Pick one option in each row.</i>'}</span></div>
    <div class="row center"><button class="btn cyan send" ${Object.keys(pickd).length < 4 ? 'disabled' : ''}>Send to AI ➤</button></div><div class="labout"></div></div>`;
    el.querySelectorAll('.opt').forEach(b => b.onclick = () => { pickd[b.dataset.s] = +b.dataset.o; Sfx.tap(); draw(); });
    el.querySelector('.send').onclick = send;
  }
  function send() {
    const m = MISSIONS[mi]; tries++;
    const chosen = m.slots.map(([, opts], si) => opts[pickd[si]]);
    const score = chosen.reduce((s, o) => s + o[1], 0), unsafe = chosen.some(o => o[3]);
    const bucket = unsafe || score <= 3 ? 'bad' : score >= 7 ? 'great' : 'ok';
    const out = el.querySelector('.labout');
    out.innerHTML = `<div class="power"><span>Prompt power</span><div class="pbar"><i style="width:${score / 8 * 100}%" class="${bucket}"></i></div><b>${score}/8</b></div><div class="chat"><div class="chatme">${esc(chosen.filter(o => !o[0].startsWith('(')).map(o => o[0]).join(' '))}</div><div class="chatai"><b>🤖 AI</b><div class="typed"></div></div></div><div class="tips"></div>`;
    const typed = out.querySelector('.typed'), txt = m.resp[bucket]; let i = 0;
    const tick = () => { if (!el.isConnected) return; i = Math.min(txt.length, i + 3); typed.textContent = txt.slice(0, i); if (i < txt.length) setTimeout(tick, 12); else finish(); };
    tick(); out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    function finish() {
      const tips = chosen.map((o, si) => o[1] < 2 && o[2] ? `<li><b>${m.slots[si][0]}:</b> ${o[2]}</li>` : '').join('');
      if (bucket === 'great') {
        if (tries === 1) firstTry++; Sfx.good();
        out.querySelector('.tips').innerHTML = `<p class="big good">Strong prompt! That answer actually helps.</p>${tips ? `<ul class="tiplist">${tips}</ul>` : ''}<div class="row center"><button class="btn next">${mi < MISSIONS.length - 1 ? 'Next mission' : 'Finish lab'}</button></div>`;
        out.querySelector('.next').onclick = () => { mi++; tries = 0; Object.keys(pickd).forEach(k => delete pickd[k]); if (mi < MISSIONS.length) draw(); else done(Math.max(1, firstTry)); };
      } else { Sfx.bad(); out.querySelector('.tips').innerHTML = `<p class="big bad">${unsafe ? 'Safety alert!' : 'That answer isn\'t very helpful. Level up your prompt:'}</p><ul class="tiplist">${tips}</ul>`; }
    }
  }
  draw();
}

const AI = [
{ id: 'ai1', name: 'What Is AI?', title: 'AI vs. Regular Code', kind: 'quiz',
  boss: { name: 'Fakebot', look: { color: '#B9C4D6', eyes: 'robot', mouth: 'grin', acc: 'antenna' }, taunt: 'I\'m TOTALLY real AI. Definitely not a toaster with a sticker on it.' },
  lesson: [
    { t: 'So what IS AI?', html: `<p><b>AI</b> (artificial intelligence) is a computer that <b>learns patterns from examples</b> so it can make <b>guesses</b> about new things.</p><table class="rt words"><tr><th>Regular code</th><th>AI</th></tr><tr><td>A person writes every rule</td><td>It learns its own patterns from data</td></tr><tr><td>Same result every time</td><td>Makes predictions (usually good, not always)</td></tr><tr><td>Your Lua scripts</td><td>Face unlock, chatbots, video picks</td></tr></table>`, check: choice('Which one <b>learns from examples</b>?', 'AI', ['Regular code', 'A light switch'], 'AI learns patterns from data. Regular code follows rules a person wrote.', 'Which one finds its own patterns?') },
    { t: 'The 5 big ideas', html: `<ol class="five"><li><b>Perception:</b> AI senses the world with cameras, mics and sensors.</li><li><b>Representation:</b> it stores what it knows as numbers and patterns.</li><li><b>Learning:</b> it learns from lots of examples (data).</li><li><b>Interaction:</b> it can talk and listen, like a chatbot.</li><li><b>Impact:</b> it changes people's lives, for good and bad. That's why we use it wisely.</li></ol>`, check: choice('A self-driving car uses cameras to see the road. Which big idea is that?', 'Perception', ['Impact', 'Interaction'], 'Seeing the world with sensors is perception.', 'Cameras are sensors.') },
    { t: 'AI is already everywhere', html: `<p>You probably use AI every day: video recommendations, face unlock, voice assistants, auto-captions, photo search, and chatbots like ChatGPT, Claude and Gemini.</p><p>Some things that seem smart are NOT AI. A game boss with the same attack pattern every time is just a script!</p>` },
  ],
  gen: bankGen(AI_BANK.what, mc) },

{ id: 'ai2', name: 'Robot Brain', title: 'How AI Learns', kind: 'lab', lab: trainLab,
  boss: { name: 'Biasaurus', look: { color: '#FF8A3D', eyes: 'one', mouth: 'teeth', acc: 'spikes', spots: true }, taunt: 'I only learned from half the data. I\'m ALWAYS sure. And often WRONG. RAWR!' },
  lesson: [
    { t: 'Learning from examples', html: `<p>How do you teach a computer what a dog looks like? You don't write rules like "has 4 legs" (so do cats!). Instead you show it <b>thousands of labeled pictures</b>: dog, not dog, dog, dog...</p><p>The AI finds the pattern by itself. That's <b>machine learning</b>.</p><p class="eq">Training data → 🤖 Model → Prediction</p>` },
    { t: 'Garbage in, garbage out', html: `<ul><li>If the labels are wrong, the AI learns the wrong thing.</li><li>If the data is <b>lopsided</b> (say, only orange cats), the AI gets confused by things it rarely saw. That's called <b>bias</b>.</li><li>The fix: more examples, more <b>variety</b>, and testing on new examples.</li></ul><p>In the lab, you'll train a real (tiny) learning bot and see this happen.</p>`, check: choice('An AI learned to spot apples only from red apples. It sees a green apple. What might happen?', 'It might say "not an apple"', ['It will definitely know', 'It turns the apple red'], 'It never saw green apples, so it may not recognize them. Lopsided data → bias.', 'What did its training data look like?') },
  ],
  gen: bankGen(AI_BANK.learn, mc) },

{ id: 'ai3', name: 'Chatbot Secrets', title: 'How Chatbots Talk', kind: 'quiz',
  boss: { name: 'Babble Bot', look: { color: '#A070FF', eyes: 'three', mouth: 'grin', acc: 'antenna' }, taunt: 'Blah blah blah, I sound SO smart, blah blah... wait what was the question?' },
  lesson: [
    { t: 'Next-word guessing machines', html: `<p>Chatbots (also called <b>LLMs</b>, large language models) read a massive amount of text. They learned which words usually come <b>next</b>.</p><p>When you ask something, the chatbot writes its answer <b>one word at a time</b>, each time picking a likely next word. Try it:</p>`,
      widget(el) { const [start, words] = pick(NEXT.slice(0, 6)); let txt = start; const draw = () => { el.innerHTML = `<div class="nw">"${txt} ___"</div><div class="probs">${words.map(([w, p]) => `<div><span>${w}</span><i style="width:${p}%"></i><b>${p}%</b></div>`).join('')}</div><div class="row"><button class="btn small cyan roll">🎲 Let the AI pick</button></div><p class="note">Click a few times. It usually picks the likely word, but not always. That randomness makes it creative, and sometimes wrong!</p>`; el.querySelector('.roll').onclick = () => { let r = Math.random() * words.reduce((s, w) => s + w[1], 0), w = words[0][0]; for (const [x, p] of words) { r -= p; if (r <= 0) { w = x; break; } } txt = start + ' <b>' + w + '</b>'; Sfx.tap(); draw(); }; }; draw(); } },
    { t: 'Hallucinations', html: `<p>Because chatbots pick <b>likely-sounding</b> words, they can say things that sound totally confident but are <b>made up</b>. This is called a <b>hallucination</b>.</p><p>They might invent a book, a fact, a quote, or a website. They don't do it on purpose. They just predict words; they don't check facts.</p><p><b>Rule:</b> for anything important, double-check with a trusted source.</p>`, check: choice('A chatbot confidently gives you a quote from a famous person. You can\'t find it anywhere. What probably happened?', 'The chatbot hallucinated it', ['The quote is secret', 'The internet is broken'], 'Chatbots can make up quotes that sound real. Always verify.', 'Chatbots predict words. They don\'t look things up unless they say so.') },
  ],
  gen: () => (R(0, 2) ? nextWordQ() : mc(pick(AI_BANK.talk))) },

{ id: 'ai4', name: 'Prompt Power', title: 'Talking to AI', kind: 'lab', lab: promptLab,
  boss: { name: 'Vague-O', look: { color: '#9FE3FF', eyes: 'sleepy', mouth: 'flat', acc: 'horns' }, taunt: 'Do... the thing. You know. With the stuff. ...Why are my answers so bad?' },
  lesson: [
    { t: 'What\'s a prompt?', html: `<p>A <b>prompt</b> is what you type to an AI. Better prompt = better answer. Vague prompts get vague answers.</p><table class="rt words"><tr><td>😴 Weak</td><td>"fractions"</td></tr><tr><td>💪 Strong</td><td>"You're a math coach. Explain dividing fractions to a 6th grader in 3 short steps with a pizza example."</td></tr></table>` },
    { t: 'The 4-part recipe', html: `<ol class="five"><li><b>Role:</b> who should the AI be? ("You are a coding tutor")</li><li><b>Task:</b> what exactly do you want? ("Find the bug and explain why")</li><li><b>Details:</b> what does it need to know? (paste the code, your age, the theme)</li><li><b>Format:</b> how should it look? ("3 bullet points", "a short list")</li></ol><p>Then <b>follow up</b>: "shorter", "give me an example", "quiz me".</p>`, check: choice('Which part is missing from: <i>"You are a chef. Give me a recipe."</i>', 'Details (what kind of food, how many people)', ['Role', 'Task'], 'It has a role (chef) and a task (recipe) but no details about what you want.', 'Check: Role? Task? Details? Format?') },
    { t: 'AI as a coach, not a cheat code', html: `<p>The best way to use AI is to <b>learn faster</b>, not to skip learning:</p><ul><li>✅ "Explain this step I'm stuck on"</li><li>✅ "Quiz me on this"</li><li>✅ "Give me feedback on my story"</li><li>❌ "Do my homework"</li></ul><p>And never put private info in a prompt: passwords, address, full name, school.</p>` },
  ],
  gen: bankGen(AI_BANK.prompt, mc) },

{ id: 'ai5', name: 'Fact Checker', title: 'Catch AI Mistakes', kind: 'quiz',
  boss: { name: 'Hallucinator', look: { color: '#FF6BD5', eyes: 'one', mouth: 'grin', acc: 'wings' }, taunt: 'Fun fact: 2 + 2 = 5! Also, the Moon is made of cheese! Trust me, I\'m an AI!' },
  lesson: [
    { t: 'You\'re the boss', html: `<p>Think of AI like a super-fast intern. It's helpful, but it makes mistakes. <b>You</b> are the boss who checks the work.</p><p>AI is especially shaky with: math that takes several steps, very recent news, exact facts and numbers, and code it hasn't tested.</p>` },
    { t: 'How to check', html: `<ol class="five"><li><b>Estimate:</b> does the answer make sense? (25% of 80 can't be 200!)</li><li><b>Redo it:</b> work the problem yourself.</li><li><b>Test it:</b> run the code and see what happens.</li><li><b>Look it up:</b> check a trusted source like a textbook or encyclopedia.</li></ol><p>In this level, Botley the AI answers questions. Some answers are right. Some are wrong. Catch them!</p>`, check: choice('Botley says 50% of 30 is 60. Without doing exact math, what do you notice?', 'Wrong! Half of 30 has to be less than 30', ['Seems right', 'Can\'t tell without a computer'], '50% means half, so it must be smaller than 30. It\'s 15.', 'Estimate first. Is half of something bigger than it?') },
  ],
  gen: checkBotQ },

{ id: 'ai6', name: 'Safe & Smart', title: 'AI Safety & Ethics', kind: 'quiz',
  boss: { name: 'Data Snatcher', look: { color: '#3E4380', eyes: 'angry', mouth: 'fangs', acc: 'ears' }, taunt: 'What\'s your password? Your address? Your school? Just tell me, I\'m friendly! Heh heh.' },
  lesson: [
    { t: 'Guard your info', html: `<p>Anything you type into an AI might be saved or seen by others. <b>Never share:</b></p><ul><li>Passwords</li><li>Your home address or phone number</li><li>Your full name + school together</li><li>Photos of yourself or friends</li></ul><p>Talking about your favorite game or asking for help with a topic is totally fine.</p>` },
    { t: 'Fakes and fairness', html: `<ul><li>AI can make <b>fake</b> pictures, videos and voices (deepfakes). If something seems wild, check trusted news before believing or sharing it.</li><li>AI can be <b>biased</b> because of its training data. Notice when it treats people unfairly.</li><li>Never use AI to make fake or mean content about real people.</li></ul>` },
    { t: 'Honest and safe', html: `<ul><li>Follow your school's rules about AI, and say when you used it.</li><li>Check with a parent before trying new AI apps. Many have age rules.</li><li>If an AI says something that makes you uncomfortable, close it and <b>tell a trusted adult</b>.</li></ul>`, check: choice('Which is OK to type into a chatbot?', '"What are some good strategies for obstacle course games?"', ['"My password is..."', '"I live at 42 Pine Street"'], 'Asking about a topic is safe. Passwords and addresses are never safe to share.', 'Would you tell a stranger this?') },
  ],
  gen: bankGen(AI_BANK.safe, mc) },
];
AI.forEach(l => (l.world = 'ai'));

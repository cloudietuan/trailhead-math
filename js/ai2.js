// AI Academy, part 2: how AI works on the inside, and how to actually use it well.
// Still no real chatbot. Everything here is pre-written or simulated on the device.

const AI_BANK2 = {
  tokens: [
    ['What is a <b>token</b>?', 'A small chunk of text, like a word or part of a word', ['A coin you pay the AI', 'A password', 'A whole book'], 'Chatbots chop text into tokens. Short words are one token. Long words get split into pieces.'],
    ['Why might a chatbot split "unbelievable" into pieces like "un", "believ", "able"?', 'It handles rare or long words by using smaller chunks it already knows', ['It can\'t read', 'It is broken', 'To save battery'], 'With a few thousand chunks, it can build almost any word, even ones it never saw.'],
    ['What is the <b>context window</b>?', 'The amount of text the AI can "see" at one time', ['The screen you type on', 'A window in the data center', 'The AI\'s long-term memory'], 'The AI only works with what fits in its window: your chat so far, plus anything you pasted.'],
    ['You chat with an AI for hours and it "forgets" something from the start. Why?', 'The early messages no longer fit in its context window', ['It got bored', 'It is punishing you', 'Its battery ran low'], 'Old text can fall out of the window. Remind it of the key details.'],
    ['A chatbot has never heard of your school\'s new mascot. What is the best fix?', 'Put the facts about the mascot in your prompt', ['Ask the same question louder', 'Wait a few minutes', 'Type in ALL CAPS'], 'If the info is in the context window, the AI can use it. It can\'t use what it never saw.'],
    ['Does a chatbot remember what you told it in a brand new chat (with no memory feature)?', 'No, each new chat starts fresh', ['Yes, forever', 'Only on weekends', 'Only your name'], 'Without a memory feature, a new chat has an empty context window.'],
    ['Before reading your message, a chatbot turns each token into...', 'Numbers', ['Pictures', 'Sounds', 'Emojis'], 'Computers only do math. Tokens become lists of numbers so the model can calculate with them.'],
    ['Words with similar meanings (like "happy" and "glad") get number lists that are...', 'Close together', ['Exactly opposite', 'Totally random', 'Always zero'], 'These number lists are called embeddings. Similar meaning → nearby numbers. That\'s how AI "gets" meaning.'],
    ['More text in your prompt means the AI has to process...', 'More tokens', ['Fewer tokens', 'Zero tokens', 'Only the first word'], 'Every chunk counts. Long prompts and long answers use more tokens.'],
    ['Which sentence probably uses the <b>most</b> tokens?', 'A full paragraph about dinosaurs', ['"Hi"', '"OK thanks"', '"Yes"'], 'More text, more tokens.'],
  ],
  neural: [
    ['What is a <b>neural network</b> made of?', 'Layers of tiny math units (neurons) connected together', ['Real brain cells', 'Tiny robots', 'Lots of if-statements a person wrote'], 'Each neuron does simple math. Stack millions of them in layers and patterns appear.'],
    ['What is a <b>weight</b> in a neural network?', 'A number that says how much one input matters', ['How heavy the computer is', 'The size of the file', 'A kind of password'], 'Big weight = "pay attention to this." Small or negative weight = "ignore this" or "this counts against."'],
    ['When an AI "learns," what actually changes?', 'The weights (millions of numbers) get adjusted', ['A person rewrites the rules', 'It grows new wires', 'Nothing changes'], 'Learning = nudging weights until the answers get better.'],
    ['One neuron adds up (input × weight) for each input. What happens next?', 'If the total is high enough, it "fires" and passes a signal on', ['It deletes the inputs', 'It asks a human', 'It restarts'], 'That simple rule, repeated across many layers, can recognize faces and write sentences.'],
    ['Why do neural networks need <b>many layers</b>?', 'Early layers find simple patterns, later layers combine them into complex ones', ['To look impressive', 'Each layer is a backup', 'Layers make it slower on purpose'], 'In image AI: edges → shapes → eyes and ears → "that\'s a cat."'],
    ['A big modern chatbot has about how many weights?', 'Billions', ['About 10', 'About 500', 'Exactly 1'], 'Billions of numbers, all tuned during training. Nobody set them by hand.'],
    ['Can engineers easily look at one weight and know what it "means"?', 'No, the knowledge is spread across millions of weights', ['Yes, each one has a label', 'Yes, they are all the same', 'Weights are not real'], 'That\'s why AI can be hard to explain, even for the people who built it.'],
    ['Is a neural network the same as a human brain?', 'No, it\'s math loosely inspired by brains', ['Yes, exactly', 'Yes, but smaller', 'It\'s a real brain in a jar'], 'It borrows the idea of connected neurons, but it\'s all multiplication and addition.'],
    ['In our neuron lab, a weight of <b>0</b> on an input means...', 'That input is ignored', ['That input always wins', 'The neuron explodes', 'The input is doubled'], 'Anything times 0 is 0, so it adds nothing to the total.'],
  ],
  train: [
    ['Training an AI is a loop. What is the right order?', 'Guess → check the error → adjust the weights → repeat', ['Adjust → sleep → guess', 'Check → delete → stop', 'Guess once, then done'], 'It repeats that loop millions of times, getting a tiny bit better each round.'],
    ['What is <b>loss</b> (or error) in training?', 'A number for how wrong the AI\'s guess was', ['The AI getting lost', 'Money the company lost', 'A deleted file'], 'High loss = very wrong. Training tries to push the loss down.'],
    ['If the "learning rate" is way too big, what happens?', 'The AI overshoots and bounces around instead of settling', ['It learns perfectly, faster', 'Nothing', 'It turns off'], 'Like taking giant leaps down a hill: you jump right over the bottom.'],
    ['An AI memorized its training examples perfectly but fails on new ones. This is called...', 'Overfitting', ['Overheating', 'Underpaying', 'Hallucinating'], 'It memorized instead of learning the real pattern. Like memorizing answers instead of learning the math.'],
    ['How do you check whether an AI really learned (not just memorized)?', 'Test it on examples it has never seen', ['Test it on the training examples again', 'Ask it if it learned', 'Check its file size'], 'New examples are the real test. Same for you with a boss fight!'],
    ['<b>Training</b> vs <b>using</b> an AI: which one changes the weights?', 'Training', ['Using it (chatting)', 'Both, always', 'Neither'], 'When you chat, the weights are frozen. The model isn\'t learning from your chat in that moment.'],
    ['Why does training a big AI take huge data centers?', 'Billions of weights get adjusted over and over on enormous amounts of data', ['The AI is physically giant', 'It needs air conditioning to think', 'Because of the screens'], 'It\'s a staggering amount of math, so it takes thousands of powerful chips.'],
    ['A chatbot\'s training data ended last year. You ask about news from this week. What should you expect?', 'It may not know, unless it can search the web', ['It always knows everything', 'It will refuse to talk', 'It reads your mind'], 'This is called a knowledge cutoff. Some AIs can use a search tool to look things up.'],
    ['Training data came from the internet, which has mistakes and unfair ideas in it. So AI can...', 'Repeat those mistakes and biases', ['Never be wrong', 'Only say nice things', 'Delete the internet'], 'It learns patterns from people, including our errors. That\'s why we check its work.'],
  ],
  promptpro: [
    ['Which prompt will get the best help?', '"Act as a patient math tutor. I\'m in 7th grade. Explain slope with a skateboard ramp example, in 4 short steps."', ['"slope"', '"explain math"', '"help"'], 'It gives a role, who you are, the task, an example style, and a format.'],
    ['Giving the AI a <b>role</b> ("act as a coach") helps because...', 'It sets the style and level of the answer', ['It makes the AI human', 'It unlocks secret features', 'It is required by law'], 'A role steers tone and focus. It doesn\'t change what the AI is.'],
    ['<b>Few-shot prompting</b> means...', 'Showing the AI a couple of examples of what you want', ['Asking only a few questions', 'Typing very fast', 'Using fewer words'], 'Examples are powerful. Show 2 jokes you like, and the AI matches the style.'],
    ['The AI\'s first answer is too long and confusing. What do pros do?', 'Follow up: "Shorter, and explain it like I\'m 12"', ['Give up', 'Start a new account', 'Copy it anyway'], 'Prompting is a conversation. Iterating is how you get great results.'],
    ['Adding "<b>think step by step and show your work</b>" to a math prompt usually...', 'Makes mistakes easier to spot and less likely', ['Makes the AI angry', 'Does nothing', 'Makes it slower on purpose'], 'When the steps are written out, both you and the AI can catch errors.'],
    ['You want a study guide. Which adds a clear <b>format</b>?', '"Give me 5 bullet points and then 3 practice questions"', ['"Make it good"', '"Do the thing"', '"You know what I want"'], 'Say exactly what shape the answer should take.'],
    ['You paste your whole essay and say "fix it." Better prompt?', '"Find 3 places where my argument is weak and tell me why. Don\'t rewrite it."', ['"Fix it more"', '"Make it perfect"', '"Write a new one for me"'], 'Specific asks get specific help, and you stay the author.'],
    ['What should you <b>never</b> put in a prompt?', 'Your password, home address or other private info', ['The topic', 'Your grade level', 'An example'], 'Great prompts need context about the task, not private details about you.'],
    ['You need ideas for a Roblox game. Best prompt?', '"Give me 10 obby ideas for 8 to 12 year olds, each with one unique twist"', ['"game"', '"roblox roblox roblox"', '"Make a game" '], 'A number, an audience and a constraint give you a list you can actually use.'],
    ['Telling the AI what you <b>already tried</b> helps because...', 'It won\'t repeat things that didn\'t work', ['It feels sorry for you', 'It makes the answer longer', 'It doesn\'t help'], 'Context about your situation = better-aimed help.'],
  ],
  sidekick: [
    ['You\'re stuck on a homework problem. Which use of AI helps you <b>learn</b> the most?', '"Give me a hint for the next step, not the answer"', ['"Just give me the answer"', '"Do all 20 problems"', '"Write it in my handwriting"'], 'Hints keep your brain doing the work. That\'s how the skill sticks.'],
    ['Your Lua script has an error. What should you give the AI?', 'The code, the exact error message, and what you expected to happen', ['Just the word "broken"', 'A screenshot of your desk', 'Nothing, it already knows'], 'Good bug reports get good fixes, from AI and from humans.'],
    ['The AI gives you fixed code. What should you do <b>before</b> trusting it?', 'Run it, test it, and make sure you understand the change', ['Nothing, AI code always works', 'Delete your old code right away', 'Post it everywhere'], 'AI code can have bugs. You saw that in the Code Lab!'],
    ['A great way to study for a test with AI is to ask it to...', 'Quiz you, one question at a time, and explain what you miss', ['Take the test for you', 'Tell you to skip it', 'Guess the test answers'], 'Being quizzed (and getting things wrong) is one of the best ways to learn.'],
    ['Your teacher says no AI on this essay. You should...', 'Not use it. Rules about AI are part of the assignment', ['Use it secretly', 'Use it but change some words', 'Use two AIs'], 'Being honest about when you use AI matters more than any single grade.'],
    ['An <b>AI agent</b> is an AI that can...', 'Take actions with tools, like searching, running code or filling in forms', ['Only chat', 'Think like a spy', 'Work without electricity'], 'Agents plan steps and use tools. People still need to check what they do.'],
    ['An AI wrote a summary of a book you didn\'t read. Biggest risk?', 'You can\'t tell if the summary is wrong', ['It will be too short', 'The book gets deleted', 'There is no risk'], 'If you can\'t check it, you can\'t trust it. Use AI to go deeper, not to skip the thinking.'],
    ['You used AI to brainstorm ideas for your science project. What is the honest thing to do?', 'Say that you used AI to help brainstorm', ['Hide it', 'Say a friend did it', 'Say you did everything alone'], 'Giving credit, even to a tool, is part of honest work.'],
    ['Which is a smart way to use AI for a creative project?', 'Ask for 10 rough ideas, then pick one and make it your own', ['Copy its first idea exactly', 'Let it decide everything', 'Never have your own ideas'], 'AI is a great brainstorm buddy. You\'re the director.'],
    ['You ask an AI to explain photosynthesis and don\'t get it. Best next prompt?', '"Explain it again with a Minecraft example"', ['"???"', '"You\'re bad at this"', 'The same prompt again'], 'Ask for a different angle. A patient tutor that never gets tired is AI\'s superpower.'],
  ],
  tools: [
    ['You need 38,417 × 2,906 exactly. Best tool?', 'A calculator', ['A chatbot, from memory', 'An image generator', 'A guess'], 'Chatbots predict text and can slip on big arithmetic. Calculators follow exact rules.'],
    ['You want today\'s weather. Best tool?', 'A weather app or a search', ['A chatbot with no internet', 'An image generator', 'A calculator'], 'A chatbot without live data can\'t know today\'s weather.'],
    ['You want 10 name ideas for your game studio. Best tool?', 'A chatbot', ['A calculator', 'A weather app', 'A stopwatch'], 'Brainstorming lots of options fast is exactly what chatbots are great at.'],
    ['An <b>image generator</b> makes pictures by...', 'Using patterns it learned from millions of images', ['Searching for a photo online', 'Hiring an artist', 'Taking a photo'], 'It doesn\'t copy and paste a photo. It builds a new image from learned patterns.'],
    ['Which job is AI <b>bad</b> at?', 'Knowing what happened in your classroom today', ['Summarizing a long article you paste in', 'Translating a sentence', 'Suggesting rhymes'], 'AI only knows its training data and what you tell it.'],
    ['A recommendation AI keeps showing you the same kind of video. Why?', 'It predicts you\'ll watch more of what you watched before', ['It likes that video', 'It is broken', 'Someone is controlling it by hand'], 'Its goal is to keep you watching. You can decide when to stop.'],
    ['Who is responsible for what you turn in or post?', 'You are, even if AI helped', ['The AI', 'The AI company', 'Nobody'], 'AI is a tool. The person using it owns the result.'],
    ['Which is something humans should always decide, not AI alone?', 'Big choices that affect people\'s lives', ['Which word comes next', 'How to sort a list', 'What 2 + 2 is'], 'AI can help with information. People stay in charge of important decisions.'],
    ['Two different chatbots give two different answers. What does that tell you?', 'Each is a different model making its own predictions, so check a real source', ['One is lying on purpose', 'Both must be right', 'The internet is broken'], 'Different training, different guesses. When they disagree, verify.'],
    ['What is the best way to think about AI?', 'A powerful tool that\'s useful when you know its limits', ['A magic genie that\'s always right', 'A scary monster', 'A replacement for learning'], 'Know what it\'s good at, check its work, and keep building your own brain.'],
  ],
};

// ─── Widget: tokenizer ───
function tokenize(text) {
  const out = [];
  (text.match(/[A-Za-z']+|\d+|[^\sA-Za-z\d]/g) || []).forEach(w => {
    if (w.length <= 5 || !/^[A-Za-z']+$/.test(w)) return out.push(w);
    const pre = ['un', 're', 'pre', 'dis', 'over', 'super'].find(p => w.toLowerCase().startsWith(p) && w.length > p.length + 3);
    let rest = w; if (pre) { out.push(w.slice(0, pre.length)); rest = w.slice(pre.length); }
    const suf = ['ing', 'able', 'tion', 'ness', 'ful', 'ly', 'ed', 'er', 'est', 's'].find(x => rest.toLowerCase().endsWith(x) && rest.length > x.length + 2);
    const mid = suf ? rest.slice(0, -suf.length) : rest;
    for (let i = 0; i < mid.length; i += 5) out.push(mid.slice(i, i + 5));
    if (suf) out.push(rest.slice(-suf.length));
  });
  return out;
}
function tokenWidget(el) {
  const cols = ['#3DD6FF', '#FF8FB1', '#FFE14D', '#7CF06B', '#B26BFF', '#FF8A3D'];
  el.innerHTML = `<label class="sl"><span>Type anything:</span></label><input class="tokin" maxlength="90" value="Unbelievable! Robots are learning superfast."><div class="toks"></div><p class="note tokn"></p>`;
  const draw = () => { const t = tokenize(el.querySelector('.tokin').value); el.querySelector('.toks').innerHTML = t.map((x, i) => `<span style="--c:${cols[i % cols.length]};animation-delay:${i * 40}ms">${esc(x)}</span>`).join(''); el.querySelector('.tokn').innerHTML = `<b>${t.length} tokens.</b> Real chatbots use about 50,000 different chunks. This is a simplified version, but the idea is the same.`; };
  el.querySelector('.tokin').addEventListener('input', draw); draw();
}
function contextWidget(el) {
  const msgs = ['My dog is named Pixel.', 'What games do you like?', 'I like obbies best.', 'Tell me a joke.', 'Another one!', 'What is 7 × 8?', 'Explain loops.', 'What is my dog\'s name?'];
  el.innerHTML = sl('w', 'Context window size (messages)', 2, 8, 4) + '<div class="out"></div>';
  wire(el, ({ w }) => { const first = msgs.length - w; el.querySelector('.out').innerHTML = `<div class="ctxlist">${msgs.map((m, i) => `<div class="ctxmsg ${i < first ? 'gone' : ''}">${i < first ? '👻' : '💬'} ${m}</div>`).join('')}</div><div class="brain"><b>🤖 AI:</b> ${first > 0 ? '"I don\'t see a dog\'s name anywhere in our chat. What is it?"' : '"Your dog\'s name is Pixel!"'}</div><p class="note">${first > 0 ? 'The first message slid out of the window, so the AI can\'t see it any more.' : 'Everything fits in the window, so the AI can see the answer.'}</p>`; });
}

// ─── Widget: gradient descent hill ───
function hillWidget(el) {
  let x = 9, hist = [9];
  const f = v => 0.9 * (v - 3) * (v - 3) + 4, df = v => 1.8 * (v - 3);
  const X0 = v => 20 + v * 28, Y0 = v => 170 - v * 2.1;
  el.innerHTML = sl('lr', 'Learning rate (step size)', 0.1, 1.3, 0.3, 0.1) + '<div class="out"></div><div class="row center"><button class="btn small cyan step">Take a training step</button><button class="btn small ghost rst">Reset</button></div><p class="note hilln"></p>';
  const draw = () => {
    let path = ''; for (let v = -1; v <= 11; v += 0.25) path += `${v === -1 ? 'M' : 'L'}${X0(v)} ${Y0(f(v))} `;
    el.querySelector('.out').innerHTML = `<svg class="vis hill" viewBox="0 0 340 190"><path d="${path}" class="curve"/><line x1="${X0(3)}" y1="${Y0(f(3)) + 6}" x2="${X0(3)}" y2="186" class="goal"/><text x="${X0(3)}" y="186" text-anchor="middle">lowest error</text>${hist.slice(0, -1).map(h => `<circle cx="${X0(h)}" cy="${Y0(f(Math.max(-1, Math.min(11, h)))) - 8}" r="4" class="trail"/>`).join('')}<circle cx="${X0(Math.max(-1, Math.min(11, x)))}" cy="${Y0(f(Math.max(-1, Math.min(11, x)))) - 9}" r="9" class="ball"/><text x="12" y="16">error: ${f(x).toFixed(1)}</text></svg>`;
    const lr = +el.querySelector('input').value, d = Math.abs(x - 3);
    el.querySelector('.hilln').innerHTML = d < 0.15 ? `<b>Trained in ${hist.length - 1} steps!</b> The ball found the bottom, where the error is smallest.` : lr > 1.05 ? 'Step size is huge. Watch it <b>overshoot</b> and bounce past the bottom.' : lr < 0.2 ? 'Tiny steps are safe but <b>slow</b>.' : 'Each step moves the ball downhill, toward less error.';
  };
  el.querySelector('.step').onclick = () => { const lr = +el.querySelector('input').value; x = x - lr * df(x); hist.push(x); if (hist.length > 14) hist.shift(); Sfx.step(); draw(); };
  el.querySelector('.rst').onclick = () => { x = 9; hist = [9]; draw(); };
  el.querySelector('input').addEventListener('input', draw); draw();
}

// ─── Widget: prompt recipe ───
function recipeWidget(el) {
  const parts = [['role', 'Role', 'Act as a friendly game design coach.'], ['ctx', 'Context', 'I\'m 11 and I\'m making my first Roblox obby.'], ['task', 'Task', 'Give me ideas for a lava level.'], ['ex', 'Example', 'I like ideas such as "platforms that vanish when you count to 3."'], ['fmt', 'Format', 'Give me 3 ideas as a numbered list, one sentence each.']];
  const on = new Set(['task']);
  const ans = n => n <= 1 ? 'Lava levels are a popular kind of level in many games. There are many ways to make one. You could add lava and platforms.' : n <= 3 ? 'Here are some ideas for your obby\'s lava level: rising lava that chases the player, stepping stones that sink, and a bridge that burns away behind you.' : '1. Lava Tide: the lava rises every 10 seconds, so players must reach a safe ledge in time.\n2. Count to Three: platforms vanish on a 3-beat rhythm players can learn.\n3. Ember Bridge: each plank burns away one second after you step on it.';
  const draw = () => {
    el.innerHTML = `<div class="recipe">${parts.map(([k, n, t]) => `<button class="opt ${on.has(k) ? 'on' : ''}" data-k="${k}"><b>${on.has(k) ? '✓' : '+'} ${n}</b><br>${t}</button>`).join('')}</div><div class="power"><span>Prompt power</span><div class="pbar"><i style="width:${on.size / 5 * 100}%" class="${on.size >= 4 ? 'great' : on.size >= 2 ? 'ok' : 'bad'}"></i></div><b>${on.size}/5</b></div><div class="chat"><div class="chatai"><b>🤖 AI</b><div class="typed">${esc(ans(on.size))}</div></div></div><p class="note">Tap the parts on and off. More of the right ingredients, better answer.</p>`;
    el.querySelectorAll('.opt').forEach(b => b.onclick = () => { const k = b.dataset.k; if (k === 'task') return; if (on.has(k)) on.delete(k); else on.add(k); Sfx.tap(); draw(); });
  };
  draw();
}

// ─── Lab: build a neuron ───
function neuronLab(el, done) {
  let stars = 0;
  const INPUTS = ['Homework done', 'It\'s raining', 'Friend is online'];
  // Goal: play only when homework is done AND it's not raining... friend online doesn't matter
  const ROWS = [[1, 0, 0], [1, 0, 1], [1, 1, 0], [0, 0, 1], [0, 1, 1], [1, 1, 1], [0, 0, 0]];
  const want = r => (r[0] === 1 && r[1] === 0 ? 1 : 0);
  let w = [0, 0, 0], moves = 0;
  const fire = (r, ws) => (r[0] * ws[0] + r[1] * ws[1] + r[2] * ws[2] >= 2 ? 1 : 0);
  const net = (ws, act = [1, 1, 1], lit) => `<svg class="vis nnet" viewBox="0 0 340 170">${INPUTS.map((n, i) => `<line x1="92" y1="${32 + i * 52}" x2="236" y2="85" class="wire ${ws[i] > 0 ? 'pos' : ws[i] < 0 ? 'neg' : 'zero'}" style="stroke-width:${1.5 + Math.abs(ws[i]) * 2.2}"/><circle cx="76" cy="${32 + i * 52}" r="17" class="nin ${act[i] ? 'on' : ''}"/><text x="76" y="${37 + i * 52}" text-anchor="middle" class="nt">${act[i]}</text><text x="170" y="${52 + i * 30}" text-anchor="middle" class="wt">×${ws[i]}</text>`).join('')}<circle cx="256" cy="85" r="26" class="nout ${lit ? 'on' : ''}"/><text x="256" y="91" text-anchor="middle" class="nt">${lit ? 'GO' : 'NO'}</text><text x="256" y="130" text-anchor="middle">fires at 2+</text></svg>`;
  function s1() {
    el.innerHTML = `<div class="lab"><p class="eyebrow">Step 1 of 3 · You are the trainer</p><h3>Tune one neuron by hand</h3><div class="rulecard">🎯 Goal: the neuron should say <b>GO play</b> only when <b>homework is done</b> and it is <b>not raining</b>. Whether a friend is online shouldn't matter.</div>
    <p>Each input is 1 (yes) or 0 (no). The neuron multiplies each input by its <b>weight</b>, adds them up, and fires if the total is <b>2 or more</b>.</p>
    ${INPUTS.map((n, i) => `<label class="sl"><span>Weight for "${n}" <b data-w="${i}">${w[i]}</b></span><input type="range" min="-3" max="3" step="1" value="${w[i]}" data-i="${i}"></label>`).join('')}<div class="nlive"></div></div>`;
    const upd = () => {
      const res = ROWS.map(r => fire(r, w) === want(r)), all = res.every(Boolean);
      el.querySelector('.nlive').innerHTML = `${net(w)}
      <table class="rt nrows"><tr><th>Homework</th><th>Rain</th><th>Friend</th><th>Total</th><th>Neuron says</th><th>Should be</th><th></th></tr>${ROWS.map((r, i) => `<tr class="${res[i] ? 'ok' : 'no'}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[0] * w[0] + r[1] * w[1] + r[2] * w[2]}</td><td>${fire(r, w) ? 'GO' : 'NO'}</td><td>${want(r) ? 'GO' : 'NO'}</td><td>${res[i] ? '✓' : '✗'}</td></tr>`).join('')}</table>
      <p class="big ${all ? 'good' : 'bad'}">${res.filter(Boolean).length} of ${ROWS.length} correct</p>
      ${all ? `<p>You did by hand what training does automatically: you found weights that turn inputs into the right answer. Rain got a <b>negative</b> weight (it counts against), and "friend online" can sit at <b>zero</b> (ignored).</p><div class="row center"><button class="btn next">Next step</button></div>` : '<p class="note">Hint: which input should push the total UP? Which one should push it DOWN? Which one should do nothing?</p>'}`;
      if (all) el.querySelector('.next').onclick = () => { Sfx.good(); if (moves <= 16) stars++; s2(); };
    };
    el.querySelectorAll('input[type=range]').forEach(inp => inp.oninput = () => { const i = +inp.dataset.i; w[i] = +inp.value; el.querySelector(`[data-w="${i}"]`).textContent = w[i]; moves++; upd(); });
    upd();
  }
  function s2() {
    let ws = [0, 0, 0], step = 0, running = false, tries = 0;
    const drawS2 = (row, msg) => {
      const ok = ROWS.filter(r => fire(r, ws) === want(r)).length;
      el.innerHTML = `<div class="lab"><p class="eyebrow">Step 2 of 3 · Let it learn</p><h3>Now watch the neuron train itself</h3><p>The computer runs the loop: <b>guess → check → adjust</b>. When the neuron is wrong, it nudges the weights of the inputs that were on.</p>${net(ws, row || [0, 0, 0], row ? fire(row, ws) : 0)}
      <p class="eq">weights: ${ws.join(', ')} &nbsp;·&nbsp; ${ok} / ${ROWS.length} correct &nbsp;·&nbsp; step ${step}</p><p class="note trainmsg">${msg || 'Press the button and watch the wires change thickness.'}</p>
      <div class="row center"><button class="btn green go" ${running ? 'disabled' : ''}>${ok === ROWS.length ? 'Trained ✓' : '▶ Start training'}</button></div><div class="labout"></div></div>`;
      if (ok === ROWS.length && step > 0) ask(); else el.querySelector('.go').onclick = run;
    };
    function run() {
      running = true; let i = 0, clean = 0;
      const tick = () => {
        if (!el.isConnected) return;
        const r = ROWS[i % ROWS.length], out = fire(r, ws), t = want(r); step++;
        let msg;
        if (out === t) { clean++; msg = `Example ${r.join(' ')} → correct. No change.`; }
        else { clean = 0; const d = t - out; ws = ws.map((v, k) => Math.max(-3, Math.min(3, v + d * r[k]))); msg = `Example ${r.join(' ')} → wrong! Nudging the weights ${d > 0 ? 'up' : 'down'}.`; Sfx.step(); }
        i++; drawS2(r, msg);
        if (clean >= ROWS.length || step > 80) { running = false; drawS2(null, `Done in ${step} steps. Nobody told it the rule. It found the weights from examples.`); return; }
        setTimeout(tick, 420);
      };
      tick();
    }
    function ask() {
      const out = el.querySelector('.labout');
      out.innerHTML = `<p class="big">What did training actually change?</p><div class="choices col">${shuffle(['The weights (the numbers on the wires)', 'The examples', 'The rule a human typed in', 'The number of inputs']).map(t => `<button class="choice">${t}</button>`).join('')}</div><div class="after"></div>`;
      out.querySelectorAll('.choice').forEach(b => b.onclick = () => { tries++; const right = b.textContent.startsWith('The weights'); b.classList.add(right ? 'right' : 'wrong'); if (right) { if (tries === 1) stars++; Sfx.good(); out.querySelectorAll('.choice').forEach(x => (x.disabled = true)); out.querySelector('.after').innerHTML = '<p>Right. Learning is just adjusting numbers until the answers come out right. A chatbot is the same idea with <b>billions</b> of weights.</p><div class="row center"><button class="btn next">Last step</button></div>'; out.querySelector('.next').onclick = s3; } else { Sfx.bad(); b.disabled = true; } });
    }
    drawS2();
  }
  function s3() {
    let tries = 0;
    el.innerHTML = `<div class="lab"><p class="eyebrow">Step 3 of 3 · Go deeper</p><h3>From one neuron to a network</h3><p>One neuron can only learn simple rules. Connect <b>layers</b> of them and each layer builds on the last one:</p>
    <svg class="vis nnet deep" viewBox="0 0 340 150">${[0, 1, 2].map(a => [0, 1, 2, 3].map(b => `<line x1="50" y1="${30 + a * 45}" x2="130" y2="${18 + b * 38}" class="wire zero"/>`).join('')).join('')}${[0, 1, 2, 3].map(a => [0, 1, 2, 3].map(b => `<line x1="130" y1="${18 + a * 38}" x2="210" y2="${18 + b * 38}" class="wire zero"/>`).join('')).join('')}${[0, 1, 2, 3].map(a => [0, 1].map(b => `<line x1="210" y1="${18 + a * 38}" x2="290" y2="${50 + b * 50}" class="wire zero"/>`).join('')).join('')}${[0, 1, 2].map(a => `<circle cx="50" cy="${30 + a * 45}" r="11" class="nin on pulse" style="animation-delay:${a * .15}s"/>`).join('')}${[0, 1, 2, 3].map(a => `<circle cx="130" cy="${18 + a * 38}" r="11" class="nin pulse" style="animation-delay:${.5 + a * .1}s"/><circle cx="210" cy="${18 + a * 38}" r="11" class="nin pulse" style="animation-delay:${1 + a * .1}s"/>`).join('')}${[0, 1].map(a => `<circle cx="290" cy="${50 + a * 50}" r="13" class="nout pulse" style="animation-delay:${1.5 + a * .1}s"/>`).join('')}<text x="50" y="146" text-anchor="middle">pixels</text><text x="130" y="146" text-anchor="middle">edges</text><text x="210" y="146" text-anchor="middle">shapes</text><text x="290" y="146" text-anchor="middle">cat / dog</text></svg>
    <p class="big">An image AI's first layer spots edges. What do the <b>later</b> layers do?</p><div class="choices col">${shuffle(['Combine simple patterns into bigger ones, like ears and faces', 'The exact same thing as the first layer', 'Nothing, they are spares', 'Delete the picture']).map(t => `<button class="choice">${t}</button>`).join('')}</div><div class="labout"></div></div>`;
    el.querySelectorAll('.choice').forEach(b => b.onclick = () => { tries++; const right = b.textContent.startsWith('Combine'); b.classList.add(right ? 'right' : 'wrong'); if (right) { if (tries === 1) stars++; Sfx.good(); el.querySelectorAll('.choice').forEach(x => (x.disabled = true)); el.querySelector('.labout').innerHTML = '<p>Exactly: edges → shapes → parts → "cat." That stacking is why it\'s called <b>deep</b> learning.</p><div class="row center"><button class="btn next">Finish lab</button></div>'; el.querySelector('.next').onclick = () => done(Math.max(1, stars)); } else { Sfx.bad(); b.disabled = true; } });
  }
  s1();
}

const AI2 = [
{ id: 'ai7', name: 'Token Town', title: 'Tokens & Context', kind: 'quiz',
  boss: { name: 'Chunkz', look: { color: '#FF8FB1', eyes: 'three', mouth: 'teeth', acc: 'mohawk', hair: '#FFE14D' }, taunt: 'I chop words into bits. Un. Believ. Able. You\'re. Next.' },
  lesson: [
    { t: 'AI reads in chunks', html: `<p>A chatbot doesn't read letters or whole sentences. It chops text into <b>tokens</b>: small chunks, usually a word or a piece of a word. Then every token becomes a list of <b>numbers</b>, because math is all a computer can do.</p>`, widget: tokenWidget, check: choice('What does a chatbot turn your words into before it "thinks"?', 'Tokens, then numbers', ['Pictures', 'Sounds'], 'Text → tokens → numbers → math → predicted next token.', 'Computers only do math.') },
    { t: 'The context window', html: `<p>The AI can only "see" a limited amount of text at once. That's its <b>context window</b>: your chat so far, plus anything you pasted in.</p><p>Slide the window smaller and watch what the AI forgets:</p>`, widget: contextWidget, check: choice('A chatbot forgot your dog\'s name from much earlier in a very long chat. What happened?', 'That message slid out of its context window', ['It deleted it on purpose', 'It never read it'], 'Tell it again. If it\'s in the window, the AI can use it.', 'What can the AI "see"?') },
  ],
  gen: bankGen(AI_BANK2.tokens, mc) },

{ id: 'ai8', name: 'Inside the Brain', title: 'Neural Networks', kind: 'lab', lab: neuronLab,
  boss: { name: 'Neuro', look: { color: '#B26BFF', eyes: 'cyber', mouth: 'grin', acc: 'bolt', glow: '#B26BFF' }, taunt: 'Billions of weights, all tuned to beat YOU. Fire when ready!' },
  lesson: [
    { t: 'Tiny math units', html: `<p>Inside an AI is a <b>neural network</b>: layers of tiny units called <b>neurons</b>, loosely inspired by the brain.</p><p>Each neuron does one small job:</p><ol><li>Take some inputs (numbers).</li><li>Multiply each one by a <b>weight</b> (how much it matters).</li><li>Add them up. If the total is big enough, <b>fire</b>.</li></ol><p class="eq">input × weight + input × weight + ... → fire or not</p>` },
    { t: 'Learning = changing weights', html: `<p>Nobody types the weights in. The AI starts with random ones, makes a guess, sees how wrong it was, and <b>nudges</b> the weights. Millions of times.</p><p>In the lab you'll tune a neuron by hand, then watch one train itself.</p>`, check: choice('In a neural network, what does a <b>weight</b> do?', 'Sets how much an input matters', ['Stores the answer key', 'Makes the computer heavier'], 'Big weight = this input matters a lot.', 'It multiplies the input.') },
  ],
  gen: bankGen(AI_BANK2.neural, mc) },

{ id: 'ai9', name: 'Training Day', title: 'How Training Works', kind: 'quiz',
  boss: { name: 'Overfit', look: { color: '#FF8A3D', eyes: 'glitch', mouth: 'teeth', acc: 'goggles' }, taunt: 'I MEMORIZED every answer. New questions? Uh... that\'s cheating!' },
  lesson: [
    { t: 'Rolling downhill', html: `<p>Training is a loop: <b>guess → measure the error → adjust → repeat</b>. Picture the error as a hill. Training rolls a ball downhill until it reaches the lowest point.</p><p>The <b>learning rate</b> is the size of each step. Try a few:</p>`, widget: hillWidget, check: choice('What is training trying to do to the error (loss)?', 'Make it as small as possible', ['Make it bigger', 'Keep it the same'], 'Lower error = better guesses.', 'Which way is the ball rolling?') },
    { t: 'Memorizing is not learning', html: `<p>If an AI just <b>memorizes</b> its training examples, it aces those and fails everything new. That's <b>overfitting</b>.</p><p>So engineers always test on examples the AI has <b>never seen</b>. Same reason your boss fights use new questions!</p><p>Also: once training ends, the weights are <b>frozen</b>. When you chat with an AI, it's <b>using</b> what it learned, not learning from you right then.</p>`, check: choice('An AI scores 100% on training examples and 40% on new ones. What happened?', 'It memorized instead of learning the pattern', ['It learned perfectly', 'The new examples are broken'], 'That gap is the sign of overfitting.', 'Did it learn the pattern, or the answers?') },
  ],
  gen: bankGen(AI_BANK2.train, mc) },

{ id: 'ai10', name: 'Prompt Pro', title: 'Advanced Prompting', kind: 'quiz',
  boss: { name: 'Vague-a-tron', look: { color: '#B9C4D6', eyes: 'sleepy', mouth: 'o', acc: 'antenna' }, taunt: 'Do the thing. You know. The thing. With the stuff. Why is this so hard?' },
  lesson: [
    { t: 'The prompt recipe', html: `<p>Pros build prompts from five ingredients: <b>Role</b> (who the AI should act as), <b>Context</b> (who you are, what you're doing), <b>Task</b> (exactly what you want), <b>Examples</b> (show the style), and <b>Format</b> (the shape of the answer).</p>`, widget: recipeWidget, check: choice('Which ingredient is "Give me 3 ideas as a numbered list"?', 'Format', ['Role', 'Context'], 'It tells the AI what shape the answer should take.', 'It describes the shape of the answer.') },
    { t: 'Iterate like a pro', html: `<p>The first answer is a <b>draft</b>. Pros keep going:</p><ul><li>"Shorter."</li><li>"Explain step 2 again, with a Minecraft example."</li><li>"Show your work step by step."</li><li>"Give me 3 more that are sillier."</li></ul><p>And one rule never changes: <b>no private info</b> in prompts. No passwords, no address, no full name.</p>`, check: choice('The AI\'s answer is too hard to understand. What do you do?', 'Ask it to explain more simply, with an example', ['Give up', 'Copy it down anyway'], 'A follow-up prompt fixes most problems.', 'Prompting is a conversation.') },
  ],
  gen: bankGen(AI_BANK2.promptpro, mc) },

{ id: 'ai11', name: 'AI Sidekick', title: 'Learn, Code & Create With AI', kind: 'quiz',
  boss: { name: 'Shortcut', look: { color: '#5BE36B', eyes: 'focus', mouth: 'grin', acc: 'jet' }, taunt: 'Why learn anything? Just copy and paste! (Please don\'t ask me to explain it.)' },
  lesson: [
    { t: 'Tutor mode, not cheat mode', html: `<table class="rt words"><tr><th>Builds your brain 🧠</th><th>Skips your brain 🚫</th></tr><tr><td>"Give me a hint for the next step"</td><td>"Just give me the answer"</td></tr><tr><td>"Quiz me on fractions"</td><td>"Do my worksheet"</td></tr><tr><td>"Why is my answer wrong?"</td><td>"Write my essay"</td></tr></table><p>If AI does the thinking, <b>you</b> don't get stronger. Use it like a coach, not a stunt double.</p>`, check: choice('Which prompt helps you learn the most?', '"Don\'t tell me the answer. Ask me questions until I figure it out."', ['"Answer?"', '"Do it for me."'], 'That\'s how great tutors teach.', 'Which one keeps YOUR brain working?') },
    { t: 'Coding and creating with AI', html: `<p><b>Debugging:</b> paste your code, the <b>exact error message</b>, and what you expected. Then <b>run and test</b> the fix. AI code can have bugs too.</p><p><b>Creating:</b> ask for 10 rough ideas, pick one, and make it yours.</p><p><b>Agents</b> are AIs that can use <b>tools</b>: search the web, run code, click buttons. More power means people need to check their work even more carefully.</p>`, check: choice('AI just gave you a fixed version of your script. What comes next?', 'Run it and test it yourself', ['Trust it completely', 'Delete your backup'], 'Always test. You\'re the one in charge of your code.', 'Can AI code have bugs?') },
  ],
  gen: bankGen(AI_BANK2.sidekick, mc) },

{ id: 'ai12', name: 'Right Tool', title: 'Know AI\'s Limits', kind: 'quiz',
  boss: { name: 'Know-It-All', look: { color: '#FFC93C', eyes: 'star', mouth: 'grin', acc: 'tophat' }, taunt: 'I know EVERYTHING. Today\'s weather? Uh... sunny? Probably? I\'m never wrong!' },
  lesson: [
    { t: 'Pick the right tool', html: `<table class="rt words"><tr><th>Job</th><th>Best tool</th></tr><tr><td>Exact big arithmetic</td><td>Calculator</td></tr><tr><td>Today's news or weather</td><td>Search or an app</td></tr><tr><td>Ideas, explanations, drafts, practice quizzes</td><td>Chatbot</td></tr><tr><td>A picture that doesn't exist yet</td><td>Image generator</td></tr></table><p>A chatbot <b>predicts text</b>. That makes it great with words and ideas, and shaky with exact facts it can't look up.</p>`, check: choice('You need the exact answer to 9,481 × 7,326. Best tool?', 'A calculator', ['A chatbot from memory', 'An image generator'], 'Calculators follow exact rules. Chatbots predict.', 'Exact rules or predictions?') },
    { t: 'You\'re the one in charge', html: `<p>AI is a tool, like a calculator or a bike. It makes you faster, but <b>you</b> steer.</p><ul><li>You're responsible for what you turn in or post.</li><li>Big decisions about people stay with people.</li><li>When two AIs disagree, check a real source.</li></ul><p>Finish this world and you'll know more about AI than most adults do.</p>` },
  ],
  gen: bankGen(AI_BANK2.tools, mc) },
];
AI2.forEach(l => { l.world = 'ai'; AI.push(l); });

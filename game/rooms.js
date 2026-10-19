/* BUCKAZOIDS rooms, items, puzzles and deaths. Original content. */
'use strict';
const ITEMS = {
  mop: { label: 'Mop', names: ['mop', 'esmerelda'], desc: "Your mop, Esmerelda. Eleven years of loyal service and she has never once asked for a raise. Which is lucky, because nobody would give her one.", self: "You give the deck a quick swab out of pure muscle memory. It is, if anything, dirtier now." },
  buckazoids: { label: '59 Buckazoids', names: ['buckazoids', 'buckazoid', 'money', 'credits', 'cash', 'wallet', '59'], desc: "Fifty-nine Buckazoids: your entire life savings. Enough for a sandwich, or most of a sandwich, or one very specific floppy disk.", self: "You count them again. Still fifty-nine. Money is like that." },
  crowbar: { label: 'Crowbar', names: ['crowbar', 'bar', 'prybar'], desc: "A red crowbar. The universal key. Locksmiths hate it.", self: "You swing the crowbar menacingly at nothing. Nothing backs off." },
  coin: { label: 'Odd Coin', names: ['coin', 'gold', 'token', '\u20bf', 'bitcoin', 'btc'], desc: "A heavy gold coin, warm to the touch. One face bears a capital B struck through with two vertical strokes. The other just says 59.\n\nYou get the oddest feeling it's worth nothing now and something later.", self: "You flip the coin. It lands on its edge and stays there until you look away. You decide not to do that again." },
  keycard: { label: 'Keycard', names: ['keycard', 'card', 'key', 'pass'], desc: "A LAB 7 access card. The name has been scratched off. On the back, in marker: 'TRUST THE COIN. -V.'", self: "You swipe the card through the air. The air remains locked." },
  disk: { label: 'Mystery Disk', names: ['disk', 'floppy', 'diskette', 'mystery'], desc: "A 3.5-inch floppy. The label says '?' and nothing else. For fifty-nine buckazoids you'd hoped for at least a full sentence.", self: "You hold the disk up to the light. It's opaque. Floppy disks generally are." }
};
const DEATHS = {
  airlock: "You haul on the big wheel marked AIRLOCK. The airlock, as advertised, locks you out of the air.\n\nYou will now orbit the gas giant at a brisk three kilometers per second for the next several million years. On the bright side, it's the longest break you've ever had.",
  zap: "You grab the live cable with the confidence of a man who has never once read a manual.\n\nForty thousand volts later, your hair finally has some volume. Unfortunately, the rest of you has none.",
  step: "You stroll straight across the sparking cable. Your boots, it turns out, were not rated for this.\n\nThe corridor lights flicker in your honor. Then they go back to normal, because the ship never really knew you.",
  rift: "You step into the rift with nothing to anchor you in time.\n\nYou are smeared evenly from 1991 to 2009, like butter scraped over too much toast. Historians will describe you as 'a beige smudge on the late twentieth century.'"
};
const RIFT = new Pix(64, 104);
const ROOMS = {
  bay: {
    name: 'Cargo Bay', paint: paintBay, walk: [[8, 134], [312, 134], [318, 197], [2, 197]],
    desc: "The cargo bay of the waste-hauler S.S. MEMPOOL: forty thousand tonnes of unconfirmed garbage, waiting to be processed. An airlock lies to the west and a door to Deck 2 to the east. There's also a crate marked FRAGILE that you have been told, repeatedly, not to sit on.",
    dirs: { east: 'door', out: 'door', west: 'airlock' },
    objs: () => [{ img: OBJ.fragile[S.flags.crateOpen ? 1 : 0], x: 194, y: 90, base: 132 }, { img: OBJ.toolbox[S.flags.toolboxOpen ? 1 : 0], x: 56, y: 144, base: 160 }, { img: OBJ.barrel, x: 282, y: 164, base: 199 }],
    anim(c, t) {
      c.fillStyle = (t >> 5) & 1 ? '#ff3020' : '#501008'; c.fillRect(72, 31, 3, 3); c.fillRect(12, 31, 3, 3);
      c.fillStyle = (t >> 6) & 1 ? '#50ff80' : '#18a040'; c.fillRect(275, 45, 3, 3);
      for (let i = 0; i < 14; i++) { const x = 150 + Math.sin(t * .01 + i * 2.1) * 30 + i * 2 - 14, y = 40 + ((t * .12 + i * 37) % 90); c.fillStyle = i % 3 ? '#8a7350' : '#c8a870'; c.fillRect(x | 0, y | 0, 1, 1); }
      if (Math.random() < .3) { const a = Math.random() * 6.28, r = Math.random() * 10; c.fillStyle = '#fff'; c.fillRect((118 + Math.cos(a) * r) | 0, (44 + Math.sin(a) * r) | 0, 1, 1); }
      if (S.flags.crateOpen && !S.got.coin && (t >> 4) & 1) { c.fillStyle = '#fff4a0'; c.fillRect(214, 97, 1, 3); c.fillRect(213, 98, 3, 1); }
    },
    hot: [
      { id: 'porthole', names: ['porthole', 'window', 'stars', 'space'], r: [103, 29, 133, 59], look: "Through the porthole: space. A lot of it. It's been out there your whole career and you still haven't gotten used to how much of it there is." },
      { id: 'lamp', names: ['lamp', 'light'], r: [140, 22, 180, 31], look: "A sodium work lamp. It hums in B-flat. You've been meaning to tell someone about that for six years." },
      { id: 'airlock', names: ['airlock', 'lock', 'hatch', 'wheel', 'sign'], r: [12, 28, 74, 124], ap: [44, 138],
        look: "The airlock. The sign above it says AIRLOCK. A smaller sign says BE QUIET, presumably because out there nobody can hear you anyway.",
        hand() { die('airlock'); return true; }, open() { die('airlock'); return true; }, use(it) { if (it === 'crowbar') { die('airlock'); return true; } },
        walk: "You stand respectfully near the airlock. It stands respectfully near you." },
      { id: 'door', names: ['door', 'exit', 'deck'], r: [250, 44, 302, 124], ap: [276, 137],
        look: "The door to Deck 2. It slides open for anyone, which is more than you can say for most doors in your life.",
        walk() { go('hall', 24, 142, 'down'); return true; }, hand() { go('hall', 24, 142, 'down'); return true; } },
      { id: 'crate', names: ['crate', 'fragile', 'lid', 'straw', 'coin'], r: [196, 94, 240, 132], ap: [214, 140],
        look() { return S.flags.crateOpen ? (S.got.coin ? "The FRAGILE crate: open, and empty apart from packing straw and a lingering sense of destiny." : "Inside, nestled in the straw, something glints gold.") : "A crate stencilled FRAGILE and, underneath, DO NOT OPEN UNTIL 2009. That's eighteen years from now. You've never been good at waiting."; },
        hand() { if (!S.flags.crateOpen) return "The lid is nailed shut. Your fingernails file a formal complaint.";
          if (!S.got.coin) { give('coin'); score('coin', 59); return "You dig through the straw and pull out a heavy gold coin. It's stamped with a strange mark: a B with two vertical strokes through it.\n\nYou can't explain it, but you feel like you just got in early on something."; }
          return "Just straw now. You are not desperate enough to take the straw. Yet."; },
        use(it) { if (it === 'crowbar') { if (S.flags.crateOpen) return "It's already open. You're thorough, at least."; S.flags.crateOpen = 1; Snd.sfx('door'); score('crate', 5);
            return "You jam the crowbar under the lid and lean. With a shriek of nails and a puff of straw, the FRAGILE crate surrenders. So much for 2009."; }
          if (it === 'mop') return "You mop the crate. Now it's a clean crate that you still can't open."; } },
      { id: 'toolbox', names: ['toolbox', 'tools', 'tool', 'latches'], r: [56, 144, 84, 160], ap: [70, 168],
        look() { return S.flags.toolboxOpen ? (S.got.crowbar ? "The toolbox, plundered. A lone socket rolls around inside, unloved." : "Inside the toolbox: a crowbar, and some sockets nobody has ever needed.") : "A red toolbox stencilled PROPERTY OF ENGINEERING. Engineering told you never to touch it. Engineering also isn't here."; },
        hand() { if (!S.flags.toolboxOpen) { S.flags.toolboxOpen = 1; Snd.sfx('click'); return "You flip the latches. Nobody stops you, because nobody is here at all. Inside you see a crowbar."; }
          if (!S.got.crowbar) { give('crowbar'); score('crowbar', 5); return "You take the crowbar. Engineering would be furious, if Engineering hadn't abandoned ship."; }
          return "There's nothing else in there you want."; } },
      { id: 'crates', names: ['crates', 'cargo', 'boxes', 'garbage', 'pallets'], r: [84, 56, 190, 124], look: "Crates of unconfirmed cargo, stacked high. Their manifests have been 'pending' for so long that pending has become a lifestyle.", hand: "They're stacked to the ceiling and held together by optimism. Best not." },
      { id: 'barrel', names: ['barrel', 'drum', 'waste'], r: [284, 164, 320, 200], look: "A drum of WASTE. As a sanitation professional you can tell it's the good stuff.", hand: "It sloshes in a way that discourages further sloshing." },
      { id: 'floor', names: ['floor', 'deck', 'puddle', 'plates'], r: [0, 125, 320, 200], look: "The deck plates are scuffed, sticky, and very slightly warm. Home sweet home.", hand: "Sticky.", use(it) { if (it === 'mop') return ITEMS.mop.self; } },
      { id: 'wall', names: ['wall', 'walls', 'pipes', 'ceiling'], r: [0, 0, 320, 125], look: "Riveted bulkheads, sweating pipes, and a ceiling you haven't seen clean since the ship was commissioned." }
    ]
  },
  hall: {
    name: 'Deck 2 Corridor', paint: paintHall, walk: [[6, 136], [316, 136], [318, 197], [2, 197]], danger: [288, 151, 320, 168],
    desc: "Deck 2's main corridor. Through the window a ringed gas giant looms, which the ship has been orbiting for three weeks for reasons nobody explained to you. There's a vending machine, your locker, and the hazard-striped bulkhead of LAB 7. Something to the east is sparking with real enthusiasm.",
    dirs: { west: 'westdoor', back: 'westdoor', east: 'bulkhead', north: 'bulkhead', lab: 'bulkhead' },
    objs: () => [],
    anim(c, t) {
      if (S.flags.bulkOpen) c.drawImage(OBJ.bulkOpen, 212, 50);
      c.fillStyle = S.flags.bulkOpen ? '#40ff70' : ((t >> 4) & 1 ? '#ff3020' : '#601008'); c.fillRect(268, 83, 6, 3);
      if (Math.random() < .08) { c.fillStyle = '#0e1119'; c.fillRect(84, 10, 24, 3); }
      for (const [sx, sy] of [[300, 90], [290, 157]]) if (Math.random() < .45) { c.fillStyle = Math.random() < .5 ? '#ffffff' : '#ffe040'; for (let i = 0; i < 5; i++) { const a = Math.random() * 6.28, r = Math.random() * 7; c.fillRect((sx + Math.cos(a) * r) | 0, (sy + Math.sin(a) * r * .7) | 0, 1, 1); } }
    },
    hot: [
      { id: 'cable', names: ['cable', 'wire', 'sparks', 'spark'], r: [276, 112, 318, 170], look: "A severed power cable lies across the floor, writhing and spitting sparks. Your safety training covered this. You slept through your safety training.",
        hand() { die('zap'); return true; }, get() { die('zap'); return true; }, use(it) { if (it === 'mop') { die('zap'); return true; } return "Whatever you were going to do, the cable would like you to reconsider."; }, talk: "You ask the cable to calm down. It does not calm down." },
      { id: 'panel', names: ['panel', 'wires', 'maintenance'], r: [286, 66, 314, 108], ap: [282, 140], look: "An open maintenance panel spitting sparks. Someone has labelled the wires RED, YELLOW, BLUE, GREEN and WHITE, which is helpful the way only completely useless things can be.", hand() { die('zap'); return true; } },
      { id: 'reader', names: ['reader', 'slot', 'scanner'], r: [264, 78, 278, 100], ap: [250, 138], look() { return S.flags.bulkOpen ? "The reader glows a contented green." : "A card reader, blinking red. It wants a card, not your opinion."; },
        hand: "You press the reader. It blinks red at you, harder.", use(it) { return ROOMS.hall.hot.find(h => h.id === 'bulkhead').use(it); } },
      { id: 'bulkhead', names: ['bulkhead', 'lab', 'door', 'hatch'], r: [206, 32, 264, 127], ap: [236, 138],
        look() { return S.flags.bulkOpen ? "The bulkhead stands open. Beyond it a purple light pulses, like the room is thinking." : "LAB 7. TEMPORAL RESEARCH. AUTHORIZED PERSONNEL ONLY. A card reader blinks red beside it. You have never once been authorized personnel."; },
        hand() { if (S.flags.bulkOpen) { go('lab', 288, 144, 'left'); return true; } return "It's sealed tight. The card reader blinks at you smugly."; },
        walk() { if (S.flags.bulkOpen) { go('lab', 288, 144, 'left'); return true; } return "You march right up to the bulkhead to show it who's boss. It's the bulkhead."; },
        use(it) { if (it === 'keycard') { if (S.flags.bulkOpen) return "It's already open."; S.flags.bulkOpen = 1; score('bulk', 5); Snd.sfx('door');
            return "You swipe the keycard. The reader blinks green, thinks about it, and the bulkhead grinds open. Cold air and purple light roll out, smelling of ozone and, somehow, tomorrow."; }
          if (it === 'crowbar') return "You jam the crowbar into the seam. The bulkhead, which is forty centimeters of hull steel, doesn't notice."; } },
      { id: 'window', names: ['window', 'planet', 'giant', 'rings', 'stars'], r: [120, 30, 202, 100], look: "A ringed gas giant fills the window, orange and enormous. The ship has been parked here for three weeks. Nobody told you why. Nobody tells you anything." },
      { id: 'locker', names: ['locker', 'lock'], r: [90, 58, 116, 127], ap: [104, 140],
        look() { return S.flags.lockerOpen ? "Your locker, open. A spare cap, a photo of your mom, and a strong smell of feet." : "Your locker: W. FLUX. It's been jammed since the Mop Handle Incident. You don't like to talk about the Mop Handle Incident."; },
        hand() { return S.flags.lockerOpen ? "Nothing else in there but spare caps and regret." : "It's jammed. Has been since the Mop Handle Incident."; },
        use(it) { if (it === 'crowbar') { if (S.flags.lockerOpen) return "It's already open. Leave it some dignity."; S.flags.lockerOpen = 1; give('keycard'); score('card', 10); Snd.sfx('door');
            return "With a heroic grunt you pop the locker. Among your spare caps lies a LAB 7 keycard you definitely did not put there. Scrawled on the back: 'TRUST THE COIN. -V.'\n\nYou take it. Who's V? You don't know any V's. You barely know any consonants."; }
          if (it === 'mop') return "The mop handle is what jammed it in the first place. History does not need to repeat itself."; } },
      { id: 'vending', names: ['vending', 'machine', 'fizz', 'soda', 'cola', 'fizzo'], r: [46, 56, 84, 127], ap: [66, 140],
        look: "A FIZZ-O-MATIC. 'Fizz-O: It's Like Being Shaken!' It's out of everything except one can of Diet Fizz-O, which has been in there since the ship was built.",
        hand: "You press a button. The machine thinks about it, then declines.",
        use(it) { if (it === 'buckazoids') return "You're about to feed it your life savings when an eerie premonition stops you. Somewhere, somewhen, those fifty-nine buckazoids have a better destiny than Diet Fizz-O.";
          if (it === 'coin') return "The coin slot rejects it. The machine seems almost... frightened of it."; if (it === 'crowbar') return "Vandalism is beneath you. Also, you're scared of it."; } },
      { id: 'westdoor', names: ['bay', 'west', 'cargo'], r: [4, 40, 40, 127], ap: [22, 140], look: "The door back to the cargo bay.", walk() { go('bay', 276, 140, 'down'); return true; }, hand() { go('bay', 276, 140, 'down'); return true; } },
      { id: 'floor', names: ['floor', 'grate', 'grating'], r: [0, 127, 320, 200], look: "Steel floor grating. Things have fallen through it over the years that you prefer not to think about.", hand: "Cold. Gritty. Your fingers come back a color they weren't before." },
      { id: 'wall', names: ['wall', 'walls', 'ceiling', 'lights'], r: [0, 0, 320, 127], look: "Corridor walls the color of a dentist's waiting room, if the dentist had died." }
    ]
  },
  lab: {
    name: 'Lab 7', paint: paintLab, walk: [[10, 140], [310, 140], [318, 197], [2, 197]],
    desc: "LAB 7: Temporal Research. In the middle of the room, above a glowing platform, the air has been torn open. Two coils hum on either side of the tear and a console blinks a question at nobody. Whatever the scientists were doing here, they left in a hurry.",
    dirs: { east: 'exit', back: 'exit', out: 'exit', south: 'exit', north: 'rift', in: 'rift' },
    enter() { if (!S.flags.seenLab) { S.flags.seenLab = 1; setTimeout(() => say("You step into LAB 7. In the middle of the room, the air itself has been torn open like a bag of chips. Through the rip you can hear, very faintly, elevator music."), 450); } },
    objs: () => [],
    anim(c, t) {
      const d = RIFT.d; d.fill(0);
      const glitch = Math.random() < .12 ? (Math.random() * 20) | 0 : -1;
      for (let y = 0; y < 104; y++) { const off = (glitch >= 0 && Math.abs(y - glitch * 5) < 4) ? ((Math.random() * 8) | 0) - 4 : 0;
        for (let x = 0; x < 64; x++) { const dx = (x - 32) / 25, dy = (y - 52) / 48, edge = 1 + Math.sin(y * .5 + t * .1) * .06 + (hn(y, t >> 2, 9) - .5) * .08; const r = Math.hypot(dx, dy) * edge; if (r > 1) continue;
          const a = Math.atan2(dy, dx), sw = Math.sin(a * 3 + r * 9 - t * .07) * .5 + .5;
          let col = r > .86 ? (hn(x, y, t) < .5 ? [255, 255, 255] : [160, 244, 255]) : pick(sw > .55 ? P_.CYAN : P_.PURP, .25 + sw * .6 + (1 - r) * .3, x, y);
          if (hn(x, y, t >> 1) < .01) col = [255, 255, 255];
          const i = ((y * 64 + clamp(x + off, 0, 63)) * 4); d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; } }
      RIFT.x.putImageData(RIFT.id, 0, 0); c.drawImage(RIFT.c, 128, 40);
      for (const cx of [100, 220]) { c.fillStyle = Math.random() < .5 ? '#c0ffff' : '#60e0e8'; c.fillRect(cx - 2, 34, 4, 4); if (Math.random() < .25) { c.fillStyle = '#e0ffff'; let x = cx, y = 36; for (let i = 0; i < 12; i++) { x += (cx < 160 ? 2 : -2); y += ((Math.random() * 5) | 0) - 2; c.fillRect(x, y, 1, 1); } } }
      if ((t >> 5) & 1) { c.fillStyle = '#a0ffb8'; c.fillRect(56, 98, 4, 1); }
    },
    hot: [
      { id: 'rift', names: ['rift', 'tear', 'rip', 'anomaly', 'portal', 'hole'], r: [128, 40, 192, 140], ap: [160, 150],
        look: "A ragged tear in the air, hanging over the platform like a wound in a screensaver. Through it you glimpse fluorescent lights, checkerboard tiles and what might be a shopping mall. The console says it leads to 1991. The console seems unsure.",
        walk() { return enterRift(); }, hand() { return enterRift(); }, use(it) { if (it === 'coin') return enterRift(); if (it === 'mop') return "You poke the rift with the mop. A few bristles come back from 1991 with a perm."; },
        talk: "You shout 'HELLO?' into the rift. Several seconds later, a faint voice shouts back: 'Do you have your receipt?'" },
      { id: 'console', names: ['console', 'screen', 'computer', 'note', 'buttons'], r: [16, 78, 84, 134], ap: [54, 146],
        look: "The temporal console. Its screen reads YEAR: 1991? and the question mark is not reassuring. A sticky note says: 'ONLY THE COIN KNOWS THE WAY. DO NOT GO IN WITHOUT IT. SERIOUSLY. -V.'",
        hand: "You press a button. The screen changes from 1991? to 1991??. You press it again to undo, and it becomes 1991???. You decide to stop helping." },
      { id: 'coils', names: ['coils', 'coil', 'tower', 'towers'], r: [88, 26, 112, 132], r2: [208, 26, 232, 132], look: "Twin temporal coils crackling with cold blue light. The hair on your arms is standing at attention, which is more respect than you usually get.", hand: "You reach toward a coil and every hair on your body votes no. You respect the vote." },
      { id: 'exit', names: ['exit', 'door', 'corridor', 'hall'], r: [264, 44, 312, 135], ap: [288, 144], look: "The way back to the corridor.", walk() { go('hall', 236, 142, 'down'); return true; }, hand() { go('hall', 236, 142, 'down'); return true; } },
      { id: 'platform', names: ['platform', 'floor', 'cables'], r: [0, 135, 320, 200], look: "A circular platform ringed in light, the kind of thing scientists stand on right before something goes horribly, historically wrong." },
      { id: 'wall', names: ['wall', 'walls', 'room'], r: [0, 0, 320, 135], look: "Curved purple walls ribbed like the inside of a whale. A very expensive whale." }
    ]
  },
  mall: {
    name: 'Floppy Planet, 1991', paint: paintMall, walk: [[4, 150], [316, 152], [318, 197], [2, 197]],
    desc: "FLOPPY PLANET: a software store in a shopping mall, 1991, judging by the hair. Shelves of boxed games line the wall, a bored three-eyed clerk props up the counter, and a public access terminal hums in the corner. The rift that brought you here has closed. Of course it has.",
    dirs: { back: 'nowhere', out: 'nowhere' },
    objs: () => [{ base: 166, draw: c => { c.drawImage(OBJ.kiosk, 24, 106); if (S.flags.hashDone) { c.fillStyle = '#a0ffb8'; for (let i = 0; i < 4; i++) c.fillRect(32, 118 + i * 3, 10 + ((i * 7 + (tick >> 3)) % 14), 1); } else if ((tick >> 5) & 1) { c.fillStyle = '#40e070'; c.fillRect(32, 122, 4, 2); } } }],
    anim(c, t) {
      const w = textW('FLOPPY PLANET') * 2, x0 = Math.round(161 - w / 2), fl = Math.random() < .04;
      textBig(c, 'FLOPPY', x0 + 1, 13, 2, '#2a0a2a'); textBig(c, 'FLOPPY', x0, 12, 2, fl ? '#603058' : '#ff7ad8');
      const x1 = x0 + (textW('FLOPPY ') + 1) * 2; textBig(c, 'PLANET', x1 + 1, 13, 2, '#06202e'); textBig(c, 'PLANET', x1, 12, 2, (t % 200) < 6 ? '#10607a' : '#60f0ff');
      if ((t % 240) < 8) { c.fillStyle = '#6cbc48'; for (const ex of [246, 253, 260]) c.fillRect(ex - 2, 64, 5, 4); }
    },
    hot: [
      { id: 'clerk', names: ['clerk', 'alien', 'man', 'guy', 'cashier', 'zb', 'him'], r: [232, 50, 276, 104], ap: [246, 156],
        talk() { if (has('disk') || S.got.disk) return rnd(["'Enjoy the disk, pal. And if anything weird happens, you didn't get it here.'", "'We close at nine. In 1991, everything closes at nine.'"]);
          if (!S.flags.metClerk) { S.flags.metClerk = 1; return "'Welcome to Floppy Planet, where the future comes on 1.44 megabytes,' drones the clerk. His name tag says ZB. All three of his eyes look you over.\n\n'Lemme guess. Came through the rift. You want the Mystery Disk. Everybody from the rift wants the Mystery Disk. Fifty-nine buckazoids. No refunds, no questions, no warranty.'"; }
          return rnd(["'Fifty-nine buckazoids for the Mystery Disk. I don't make the prices. Somebody in the future does.'", "'You gonna buy something or just stand there being from the future?'", "'Nice coveralls. Very 2009.'"]); },
        look: "The clerk is a three-eyed alien with a mullet of truly historic proportions. He's chewing gum with the focus of someone who has given up on everything else.",
        hand: "You poke the clerk. He looks at your finger with two of his eyes and at you with the third. You withdraw the finger.",
        use(it) { if (it === 'buckazoids') return buyDisk();
          if (it === 'coin') return "The clerk squints at the coin with all three eyes. 'Never seen that mark before. Not legal tender, pal. Not yet, anyway.' He hands it back very carefully, like it might go up.";
          return "'We don't do trade-ins,' says the clerk."; } },
      { id: 'register', names: ['register', 'till'], r: [282, 84, 314, 104], look: "The register display reads 59.00. You get a funny feeling about that.", hand: "'Hands off the register, future boy.'" },
      { id: 'poster', names: ['poster', 'blaster'], r: [276, 30, 318, 86], look: "A poster for BIT BLASTER III. 'NOW WITH 16 COLORS!' Someone has added a seventeenth with a felt-tip pen." },
      { id: 'sign', names: ['sign', 'neon'], r: [60, 6, 262, 32], look: "FLOPPY PLANET, in two colors of neon that work and one that's thinking about it." },
      { id: 'kiosk', names: ['terminal', 'kiosk', 'computer', 'screen', 'monitor'], r: [24, 104, 64, 168], ap: [74, 172],
        look() { return S.flags.hashDone ? "The terminal is still scrolling numbers to itself, quite pleased." : "A PUBLIC ACCESS TERMINAL. A sticker on it reads: INSERT DISK TO BEGIN. DO NOT FEED THE MODEM."; },
        hand: "You type HELLO. The terminal replies: INSERT DISK. You type PLEASE. It replies: INSERT DISK, PLEASE.",
        use(it) { if (it === 'disk') return runTerminal(); if (it === 'coin') return "There's no coin slot. This is a terminal, not a laundromat."; if (it === 'buckazoids') return "The terminal is free. It's the disk that costs money. That's the software business."; } },
      { id: 'shelves', names: ['shelves', 'shelf', 'games', 'boxes', 'software', 'releases'], r: [8, 36, 196, 126], look: "Boxed software, every box ten times bigger than the disk inside. You spot SPACE MOP SIMULATOR, SPREADSHEET WARRIOR, DRAGONS & DEDUCTIBLES and BIT BLASTER III: TURBO EDITION.", hand: "You pick up a box, read the system requirements (640K RAM!), and put it back, overwhelmed." },
      { id: 'counter', names: ['counter', 'desk'], r: [198, 104, 320, 148], look: "A laminated counter in a shade of pink the 1990s will one day have to answer for." },
      { id: 'plant', names: ['plant', 'palm'], r: [168, 108, 198, 150], look: "A plastic plant. Even it looks bored." },
      { id: 'floor', names: ['floor', 'carpet', 'tiles'], r: [0, 126, 320, 200], look: "Checkerboard tiles, freshly waxed. As a professional, you approve. Grudgingly." },
      { id: 'wall', names: ['wall', 'wallpaper'], r: [0, 0, 320, 126], look: "Wallpaper covered in squiggles and triangles. It looks like a calculator had a dream." }
    ]
  },
  genesis: {
    name: 'The Genesis Chamber', paint: paintGenesis, walk: [[60, 148], [260, 148], [318, 197], [2, 197]],
    desc: "A vast, silent place under no sky at all. A grid runs off in every direction, and at its center floats a golden cube marked 0. Off to the right, faint outlines of more cubes wait in a line, empty, as if they're expecting something.",
    dirs: {},
    enter() { setTimeout(() => say("You tumble out of the screen and into... somewhere. A vast, quiet place where every transaction that will ever happen hasn't happened yet.\n\nIn front of you, a golden cube hangs in the air, humming one patient note."), 600); },
    objs: () => [{ base: 140, draw: c => { const b = Math.round(Math.sin(tick * .03) * 2); c.drawImage(OBJ['halo' + ((tick >> 4) & 1)], 100, 20 + b); c.drawImage(OBJ.cube, 112, 34 + b); } }],
    anim(c, t) {
      for (let i = 0; i < 3; i++) { const gx = 214 + i * 34, gy = 74 - i * 4; c.globalAlpha = S.flags.ended && i === 0 ? 1 : .55 - i * .15; c.drawImage(OBJ.ghost, gx, gy); c.globalAlpha = 1;
        c.fillStyle = '#8a4a00'; for (let k = 0; k < 10; k += 2) c.fillRect(gx - 12 + k, gy + 22, 1, 1); }
      textSh(c, 'BLOCK 0', 160 - textW('BLOCK 0') / 2, 22, (t >> 5) & 1 ? '#fff4c8' : '#f0a830', '#2a1400');
      for (let i = 0; i < 18; i++) { const x = 70 + ((i * 53) % 180), y = 140 - ((t * .2 + i * 29) % 120); c.fillStyle = i % 2 ? '#ffd870' : '#c47410'; c.fillRect(x, y | 0, 1, 1); }
    },
    hot: [
      { id: 'cube', names: ['cube', 'block', 'zero', '0', 'hollow', 'genesis'], r: [108, 30, 212, 146], ap: [160, 156],
        look: "BLOCK ZERO. The first one. It hums a single patient note, and there's a coin-sized hollow in its face.",
        hand() { return has('coin') ? "It's warm, and it's waiting for something. Something coin-shaped, by the look of the hollow." : "It's warm, and quietly content."; },
        talk: "You say hello to the cube. The cube says nothing, in a very foundational way.",
        use(it) { if (it === 'coin') return finale(); return "The cube is not interested in your " + ITEMS[it].label.toLowerCase() + "."; } },
      { id: 'ghosts', names: ['cubes', 'outlines', 'ghosts', 'chain', 'line'], r: [200, 50, 320, 120], look: "Ghostly outlines of cubes, linked one after another off into the dark. Block 1. Block 2. Block a-whole-lot. None of them exist yet." },
      { id: 'grid', names: ['grid', 'floor', 'void', 'sky'], r: [0, 0, 320, 200], look: "The grid hums underfoot. It feels like standing on a spreadsheet that's about to become very important." }
    ]
  }
};
function enterRift() {
  if (!has('coin')) { die('rift'); return true; }
  busy = 1; Snd.sfx('rift'); fx.flash = 60; fx.flashCol = '#c0f0ff'; fx.shake = 30; score('rift', 20);
  setTimeout(() => { hero.hidden = true; }, 300);
  setTimeout(() => { busy = 0; hero.hidden = false; go('mall', 132, 174, 'down'); fx.flash = 30;
    say("As you step toward the rift the coin in your pocket grows hot and begins to hum. The tear snaps wide, seems to recognize something, and swallows you whole...\n\n...then spits you out onto shiny checkerboard tiles. The air smells of new plastic and fruit-adjacent beverages. Overhead, neon spells out FLOPPY PLANET.\n\nWelcome to 1991."); }, 1400);
  return true;
}
function buyDisk() {
  if (has('disk') || S.got.disk) return "You already bought the only one. 'Collector's item,' says the clerk, smugly.";
  if (!has('buckazoids')) return "You have no buckazoids. 'No buckazoids, no disk,' says the clerk. It's practically the store motto.";
  drop('buckazoids'); give('disk'); score('disk', 10);
  return "You slide all fifty-nine buckazoids across the counter. The clerk counts them twice, drops them in the register, and produces a floppy from under the counter as if it had been waiting for you.\n\n'Exactly fifty-nine,' he says. 'Funny. That's what the last guy paid. Never saw him again.'";
}
function runTerminal() {
  if (S.flags.hashDone) return "The terminal has already said everything it has to say.";
  S.flags.hashDone = 1; drop('disk'); score('hash', 25); Snd.sfx('disk');
  setTimeout(() => { openWin({ title: 'PUBLIC ACCESS TERMINAL', green: true, text: "C:\\> RUN A:\\?.EXE\n\nREADING LEDGER....... OK\n\nBLOCK 0\n000000000019d6689c085ae1\n65831e934ff763ae46a2a6c1\n72b3f1b60a8ce26f\n\nTHE DAILY RECORD, 03 JAN 2009:\nTREASURY TEETERS ON THE EDGE.\nBANKS ASK FOR SECONDS.\n\nPRESS ANY COIN TO CONTINUE_",
    buttons: [{ label: 'Continue', fn: () => { closeModal(); say("The numbers swirl off the screen and wrap around your wrist. The coin in your pocket hums in perfect harmony with the drive.\n\nYou feel yourself being... downloaded.", () => { busy = 1; fx.flash = 50; fx.flashCol = '#fff0a0'; Snd.sfx('rift'); setTimeout(() => { busy = 0; go('genesis', 160, 188, 'up'); }, 1100); }); } }] }); }, 900);
  return "You push the Mystery Disk into the drive. It grinds like it's chewing gravel. The screen goes black, then fills with numbers.";
}
function finale() {
  if (S.flags.ended) return "It's done. The first block is sealed. Somewhere, a laptop fan spins up.";
  S.flags.ended = 1; drop('coin'); score('genesis', 20); Snd.sfx('win'); fx.flash = 60; fx.flashCol = '#fff4c8';
  say("You press the coin into the hollow. It fits perfectly, of course. The cube drinks it in, glows white-hot, and prints a single line in the air:\n\n      reward: 50\n\nThe first of the ghostly cubes behind it flickers, and then, for the first time, it's solid. Somewhere in 2009, a laptop fan spins up.", () => {
    openWin({ title: 'BUCKAZOIDS: END OF CHAPTER ONE', icon: OBJ.bigcoin, kind: 'end', text: "Congratulations, Wendell Flux, Sanitation Technician Third Class and accidental keeper of the first coin.\n\nYour score: " + S.score + " of " + MAXSCORE + ".\n\nTo be continued in\nBUCKAZOIDS II: THE HALVING",
      buttons: [{ label: 'Play Again', fn: () => newGame() }, { label: 'Quit', fn: () => toTitle() }] });
  });
  return true;
}

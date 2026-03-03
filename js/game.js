// ===== STARTER SELECTION =====

function chooseStarter(i) {
  var s = STARTERS[i];
  game.party.push({
    name: s.name,
    type: s.type,
    id: s.id,
    level: 5,
    evolutions: JSON.parse(JSON.stringify(s.evolutions)),
  });
  game.phase = 'route';
  playCry(s.id);
  addLog('Received ' + s.name + ' from Prof. Oak!');
  addLog('Your adventure begins!');
  switchScreen('screen-game');
  updateUI();
  drawWheel();
}

// ===== SPIN EVENT DISPATCH =====

function onSpinComplete() {
  var idx = getWheelResult();
  game.totalSpins++;
  game.spinsOnRoute++;
  var handlers = [
    handleWild, handleTrainer, handleRocket, handleRival,
    handlePotion, handleCandy, handleCenter, handleTM,
    handleBerry, handleEvo,
  ];
  var r = handlers[idx]();
  showResult(r.title, r.desc, r.spriteId);
  addLog(r.title);
  updateUI();
}

// ===== EVENT HANDLERS =====

function handleWild() {
  var tier = Math.min(3, Math.floor(game.currentGym / 2));
  var pool = WILD_POKEMON[tier];
  var t = pool[Math.floor(Math.random() * pool.length)];
  var lvl = 3 + game.currentGym * 4 + Math.floor(Math.random() * 3);

  if (game.party.length >= 6) {
    var r = levelUpRandom(1);
    return { title: 'Wild ' + t.name + ' appeared!', desc: 'Party is full! You battled it instead. ' + r.msg, spriteId: t.id };
  }
  if (Math.random() * 100 < t.catchRate) {
    game.party.push({
      name: t.name, type: t.type, id: t.id,
      level: lvl, evolutions: JSON.parse(JSON.stringify(t.evolutions)),
    });
    playCry(t.id);
    return { title: 'Wild ' + t.name + ' appeared!', desc: 'You threw a Pokeball... Gotcha! ' + t.name + ' was caught! (Lv.' + lvl + ')', spriteId: t.id };
  }
  return { title: 'Wild ' + t.name + ' appeared!', desc: 'You threw a Pokeball... Oh no! ' + t.name + ' broke free and fled!', spriteId: t.id };
}

function handleTrainer() {
  var r = levelUpRandom(Math.random() < 0.5 ? 1 : 2);
  return { title: '\u2694\uFE0F Trainer Battle!', desc: 'You defeated a trainer! ' + r.msg, spriteId: r.id };
}

function handleRocket() {
  var r = levelUpRandom(Math.random() < 0.5 ? 1 : 2);
  game.bag.potions++;
  return { title: '\u{1F680} Team Rocket appeared!', desc: '"Prepare for trouble!" You sent them blasting off! ' + r.msg + ' Found a Potion!', spriteId: r.id };
}

function handleRival() {
  var r = levelUpRandom(2 + Math.floor(Math.random() * 2));
  return { title: '\u{1F3C6} Rival Battle!', desc: 'Your rival Blue appeared! "Smell ya later!" You won! ' + r.msg, spriteId: r.id };
}

function handlePotion() {
  game.bag.potions++;
  return { title: '\u{1F48A} Found a Potion!', desc: 'You picked up a Potion! (Bag: ' + game.bag.potions + ') Useful for Gym battles!' };
}

function handleCandy() {
  if (!game.party.length) return { title: '\u{1F36C} Rare Candy!', desc: 'But you have no Pokemon!' };
  var p = game.party.reduce(function(a, b) { return a.level <= b.level ? a : b; });
  p.level++;
  var e = checkEvo(p);
  return { title: '\u{1F36C} Rare Candy!', desc: p.name + ' grew to Lv.' + p.level + '!' + e, spriteId: p.id };
}

function handleCenter() {
  var p = game.party.reduce(function(a, b) { return a.level <= b.level ? a : b; });
  p.level++;
  var e = checkEvo(p);
  return { title: '\u{1F3E5} Pokemon Center!', desc: 'Nurse Joy: "Your Pokemon are fighting fit!" ' + p.name + ' grew to Lv.' + p.level + '!' + e, spriteId: p.id };
}

function handleTM() {
  var move = TM_MOVES[Math.floor(Math.random() * TM_MOVES.length)];
  var p = game.party[Math.floor(Math.random() * game.party.length)];
  p.level += 2;
  var e = checkEvo(p);
  return { title: '\u{1F4BF} Found a TM!', desc: p.name + ' learned ' + move + '! Grew to Lv.' + p.level + '!' + e, spriteId: p.id };
}

function handleBerry() {
  game.bag.berries += 2;
  return { title: '\u{1F347} Berry Harvest!', desc: 'You gathered berries! (Bag: ' + game.bag.berries + ') They help in Gym battles!' };
}

function handleEvo() {
  for (var i = 0; i < game.party.length; i++) {
    var p = game.party[i];
    if (p.evolutions && p.evolutions.length && p.level >= p.evolutions[0].level) {
      var old = p.name;
      var ev = p.evolutions.shift();
      p.name = ev.name;
      p.id = ev.id;
      playCry(p.id);
      return { title: '\u2728 Evolution!', desc: 'What? ' + old + ' is evolving! Congratulations! It became ' + p.name + '!', spriteId: p.id };
    }
  }
  var r = levelUpRandom(1);
  return { title: '\u2728 Training Time!', desc: 'No Pokemon ready to evolve. Your team trained hard! ' + r.msg, spriteId: r.id };
}

// ===== HELPERS =====

function levelUpRandom(amt) {
  if (!game.party.length) return { msg: '', id: null };
  var p = game.party[Math.floor(Math.random() * game.party.length)];
  p.level += amt;
  var e = checkEvo(p);
  return { msg: p.name + ' grew to Lv.' + p.level + '!' + e, id: p.id };
}

function checkEvo(p) {
  if (p.evolutions && p.evolutions.length && p.level >= p.evolutions[0].level) {
    var old = p.name;
    var ev = p.evolutions.shift();
    p.name = ev.name;
    p.id = ev.id;
    playCry(p.id);
    return ' \u2728 ' + old + ' evolved into ' + p.name + '!';
  }
  return '';
}

function getTotalLevel() {
  return game.party.reduce(function(s, p) { return s + p.level; }, 0);
}

function addLog(msg) {
  game.log.unshift({ num: game.log.length + 1, text: msg });
}

// ===== NEW GAME =====

function newGame() {
  game = {
    phase: 'intro',
    party: [],
    badges: [],
    bag: { potions: 0, berries: 0 },
    currentGym: 0,
    spinsOnRoute: 0,
    totalSpins: 0,
    log: [],
  };
  currentAngle = 0;
  switchScreen('screen-intro');
}

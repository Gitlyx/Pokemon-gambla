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
}

// ===== ASYNC ANIMATION CHAIN =====

function runChain(fns, done) {
  var i = 0;
  function next() {
    if (i >= fns.length) { done(); return; }
    fns[i++](next);
  }
  next();
}

// ===== ROLL EVENT DISPATCH =====

function onRollComplete(idx) {
  game.totalRolls++;
  game.rollsOnRoute++;
  var handlers = [
    handleWild, handleTrainer, handleRival,
    handlePowerUp, handleSpecialTraining, handleEvo,
  ];
  var r = handlers[idx]();

  // Build animation queue
  var chain = [];

  if (r.caught) {
    chain.push(function(next) { showCatchAnimation(true, r.wildId, next); });
  } else if (r.escaped) {
    chain.push(function(next) { showCatchAnimation(false, r.wildId, next); });
  }

  if (r.evolved && r.evoData) {
    chain.push(function(next) { showEvoAnimation(r.evoData, next); });
  }

  // Hit-freeze: brief pause before reward display for impact
  var hitFreeze = chain.length > 0 ? 60 : 0;

  runChain(chain, function() {
    setTimeout(function() {
    showResult(r.title, r.desc, r.spriteId);
    addLog(r.title);
    updateUI();
    triggerTeamAnimations();

    // Auto-trigger gym after 3rd roll, or re-enable rolling
    if (game.rollsOnRoute >= 3 && game.phase === 'route' && game.currentGym < GYMS.length) {
      setRollDisabled(true);
      setTimeout(function() { challengeGym(); }, 1500);
    } else if (game.rollsOnRoute >= 3 && game.phase === 'elite4') {
      setRollDisabled(true);
      setTimeout(function() { challengeE4(); }, 1500);
    } else if (game.phase !== 'victory') {
      setRollDisabled(false);
    }
    }, hitFreeze);
  });
}

// ===== CATCH ANIMATION =====

function showCatchAnimation(caught, wildId, callback) {
  var overlay = document.getElementById('catchOverlay');
  overlay.innerHTML = '<div class="pokeball-anim" id="pokeballAnim"></div>';
  overlay.classList.add('active');

  var ball = document.getElementById('pokeballAnim');
  var shakes = 1 + Math.floor(Math.random() * 3); // 1-3 shakes
  var shakeIdx = 0;

  function doShake() {
    if (shakeIdx >= shakes) {
      if (caught) {
        SFX.catch();
        haptic([15, 50, 15]);
        screenShake();
        setTimeout(function() {
          overlay.classList.remove('active');
          callback();
        }, 400);
      } else {
        SFX.catchFail();
        haptic(15);
        ball.classList.add('breaking');
        setTimeout(function() {
          overlay.classList.remove('active');
          callback();
        }, 500);
      }
      return;
    }
    ball.classList.remove('shaking');
    void ball.offsetWidth; // force reflow
    ball.classList.add('shaking');
    SFX.shake();
    shakeIdx++;
    setTimeout(doShake, 500);
  }

  setTimeout(doShake, 300);
}

// ===== EVOLUTION ANIMATION =====

function showEvoAnimation(evoData, callback) {
  SFX.evolution();
  var flash = document.getElementById('evoFlash');
  flash.classList.remove('active');
  void flash.offsetWidth; // force reflow for re-trigger
  flash.classList.add('active');

  // Swap result sprite at midpoint if visible
  setTimeout(function() {
    if (evoData && evoData.newId) {
      var sprite = document.getElementById('resultSprite');
      if (sprite && sprite.classList.contains('visible')) {
        sprite.src = spriteUrl(evoData.newId);
      }
    }
  }, 500);

  setTimeout(function() {
    flash.classList.remove('active');
    callback();
  }, 1300);
}

// ===== TEAM ANIMATION TRIGGERS =====

function triggerTeamAnimations() {
  // Handled by updateTeamStrip diff in ui.js
}

// ===== EVENT HANDLERS =====

function handleWild() {
  var tier = Math.min(3, Math.floor(game.currentGym / 2));
  var pool = WILD_POKEMON[tier];
  var t = pool[Math.floor(Math.random() * pool.length)];
  var lvl = 3 + game.currentGym * 4 + Math.floor(Math.random() * 3);

  if (game.party.length >= 6) {
    var r = levelUpRandom(1);
    var result = { title: 'Wild ' + t.name + ' appeared!', desc: 'Party is full! You battled it instead. ' + r.msg, spriteId: t.id };
    if (r.leveledUp) result.leveledUp = true;
    if (r.evolved) { result.evolved = true; result.evoData = r.evoData; }
    return result;
  }
  if (Math.random() * 100 < t.catchRate) {
    game.party.push({
      name: t.name, type: t.type, id: t.id,
      level: lvl, evolutions: JSON.parse(JSON.stringify(t.evolutions)),
    });
    playCry(t.id);
    return { title: 'Wild ' + t.name + ' appeared!', desc: 'You threw a Pokeball... Gotcha! ' + t.name + ' was caught! (Lv.' + lvl + ')', spriteId: t.id, caught: true, wildId: t.id };
  }
  return { title: 'Wild ' + t.name + ' appeared!', desc: 'You threw a Pokeball... Oh no! ' + t.name + ' broke free and fled!', spriteId: t.id, escaped: true, wildId: t.id };
}

function handleTrainer() {
  var isRocket = Math.random() < 0.2;
  var amt = Math.random() < 0.5 ? 1 : 2;
  if (isRocket) amt++;
  var r = levelUpRandom(amt);
  var result;
  if (isRocket) {
    result = { title: '\u{1F680} Team Rocket appeared!', desc: '"Prepare for trouble!" You sent them blasting off! ' + r.msg, spriteId: r.id };
  } else {
    result = { title: '\u2694\uFE0F Trainer Battle!', desc: 'You defeated a trainer! ' + r.msg, spriteId: r.id };
  }
  if (r.leveledUp) result.leveledUp = true;
  if (r.evolved) { result.evolved = true; result.evoData = r.evoData; }
  return result;
}

function handleRival() {
  var r = levelUpRandom(2 + Math.floor(Math.random() * 2));
  var result = { title: '\u{1F3C6} Rival Battle!', desc: 'Your rival Blue appeared! "Smell ya later!" You won! ' + r.msg, spriteId: r.id };
  if (r.leveledUp) result.leveledUp = true;
  if (r.evolved) { result.evolved = true; result.evoData = r.evoData; }
  return result;
}

function handlePowerUp() {
  if (!game.party.length) return { title: '\u2B50 Power Up!', desc: 'But you have no Pokemon!' };
  var p = game.party.reduce(function(a, b) { return a.level <= b.level ? a : b; });
  p.level++;
  var e = checkEvo(p);
  var flavors = [
    'Nurse Joy: "Your Pokemon are fighting fit!" ',
    'You found a Rare Candy! ',
    'A kind trainer shared some supplies! ',
  ];
  var flavor = flavors[Math.floor(Math.random() * flavors.length)];
  var result = { title: '\u2B50 Power Up!', desc: flavor + p.name + ' grew to Lv.' + p.level + '!' + e.text, spriteId: p.id, leveledUp: true };
  if (e.evolved) { result.evolved = true; result.evoData = e; }
  return result;
}

function handleSpecialTraining() {
  var move = TM_MOVES[Math.floor(Math.random() * TM_MOVES.length)];
  var p = game.party[Math.floor(Math.random() * game.party.length)];
  p.level += 2;
  var e = checkEvo(p);
  var result = { title: '\u{1F4BF} Special Training!', desc: p.name + ' learned ' + move + '! Grew to Lv.' + p.level + '!' + e.text, spriteId: p.id, leveledUp: true };
  if (e.evolved) { result.evolved = true; result.evoData = e; }
  return result;
}

function handleEvo() {
  for (var i = 0; i < game.party.length; i++) {
    var p = game.party[i];
    if (p.evolutions && p.evolutions.length && p.level >= p.evolutions[0].level) {
      var oldName = p.name;
      var oldId = p.id;
      var ev = p.evolutions.shift();
      p.name = ev.name;
      p.id = ev.id;
      playCry(p.id);
      return { title: '\u2728 Evolution!', desc: 'What? ' + oldName + ' is evolving! Congratulations! It became ' + p.name + '!', spriteId: p.id, evolved: true, evoData: { oldId: oldId, newId: p.id } };
    }
  }
  var r = levelUpRandom(1);
  var result = { title: '\u2728 Training Time!', desc: 'No Pokemon ready to evolve. Your team trained hard! ' + r.msg, spriteId: r.id };
  if (r.leveledUp) result.leveledUp = true;
  if (r.evolved) { result.evolved = true; result.evoData = r.evoData; }
  return result;
}

// ===== HELPERS =====

function levelUpRandom(amt) {
  if (!game.party.length) return { msg: '', id: null };
  var p = game.party[Math.floor(Math.random() * game.party.length)];
  p.level += amt;
  var e = checkEvo(p);
  var result = { msg: p.name + ' grew to Lv.' + p.level + '!' + e.text, id: p.id, leveledUp: true };
  if (e.evolved) { result.evolved = true; result.evoData = e; }
  return result;
}

function checkEvo(p) {
  if (p.evolutions && p.evolutions.length && p.level >= p.evolutions[0].level) {
    var oldName = p.name;
    var oldId = p.id;
    var ev = p.evolutions.shift();
    p.name = ev.name;
    p.id = ev.id;
    playCry(p.id);
    return { evolved: true, text: ' \u2728 ' + oldName + ' evolved into ' + p.name + '!', oldId: oldId, newId: p.id };
  }
  return { evolved: false, text: '', oldId: null, newId: null };
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
    currentGym: 0,
    rollsOnRoute: 0,
    totalRolls: 0,
    log: [],
  };
  prevTeamState = [];
  switchScreen('screen-intro');
}

// ===== GYM BATTLES =====

function challengeGym() {
  var gym = GYMS[game.currentGym];
  var eff = getTotalLevel();
  var wc = eff >= gym.threshold ? 85 : eff >= gym.threshold * 0.8 ? 60 : eff >= gym.threshold * 0.6 ? 35 : 15;
  var won = Math.random() * 100 < wc;
  showGymOverlay(gym, won);
}

var gymDismissTimer = null;

function showGymOverlay(gym, won) {
  var o = document.getElementById('gymOverlay');
  var playerLead = game.party[0];
  var playerSpriteId = playerLead ? playerLead.id : 1;
  var playerName = playerLead ? playerLead.name : 'Pokemon';

  o.innerHTML =
    '<div class="gym-panel">' +
      '<h2>' + gym.city + ' Gym</h2>' +
      '<div class="gym-subtitle">' + gym.leader + ' \u2014 ' + gym.type + ' Type</div>' +
      '<div class="gym-faceoff">' +
        '<div class="faceoff-pokemon">' +
          '<img class="faceoff-sprite" id="faceoffPlayer" src="' + spriteUrl(playerSpriteId) + '" alt="' + playerName + '" onerror="this.style.display=\'none\'">' +
          '<div class="faceoff-name">' + playerName + '</div>' +
          '<div class="faceoff-hp-bar"><div class="faceoff-hp-fill" id="hpPlayer"></div></div>' +
        '</div>' +
        '<div class="faceoff-vs">VS</div>' +
        '<div class="faceoff-pokemon">' +
          '<img class="faceoff-sprite" id="faceoffGym" src="' + spriteUrl(gym.pokemonId) + '" alt="' + gym.leader + '" style="transform:scaleX(-1)" onerror="this.style.display=\'none\'">' +
          '<div class="faceoff-name">' + gym.leader + '</div>' +
          '<div class="faceoff-hp-bar"><div class="faceoff-hp-fill" id="hpGym"></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="gym-dialogue" id="gd">' + gym.intro + '</div>' +
      '<div class="gym-result" id="gr" style="display:none"></div>' +
      '<div id="gbr" style="display:none"></div>' +
    '</div>';
  o.classList.add('active');
  playCry(gym.pokemonId);

  // Tap overlay to dismiss early
  o.onclick = function() { dismissGym(won); };

  // Attack animation timeline
  setTimeout(function() {
    var attacker = document.getElementById(won ? 'faceoffPlayer' : 'faceoffGym');
    if (attacker) attacker.classList.add('attacking');
  }, 800);

  setTimeout(function() {
    var defender = document.getElementById(won ? 'faceoffGym' : 'faceoffPlayer');
    var defenderHp = document.getElementById(won ? 'hpGym' : 'hpPlayer');
    if (defender) defender.classList.add('hit');
    if (defenderHp) {
      defenderHp.style.width = '0%';
      defenderHp.classList.add('low');
    }
  }, 1100);

  setTimeout(function() {
    var gr = document.getElementById('gr');
    if (!gr) return;
    gr.style.display = 'block';
    if (won) {
      gr.className = 'gym-result win';
      gr.textContent = 'YOU WIN!';
      SFX.gymWin();
      document.getElementById('gd').textContent = gym.win;
      var b = document.getElementById('gbr');
      b.style.display = 'block';
      b.className = 'gym-badge-reward';
      b.textContent = gym.badge + ' Badge earned!';
      gymDismissTimer = setTimeout(function() { dismissGym(won); }, 2500);
    } else {
      gr.className = 'gym-result lose';
      gr.textContent = 'DEFEATED...';
      SFX.gymLoss();
      document.getElementById('gd').textContent = "Your team wasn't strong enough! Keep training and come back!";
      gymDismissTimer = setTimeout(function() { dismissGym(won); }, 2000);
    }
  }, 2000);
}

function dismissGym(won) {
  if (gymDismissTimer) { clearTimeout(gymDismissTimer); gymDismissTimer = null; }
  var o = document.getElementById('gymOverlay');
  if (!o.classList.contains('active')) return;
  o.classList.remove('active');
  o.onclick = null;

  var anyEvolved = false;
  var lastEvoData = null;

  if (won) {
    var gym = GYMS[game.currentGym];
    game.badges.push({ name: gym.badge, pokemonId: gym.pokemonId });
    game.currentGym++;
    game.rollsOnRoute = 0;
    addLog(gym.badge + ' Badge earned! Defeated ' + gym.leader + '!');
    game.party.forEach(function(p) {
      p.level += 2;
      var e = checkEvo(p);
      if (e.evolved) {
        anyEvolved = true;
        lastEvoData = e;
      }
    });
    if (game.currentGym >= GYMS.length) {
      game.phase = 'elite4';
      addLog('All 8 badges collected! The Elite Four await!');
    }
  } else {
    game.rollsOnRoute = 1;
    addLog('Lost to ' + GYMS[game.currentGym].leader + '... Need more training!');
  }

  if (anyEvolved && lastEvoData) {
    showEvoAnimation(lastEvoData, function() {
      updateUI();
      setRollDisabled(false);
    });
  } else {
    updateUI();
    setRollDisabled(false);
  }
}

// ===== ELITE FOUR =====

function challengeE4() {
  var eff = getTotalLevel();
  var won = eff >= E4_THRESHOLD || Math.random() * 100 < 40;
  showE4Overlay(won);
}

function showE4Overlay(won) {
  var o = document.getElementById('gymOverlay');
  o.innerHTML =
    '<div class="gym-panel">' +
      '<img class="gym-pokemon-art" src="' + artworkUrl(149) + '" alt="Elite Four" onerror="this.style.display=\'none\'">' +
      '<h2>The Elite Four</h2>' +
      '<div class="gym-subtitle">Indigo Plateau \u2014 Final Challenge</div>' +
      '<div class="gym-dialogue" id="gd">The strongest trainers in Kanto await...</div>' +
      '<div id="e4art"></div>' +
      '<div class="gym-result" id="gr" style="display:none"></div>' +
      '<button class="continue-btn" id="gc" style="display:none">Continue</button>' +
    '</div>';
  o.classList.add('active');

  var delay = 1000;
  ELITE_FOUR.forEach(function(m, i) {
    setTimeout(function() {
      var gd = document.getElementById('gd');
      var artEl = document.getElementById('e4art');
      if (!gd || !artEl) return;
      if (won || i < ELITE_FOUR.length - 1) {
        gd.textContent = m.name + ' (' + m.type + ')... Defeated!';
      } else {
        gd.textContent = m.name + ' was too powerful!';
      }
      artEl.innerHTML = '<img class="e4-pokemon-art" src="' + artworkUrl(m.pokemonId) + '" onerror="this.style.display=\'none\'">';
      playCry(m.pokemonId);
    }, delay + i * 800);
  });

  setTimeout(function() {
    var gr = document.getElementById('gr');
    var gc = document.getElementById('gc');
    if (!gr || !gc) return;
    gr.style.display = 'block';
    if (won) {
      gr.className = 'gym-result win';
      gr.textContent = 'YOU ARE THE CHAMPION!';
      SFX.gymWin();
      gc.onclick = showVictory;
    } else {
      gr.className = 'gym-result lose';
      gr.textContent = 'DEFEATED...';
      SFX.gymLoss();
      var gd = document.getElementById('gd');
      if (gd) gd.textContent += ' Keep training and try again!';
      gc.onclick = function() {
        o.classList.remove('active');
        game.rollsOnRoute = 1;
        addLog('Lost to the Elite Four...');
        updateUI();
        setRollDisabled(false);
      };
    }
    gc.style.display = 'inline-block';
  }, delay + ELITE_FOUR.length * 800 + 500);
}

// ===== VICTORY =====

function showVictory() {
  document.getElementById('gymOverlay').classList.remove('active');
  game.phase = 'victory';

  var team = game.party.map(function(p) {
    return '<div class="hof-pokemon">' +
      '<img class="hof-art" src="' + artworkUrl(p.id) + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' +
      '<div class="hof-name">' + p.name + '</div>' +
      '<div class="hof-level">Lv.' + p.level + '</div>' +
    '</div>';
  }).join('');

  var badgeSprites = game.badges.map(function(b) {
    return '<img src="' + spriteUrl(b.pokemonId) + '" style="width:36px;height:36px;image-rendering:pixelated" onerror="this.style.display=\'none\'">';
  }).join(' ');

  document.getElementById('screen-victory').innerHTML =
    '<div class="victory-content">' +
      '<h1>\u{1F3C6} HALL OF FAME \u{1F3C6}</h1>' +
      '<h2>Congratulations, Champion Red!</h2>' +
      '<div class="hall-of-fame"><div class="hof-team" id="hofTeam">' + team + '</div></div>' +
      '<div class="victory-badges" id="victoryBadges" style="opacity:0;transition:opacity 0.5s">' + badgeSprites + '</div>' +
      '<p id="victoryStats" style="color:#a0c4ff;font-size:9px;margin-top:18px;line-height:2;opacity:0;transition:opacity 0.5s">Total rolls: ' + game.totalRolls + ' | Pokemon caught: ' + game.party.length + '</p>' +
      '<button class="continue-btn" id="victoryNewGame" style="margin-top:20px;opacity:0;transition:opacity 0.5s" onclick="newGame()">New Game</button>' +
    '</div>';

  switchScreen('screen-victory');

  // Sequential reveal of Hall of Fame pokemon
  var hofPokemon = document.querySelectorAll('#hofTeam .hof-pokemon');
  var revealDelay = 800;
  game.party.forEach(function(p, i) {
    setTimeout(function() {
      if (hofPokemon[i]) {
        hofPokemon[i].classList.add('revealing');
        SFX.hofReveal();
        playCry(p.id);
      }
    }, revealDelay + i * 1200);
  });

  // After all revealed, show badges/stats/button + confetti
  var afterAllRevealed = revealDelay + game.party.length * 1200 + 500;
  setTimeout(function() {
    var badges = document.getElementById('victoryBadges');
    var stats = document.getElementById('victoryStats');
    var btn = document.getElementById('victoryNewGame');
    if (badges) badges.style.opacity = '1';
    if (stats) stats.style.opacity = '1';
    if (btn) btn.style.opacity = '1';
    launchConfetti();
  }, afterAllRevealed);
}

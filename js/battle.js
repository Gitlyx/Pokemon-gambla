// ===== GYM BATTLES =====

function challengeGym() {
  var gym = GYMS[game.currentGym];
  var eff = getTotalLevel() + game.bag.potions * 5 + game.bag.berries * 3;
  var wc = eff >= gym.threshold ? 85 : eff >= gym.threshold * 0.8 ? 60 : eff >= gym.threshold * 0.6 ? 35 : 15;
  var won = Math.random() * 100 < wc;
  game.bag.potions = 0;
  game.bag.berries = 0;
  showGymOverlay(gym, won);
}

function showGymOverlay(gym, won) {
  var o = document.getElementById('gymOverlay');
  o.innerHTML =
    '<div class="gym-panel">' +
      '<img class="gym-pokemon-art" src="' + artworkUrl(gym.pokemonId) + '" alt="' + gym.leader + ' Pokemon" onerror="this.style.display=\'none\'">' +
      '<h2>' + gym.city + ' Gym</h2>' +
      '<div class="gym-subtitle">' + gym.leader + ' \u2014 ' + gym.type + ' Type</div>' +
      '<div class="gym-dialogue" id="gd">' + gym.intro + '</div>' +
      '<div class="gym-result" id="gr" style="display:none"></div>' +
      '<div id="gbr" style="display:none"></div>' +
      '<button class="continue-btn" id="gc" style="display:none" onclick="closeGym(' + won + ')">Continue</button>' +
    '</div>';
  o.classList.add('active');
  playCry(gym.pokemonId);

  setTimeout(function() {
    var gr = document.getElementById('gr');
    gr.style.display = 'block';
    if (won) {
      gr.className = 'gym-result win';
      gr.textContent = 'YOU WIN!';
      setTimeout(function() {
        document.getElementById('gd').textContent = gym.win;
        var b = document.getElementById('gbr');
        b.style.display = 'block';
        b.className = 'gym-badge-reward';
        b.textContent = gym.badge + ' Badge earned!';
        document.getElementById('gc').style.display = 'inline-block';
      }, 1000);
    } else {
      gr.className = 'gym-result lose';
      gr.textContent = 'DEFEATED...';
      setTimeout(function() {
        document.getElementById('gd').textContent = "Your team wasn't strong enough! Keep training and come back!";
        document.getElementById('gc').style.display = 'inline-block';
      }, 1000);
    }
  }, 1500);
}

function closeGym(won) {
  document.getElementById('gymOverlay').classList.remove('active');
  if (won) {
    var gym = GYMS[game.currentGym];
    game.badges.push({ name: gym.badge, pokemonId: gym.pokemonId });
    game.currentGym++;
    game.spinsOnRoute = 0;
    addLog(gym.badge + ' Badge earned! Defeated ' + gym.leader + '!');
    game.party.forEach(function(p) { p.level += 2; checkEvo(p); });
    if (game.currentGym >= GYMS.length) {
      game.phase = 'elite4';
      addLog('All 8 badges collected! The Elite Four await!');
    }
  } else {
    addLog('Lost to ' + GYMS[game.currentGym].leader + '... Need more training!');
  }
  updateUI();
}

// ===== ELITE FOUR =====

function challengeE4() {
  var eff = getTotalLevel() + game.bag.potions * 5 + game.bag.berries * 3;
  var won = eff >= E4_THRESHOLD || Math.random() * 100 < 40;
  game.bag.potions = 0;
  game.bag.berries = 0;
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

  var delay = 1500;
  ELITE_FOUR.forEach(function(m, i) {
    setTimeout(function() {
      var gd = document.getElementById('gd');
      var artEl = document.getElementById('e4art');
      if (won || i < ELITE_FOUR.length - 1) {
        gd.textContent = m.name + ' (' + m.type + ')... Defeated!';
      } else {
        gd.textContent = m.name + ' was too powerful!';
      }
      artEl.innerHTML = '<img class="e4-pokemon-art" src="' + artworkUrl(m.pokemonId) + '" onerror="this.style.display=\'none\'">';
      playCry(m.pokemonId);
    }, delay + i * 1200);
  });

  setTimeout(function() {
    var gr = document.getElementById('gr');
    gr.style.display = 'block';
    var gc = document.getElementById('gc');
    if (won) {
      gr.className = 'gym-result win';
      gr.textContent = 'YOU ARE THE CHAMPION!';
      gc.onclick = showVictory;
    } else {
      gr.className = 'gym-result lose';
      gr.textContent = 'DEFEATED...';
      document.getElementById('gd').textContent += ' Keep training and try again!';
      gc.onclick = function() {
        o.classList.remove('active');
        addLog('Lost to the Elite Four...');
        updateUI();
      };
    }
    gc.style.display = 'inline-block';
  }, delay + ELITE_FOUR.length * 1200 + 500);
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
      '<div class="hall-of-fame"><div class="hof-team">' + team + '</div></div>' +
      '<div class="victory-badges">' + badgeSprites + '</div>' +
      '<p style="color:#a0c4ff;font-size:9px;margin-top:18px;line-height:2">Total spins: ' + game.totalSpins + ' | Pokemon caught: ' + game.party.length + '</p>' +
      '<button class="continue-btn" style="margin-top:20px" onclick="newGame()">New Game</button>' +
    '</div>';

  switchScreen('screen-victory');
  launchConfetti();
}

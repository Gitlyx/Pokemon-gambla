// ===== SCREEN MANAGEMENT =====

function switchScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}

// ===== RESULT DISPLAY =====

function showResult(t, d, sid) {
  var sprite = document.getElementById('resultSprite');
  if (sid) {
    sprite.src = spriteUrl(sid);
    sprite.className = 'result-sprite visible';
    sprite.onerror = function() { this.className = 'result-sprite'; };
  } else {
    sprite.className = 'result-sprite';
  }
  document.getElementById('eventName').textContent = t;
  document.getElementById('eventDesc').textContent = d;
  document.getElementById('result').classList.add('visible');
}

// ===== UI UPDATE =====

function updateUI() {
  updateLocation();
  updateProgress();
  updateButtons();
  updateSidebar();
  updateLog();
}

function updateLocation() {
  var loc = game.currentGym < ROUTES.length ? ROUTES[game.currentGym] : ROUTES[ROUTES.length - 1];
  document.getElementById('location').textContent = loc;
}

function updateProgress() {
  var gp = document.getElementById('gymProgress');
  if (game.phase === 'elite4') {
    gp.textContent = 'All 8 badges earned! Challenge the Elite Four!';
    gp.style.color = '#FFD700';
  } else if (game.spinsOnRoute < 3) {
    var left = 3 - game.spinsOnRoute;
    gp.textContent = 'Spin ' + left + ' more time' + (left !== 1 ? 's' : '') + ' before the Gym!';
    gp.style.color = '#a0c4ff';
  } else {
    var gym = GYMS[game.currentGym];
    gp.textContent = gym.leader + ' is waiting at ' + gym.city + ' Gym!';
    gp.style.color = '#4CAF50';
  }
}

function updateButtons() {
  var br = document.getElementById('buttonRow');
  var bh = '<button class="spin-btn" onclick="spin()">Spin!</button>';
  if (game.phase === 'elite4') {
    bh += ' <button class="e4-btn" onclick="challengeE4()">Elite Four!</button>';
  } else if (game.spinsOnRoute >= 3 && game.currentGym < GYMS.length) {
    bh += ' <button class="gym-btn" onclick="challengeGym()">Challenge ' + GYMS[game.currentGym].leader + '!</button>';
  }
  br.innerHTML = bh;
}

function updateSidebar() {
  var sb = document.getElementById('sidebarLeft');

  // Badges
  var badgeH = '';
  for (var i = 0; i < 8; i++) {
    if (i < game.badges.length) {
      badgeH += '<div class="badge-slot earned"><img src="' + spriteUrl(game.badges[i].pokemonId) +
        '" style="width:32px;height:32px;image-rendering:pixelated" onerror="this.outerHTML=\'&#x2B50;\'"></div>';
    } else {
      badgeH += '<div class="badge-slot" style="color:#444">?</div>';
    }
  }

  // Party
  var partyH = '';
  game.party.forEach(function(p) {
    var tc = TYPE_COLORS[p.type] || '#888';
    partyH +=
      '<div class="party-member">' +
        '<img class="pm-sprite" src="' + spriteUrl(p.id) + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' +
        '<div class="pm-info">' +
          '<div class="pm-name">' + p.name + '</div>' +
          '<div class="pm-level">Lv.' + p.level + ' <span class="pm-type" style="background:' + tc + '">' + p.type + '</span></div>' +
        '</div>' +
      '</div>';
  });

  sb.innerHTML =
    '<h3>Trainer Red</h3>' +
    '<h4>Badges (' + game.badges.length + '/8)</h4>' +
    '<div class="badge-grid">' + badgeH + '</div>' +
    '<h4>Party (' + game.party.length + '/6)</h4>' +
    (partyH || '<div style="color:#666;font-size:8px">No Pokemon yet</div>') +
    '<h4>Bag</h4>' +
    '<div class="bag-item"><img class="bag-icon" src="' + ITEM_BASE + 'potion.png" onerror="this.outerHTML=\'&#x1F48A;\'"> Potions <span class="count">x' + game.bag.potions + '</span></div>' +
    '<div class="bag-item"><img class="bag-icon" src="' + ITEM_BASE + 'oran-berry.png" onerror="this.outerHTML=\'&#x1F347;\'"> Berries <span class="count">x' + game.bag.berries + '</span></div>' +
    '<div class="stat-line">Total level: ' + getTotalLevel() + '<br>Total spins: ' + game.totalSpins + '</div>';
}

function updateLog() {
  var logEl = document.getElementById('log');
  logEl.innerHTML = game.log.slice(0, 50).map(function(e) {
    return '<div class="log-entry"><span class="log-num">#' + e.num + '</span> ' + e.text + '</div>';
  }).join('');
}

// ===== STARS BACKGROUND =====

function createStars() {
  var c = document.getElementById('stars');
  for (var i = 0; i < 80; i++) {
    var s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 2 + 's';
    s.style.width = s.style.height = (Math.random() * 2 + 1) + 'px';
    c.appendChild(s);
  }
}

// ===== CONFETTI =====

function launchConfetti() {
  var colors = ['#ffcb05','#f44336','#4CAF50','#2196F3','#FF9800','#9C27B0','#E91E63'];
  for (var i = 0; i < 60; i++) {
    var el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (2 + Math.random() * 3) + 's';
    el.style.animationDelay = Math.random() * 2 + 's';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    el.style.width = (6 + Math.random() * 8) + 'px';
    el.style.height = (6 + Math.random() * 8) + 'px';
    document.body.appendChild(el);
  }
  setTimeout(function() {
    document.querySelectorAll('.confetti').forEach(function(el) { el.remove(); });
  }, 6000);
}

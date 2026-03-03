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
  updateHeader();
  updateGymCountdown();
  updateTeamStrip();
  updateButtons();
  updateLog();
}

function updateHeader() {
  var loc = game.currentGym < ROUTES.length ? ROUTES[game.currentGym] : ROUTES[ROUTES.length - 1];
  document.getElementById('headerRoute').textContent = loc;
  document.getElementById('headerBadges').textContent = game.badges.length + '/8';
}

function updateGymCountdown() {
  var textEl = document.getElementById('gymCountdownText');
  var fillEl = document.getElementById('gymProgressFill');
  if (!textEl || !fillEl) return;

  var rolls = Math.min(game.rollsOnRoute, 3);
  var pct = (rolls / 3) * 100;

  if (game.phase === 'elite4') {
    if (game.rollsOnRoute >= 3) {
      textEl.textContent = 'Elite Four challenge incoming...';
      textEl.style.color = '#FFD700';
    } else {
      var left = 3 - game.rollsOnRoute;
      textEl.textContent = left + ' roll' + (left !== 1 ? 's' : '') + ' until Elite Four!';
      textEl.style.color = '#FFD700';
    }
  } else if (game.rollsOnRoute < 3) {
    var left = 3 - game.rollsOnRoute;
    var gym = GYMS[game.currentGym];
    textEl.textContent = left + ' roll' + (left !== 1 ? 's' : '') + ' until ' + gym.city + ' Gym!';
    textEl.style.color = '#a0c4ff';
  } else {
    var gym = GYMS[game.currentGym];
    textEl.textContent = gym.leader + ' challenge incoming...';
    textEl.style.color = '#4CAF50';
  }

  fillEl.style.width = pct + '%';
  fillEl.classList.toggle('full', pct >= 100);
}

function updateButtons() {
  var btn = document.getElementById('rollBtn');
  if (!btn) return;
  if (game.phase === 'victory') {
    btn.disabled = true;
    btn.textContent = 'Champion!';
  } else {
    btn.textContent = 'Roll!';
  }
}

var prevTeamState = [];

function updateTeamStrip() {
  var strip = document.getElementById('teamStrip');
  if (!strip) return;

  // Snapshot previous state for diff
  var oldState = prevTeamState.slice();

  // Build new HTML
  strip.innerHTML = game.party.map(function(p) {
    var tc = TYPE_COLORS[p.type] || '#888';
    return '<div class="team-member" data-id="' + p.id + '" data-level="' + p.level + '" style="border:2px solid ' + tc + '">' +
      '<img class="team-sprite" src="' + spriteUrl(p.id) + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">' +
      '<div class="team-name">' + p.name + '</div>' +
      '<div class="team-level" style="color:' + tc + '">Lv.' + p.level + '</div>' +
    '</div>';
  }).join('');

  // Diff and animate
  var members = strip.querySelectorAll('.team-member');
  var hasNewSlot = game.party.length > oldState.length;

  game.party.forEach(function(p, i) {
    var el = members[i];
    if (!el) return;
    var old = oldState[i];
    if (!old) {
      // New slot — bounce in, shift existing members
      el.classList.add('bounce-in');
      if (hasNewSlot) {
        for (var j = 0; j < i; j++) {
          if (members[j]) members[j].classList.add('shifting');
        }
      }
    } else if (old.id !== p.id) {
      // Different pokemon (evolved) — bounce in
      el.classList.add('bounce-in');
    } else if (old.level < p.level) {
      // Level up — pulse + floating text
      el.classList.add('level-pulse');
      SFX.levelUp();
      spawnFloatLevel(el, p.level);
    }
  });

  // Save current state for next diff
  prevTeamState = game.party.map(function(p) {
    return { id: p.id, level: p.level };
  });
}

function updateLog() {
  var logEl = document.getElementById('log');
  if (!logEl) return;
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

// ===== FLOATING LEVEL TEXT =====

function spawnFloatLevel(el, level) {
  var rect = el.getBoundingClientRect();
  var f = document.createElement('div');
  f.className = 'float-level';
  f.textContent = 'Lv.' + level;
  f.style.left = (rect.left + rect.width / 2 - 20) + 'px';
  f.style.top = (rect.top - 4) + 'px';
  document.body.appendChild(f);
  setTimeout(function() { f.remove(); }, 900);
}

// ===== SCREEN SHAKE =====

function screenShake() {
  var col = document.querySelector('.game-column');
  if (!col) return;
  col.classList.remove('shaking');
  void col.offsetWidth;
  col.classList.add('shaking');
  setTimeout(function() { col.classList.remove('shaking'); }, 250);
}

// ===== HAPTIC FEEDBACK =====

function haptic(pattern) {
  if (typeof SFX !== 'undefined' && SFX.isMuted()) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
}

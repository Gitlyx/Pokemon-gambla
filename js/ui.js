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
  var el = document.getElementById('gymCountdown');
  if (game.phase === 'elite4') {
    if (game.rollsOnRoute >= 3) {
      el.textContent = 'Elite Four challenge incoming...';
      el.style.color = '#FFD700';
    } else {
      var left = 3 - game.rollsOnRoute;
      el.textContent = left + ' roll' + (left !== 1 ? 's' : '') + ' until Elite Four!';
      el.style.color = '#FFD700';
    }
  } else if (game.rollsOnRoute < 3) {
    var left = 3 - game.rollsOnRoute;
    var gym = GYMS[game.currentGym];
    el.textContent = left + ' roll' + (left !== 1 ? 's' : '') + ' until ' + gym.city + ' Gym!';
    el.style.color = '#a0c4ff';
  } else {
    var gym = GYMS[game.currentGym];
    el.textContent = gym.leader + ' challenge incoming...';
    el.style.color = '#4CAF50';
  }
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
  game.party.forEach(function(p, i) {
    var el = members[i];
    if (!el) return;
    var old = oldState[i];
    if (!old) {
      // New slot — bounce in
      el.classList.add('bounce-in');
    } else if (old.id !== p.id) {
      // Different pokemon (caught new or evolved) — bounce in
      el.classList.add('bounce-in');
    } else if (old.level < p.level) {
      // Level up — pulse
      el.classList.add('level-pulse');
      SFX.levelUp();
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

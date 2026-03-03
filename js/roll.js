// ===== CARD-FLIP ROLL =====

var rolling = false;
var pendingChoices = [];

function roll() {
  if (rolling) return;
  rolling = true;
  setRollDisabled(true);
  document.getElementById('result').classList.remove('visible');

  var card = document.getElementById('rollCard');
  card.classList.add('flipped');
  SFX.flip();
  spawnFlipSparkles(card);

  // Pick 2 distinct outcomes from weighted array
  var idx1 = ROLL_WEIGHTS[Math.floor(Math.random() * ROLL_WEIGHTS.length)];
  var idx2;
  do {
    idx2 = ROLL_WEIGHTS[Math.floor(Math.random() * ROLL_WEIGHTS.length)];
  } while (idx2 === idx1);

  // Show "?" on card back while choosing
  var back = document.getElementById('cardBack');
  back.style.background = '#333';
  back.querySelector('.card-back-label').textContent = 'Choose!';

  setTimeout(function() {
    showChoices(idx1, idx2);
  }, 400);
}

function showChoices(idx1, idx2) {
  pendingChoices = [idx1, idx2];
  var c0 = document.getElementById('choice0');
  var c1 = document.getElementById('choice1');
  document.getElementById('choiceLabel0').textContent = ROLL_EVENTS[idx1].name;
  document.getElementById('choiceLabel1').textContent = ROLL_EVENTS[idx2].name;
  c0.style.background = ROLL_EVENTS[idx1].color;
  c1.style.background = ROLL_EVENTS[idx2].color;
  document.getElementById('choiceContainer').classList.add('visible');
}

function pickChoice(n) {
  var idx = pendingChoices[n];
  document.getElementById('choiceContainer').classList.remove('visible');

  // Update card back to show chosen event
  var back = document.getElementById('cardBack');
  back.style.background = ROLL_EVENTS[idx].color;
  back.querySelector('.card-back-label').textContent = ROLL_EVENTS[idx].name;

  rolling = false;

  // Flip card back after brief pause
  var card = document.getElementById('rollCard');
  setTimeout(function() {
    card.classList.remove('flipped');
  }, 1000);

  // onRollComplete now handles re-enabling via async chain
  onRollComplete(idx);
}

function setRollDisabled(d) {
  var btn = document.getElementById('rollBtn');
  if (btn) btn.disabled = d;
  var card = document.getElementById('rollCard');
  if (card) card.style.pointerEvents = d ? 'none' : 'auto';
  if (d) document.getElementById('choiceContainer').classList.remove('visible');
}

function getRollResult() {
  return ROLL_WEIGHTS[Math.floor(Math.random() * ROLL_WEIGHTS.length)];
}

function spawnFlipSparkles(card) {
  var rect = card.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;
  for (var i = 0; i < 8; i++) {
    var angle = (Math.PI * 2 / 8) * i + (Math.random() - 0.5) * 0.5;
    var dist = 40 + Math.random() * 40;
    var s = document.createElement('div');
    s.className = 'flip-sparkle';
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    s.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
    document.body.appendChild(s);
    (function(el) {
      setTimeout(function() { el.remove(); }, 600);
    })(s);
  }
}

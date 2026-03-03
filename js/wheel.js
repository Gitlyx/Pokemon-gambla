// ===== WHEEL DRAWING & SPINNING =====

var canvas = document.getElementById('wheel');
var ctx = canvas.getContext('2d');
var currentAngle = 0;
var spinning = false;

function drawWheel() {
  var cx = canvas.width / 2;
  var cy = canvas.height / 2;
  var r = cx - 4;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < NUM_SLICES; i++) {
    var sa = currentAngle + i * ARC;
    var ea = sa + ARC;

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, sa, ea);
    ctx.closePath();
    ctx.fillStyle = WHEEL_EVENTS[i].color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sa + ARC / 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 4;
    ctx.fillText(WHEEL_EVENTS[i].name, r - 14, 4);
    ctx.restore();
  }

  // Pokeball center
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Top half red
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 24, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = '#ff1a1a';
  ctx.fill();
  ctx.restore();

  // Center line
  ctx.beginPath();
  ctx.moveTo(cx - 26, cy);
  ctx.lineTo(cx + 26, cy);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Center button
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function spin() {
  if (spinning) return;
  spinning = true;
  setButtonsDisabled(true);
  document.getElementById('result').classList.remove('visible');

  var dur = 3500 + Math.random() * 2000;
  var rot = (5 + Math.random() * 5) * 2 * Math.PI;
  var sa = currentAngle;
  var st = performance.now();

  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function anim(now) {
    var p = Math.min((now - st) / dur, 1);
    currentAngle = sa + rot * ease(p);
    drawWheel();
    if (p < 1) {
      requestAnimationFrame(anim);
    } else {
      spinning = false;
      setButtonsDisabled(false);
      onSpinComplete();
    }
  }

  requestAnimationFrame(anim);
}

function setButtonsDisabled(d) {
  document.querySelectorAll('.button-row button').forEach(function(b) { b.disabled = d; });
}

function getWheelResult() {
  var n = ((2 * Math.PI) - (currentAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  return Math.floor(((n + Math.PI / 2) % (2 * Math.PI)) / ARC) % NUM_SLICES;
}

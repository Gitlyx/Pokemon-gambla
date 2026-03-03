// ===== SFX MODULE — Web Audio API Synth =====

var SFX = (function() {
  var ctx = null;
  var muted = false;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playTones(notes) {
    if (muted) return;
    try {
      var ac = getCtx();
      var t = ac.currentTime;
      notes.forEach(function(n) {
        var osc = ac.createOscillator();
        var gain = ac.createGain();
        osc.type = n.type || 'square';
        osc.frequency.value = n.freq;
        gain.gain.value = n.gain || 0.08;
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.duration);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(t + (n.start || 0));
        osc.stop(t + (n.start || 0) + n.duration);
      });
    } catch(e) {}
  }

  return {
    flip: function() {
      playTones([
        {freq: 880, duration: 0.06, type: 'square', start: 0},
        {freq: 1320, duration: 0.08, type: 'square', start: 0.06},
      ]);
    },

    catch: function() {
      playTones([
        {freq: 523, duration: 0.12, type: 'square', start: 0},
        {freq: 659, duration: 0.12, type: 'square', start: 0.12},
        {freq: 784, duration: 0.12, type: 'square', start: 0.24},
        {freq: 1047, duration: 0.25, type: 'square', start: 0.36, gain: 0.1},
      ]);
    },

    catchFail: function() {
      playTones([
        {freq: 440, duration: 0.15, type: 'sawtooth', start: 0, gain: 0.06},
        {freq: 330, duration: 0.15, type: 'sawtooth', start: 0.15, gain: 0.06},
        {freq: 220, duration: 0.3, type: 'sawtooth', start: 0.3, gain: 0.05},
      ]);
    },

    shake: function() {
      playTones([
        {freq: 200, duration: 0.08, type: 'triangle', start: 0, gain: 0.1},
        {freq: 260, duration: 0.08, type: 'triangle', start: 0.1, gain: 0.1},
      ]);
    },

    levelUp: function() {
      playTones([
        {freq: 523, duration: 0.1, type: 'square', start: 0},
        {freq: 659, duration: 0.1, type: 'square', start: 0.1},
        {freq: 784, duration: 0.15, type: 'square', start: 0.2},
      ]);
    },

    gymWin: function() {
      playTones([
        {freq: 392, duration: 0.15, type: 'square', start: 0, gain: 0.1},
        {freq: 494, duration: 0.15, type: 'square', start: 0.15, gain: 0.1},
        {freq: 587, duration: 0.15, type: 'square', start: 0.3, gain: 0.1},
        {freq: 784, duration: 0.15, type: 'square', start: 0.45, gain: 0.1},
        {freq: 988, duration: 0.3, type: 'square', start: 0.6, gain: 0.12},
      ]);
    },

    gymLoss: function() {
      playTones([
        {freq: 494, duration: 0.2, type: 'sawtooth', start: 0, gain: 0.06},
        {freq: 440, duration: 0.2, type: 'sawtooth', start: 0.2, gain: 0.06},
        {freq: 370, duration: 0.2, type: 'sawtooth', start: 0.4, gain: 0.05},
        {freq: 330, duration: 0.4, type: 'sawtooth', start: 0.6, gain: 0.04},
      ]);
    },

    evolution: function() {
      playTones([
        {freq: 440, duration: 0.1, type: 'sine', start: 0, gain: 0.1},
        {freq: 554, duration: 0.1, type: 'sine', start: 0.1, gain: 0.1},
        {freq: 659, duration: 0.1, type: 'sine', start: 0.2, gain: 0.1},
        {freq: 880, duration: 0.1, type: 'sine', start: 0.3, gain: 0.12},
        {freq: 1109, duration: 0.15, type: 'sine', start: 0.4, gain: 0.12},
        {freq: 1319, duration: 0.25, type: 'sine', start: 0.55, gain: 0.14},
      ]);
    },

    hofReveal: function() {
      playTones([
        {freq: 660, duration: 0.08, type: 'square', start: 0, gain: 0.07},
        {freq: 880, duration: 0.12, type: 'square', start: 0.08, gain: 0.09},
        {freq: 1100, duration: 0.15, type: 'sine', start: 0.2, gain: 0.08},
      ]);
    },

    toggleMute: function() {
      muted = !muted;
      return muted;
    },

    isMuted: function() {
      return muted;
    },
  };
})();

function toggleMute() {
  var m = SFX.toggleMute();
  var btn = document.getElementById('muteBtn');
  if (btn) {
    btn.textContent = m ? '\uD83D\uDD07' : '\uD83D\uDD0A';
    btn.classList.toggle('muted', m);
  }
}

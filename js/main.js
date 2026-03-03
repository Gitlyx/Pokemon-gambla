// ===== INITIALIZATION =====

// Preload starter artwork
[1, 4, 7].forEach(function(id) { new Image().src = artworkUrl(id); });

// Create star background
createStars();

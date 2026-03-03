// ===== POKEAPI HELPERS =====
var SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
var ITEM_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';

function spriteUrl(id) { return SPRITE_BASE + id + '.png'; }
function artworkUrl(id) { return SPRITE_BASE + 'other/official-artwork/' + id + '.png'; }
function cryUrl(id) { return 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/' + id + '.ogg'; }
function playCry(id) {
  try { var a = new Audio(cryUrl(id)); a.volume = 0.3; a.play().catch(function(){}); } catch(e) {}
}

// ===== STARTERS =====
var STARTERS = [
  { name:'Bulbasaur', type:'Grass', id:1, evolutions:[{level:16,name:'Ivysaur',id:2},{level:32,name:'Venusaur',id:3}] },
  { name:'Charmander', type:'Fire', id:4, evolutions:[{level:16,name:'Charmeleon',id:5},{level:36,name:'Charizard',id:6}] },
  { name:'Squirtle', type:'Water', id:7, evolutions:[{level:16,name:'Wartortle',id:8},{level:36,name:'Blastoise',id:9}] },
];

// ===== WILD POKEMON (by tier) =====
var WILD_POKEMON = [
  [ // Tier 0: early routes
    {name:'Pidgey',type:'Normal',id:16,catchRate:80,evolutions:[{level:18,name:'Pidgeotto',id:17}]},
    {name:'Rattata',type:'Normal',id:19,catchRate:85,evolutions:[{level:20,name:'Raticate',id:20}]},
    {name:'Caterpie',type:'Bug',id:10,catchRate:90,evolutions:[{level:10,name:'Butterfree',id:12}]},
    {name:'Pikachu',type:'Electric',id:25,catchRate:45,evolutions:[{level:22,name:'Raichu',id:26}]},
    {name:'Nidoran\u2642',type:'Poison',id:32,catchRate:70,evolutions:[{level:16,name:'Nidorino',id:33}]},
    {name:'Spearow',type:'Normal',id:21,catchRate:75,evolutions:[{level:20,name:'Fearow',id:22}]},
  ],
  [ // Tier 1: mid routes
    {name:'Geodude',type:'Rock',id:74,catchRate:70,evolutions:[{level:25,name:'Graveler',id:75}]},
    {name:'Abra',type:'Psychic',id:63,catchRate:35,evolutions:[{level:16,name:'Kadabra',id:64}]},
    {name:'Machop',type:'Fighting',id:66,catchRate:65,evolutions:[{level:28,name:'Machoke',id:67}]},
    {name:'Vulpix',type:'Fire',id:37,catchRate:55,evolutions:[{level:28,name:'Ninetales',id:38}]},
    {name:'Growlithe',type:'Fire',id:58,catchRate:50,evolutions:[{level:30,name:'Arcanine',id:59}]},
    {name:'Oddish',type:'Grass',id:43,catchRate:75,evolutions:[{level:21,name:'Gloom',id:44}]},
  ],
  [ // Tier 2: late routes
    {name:'Ponyta',type:'Fire',id:77,catchRate:55,evolutions:[{level:40,name:'Rapidash',id:78}]},
    {name:'Magnemite',type:'Electric',id:81,catchRate:60,evolutions:[{level:30,name:'Magneton',id:82}]},
    {name:'Gastly',type:'Ghost',id:92,catchRate:50,evolutions:[{level:25,name:'Haunter',id:93}]},
    {name:'Staryu',type:'Water',id:120,catchRate:55,evolutions:[{level:30,name:'Starmie',id:121}]},
    {name:'Eevee',type:'Normal',id:133,catchRate:40,evolutions:[{level:28,name:'Flareon',id:136}]},
    {name:'Magikarp',type:'Water',id:129,catchRate:95,evolutions:[{level:20,name:'Gyarados',id:130}]},
  ],
  [ // Tier 3: endgame
    {name:'Dratini',type:'Dragon',id:147,catchRate:30,evolutions:[{level:30,name:'Dragonair',id:148}]},
    {name:'Lapras',type:'Water',id:131,catchRate:35,evolutions:[]},
    {name:'Snorlax',type:'Normal',id:143,catchRate:25,evolutions:[]},
    {name:'Electabuzz',type:'Electric',id:125,catchRate:40,evolutions:[]},
    {name:'Scyther',type:'Bug',id:123,catchRate:35,evolutions:[]},
    {name:'Jynx',type:'Psychic',id:124,catchRate:40,evolutions:[]},
  ],
];

// ===== GYM LEADERS =====
var GYMS = [
  {leader:'Brock',city:'Pewter City',type:'Rock',badge:'Boulder',pokemonId:95,threshold:12,
   intro:"I'm Brock! My rock-hard determination is evident in my Pokemon!",
   win:"Your Pokemon's prowess is remarkable! Take this Boulder Badge!"},
  {leader:'Misty',city:'Cerulean City',type:'Water',badge:'Cascade',pokemonId:121,threshold:25,
   intro:"My policy is an all-out offensive with water-type Pokemon!",
   win:"Wow! You're too much! Fine, take the Cascade Badge!"},
  {leader:'Lt. Surge',city:'Vermilion City',type:'Electric',badge:'Thunder',pokemonId:26,threshold:40,
   intro:"Hey kid! What do you think you're doing here?",
   win:"Now that's a Pokemon trainer! Take the Thunder Badge, baby!"},
  {leader:'Erika',city:'Celadon City',type:'Grass',badge:'Rainbow',pokemonId:45,threshold:55,
   intro:"I'm Erika, the nature-loving princess!",
   win:"Oh! You're remarkable! Take the Rainbow Badge."},
  {leader:'Koga',city:'Fuchsia City',type:'Poison',badge:'Soul',pokemonId:110,threshold:75,
   intro:"A ninja must see through deception. Can you?",
   win:"You have proven your worth. Take the Soul Badge."},
  {leader:'Sabrina',city:'Saffron City',type:'Psychic',badge:'Marsh',pokemonId:65,threshold:95,
   intro:"I had a vision of your arrival. I foresaw your defeat!",
   win:"Your power reminds me of when I was young. Take the Marsh Badge."},
  {leader:'Blaine',city:'Cinnabar Island',type:'Fire',badge:'Volcano',pokemonId:59,threshold:115,
   intro:"Hah! I'm Blaine, the hotheaded quiz master!",
   win:"You've earned the Volcano Badge! Your passion burns bright!"},
  {leader:'Giovanni',city:'Viridian City',type:'Ground',badge:'Earth',pokemonId:112,threshold:140,
   intro:"So! You've finally arrived! I am the boss of Team Rocket!",
   win:"Ha! That was a truly intense battle! Take this Earth Badge."},
];

// ===== ELITE FOUR =====
var ELITE_FOUR = [
  {name:'Lorelei',type:'Ice',pokemonId:131},
  {name:'Bruno',type:'Fighting',pokemonId:68},
  {name:'Agatha',type:'Ghost',pokemonId:94},
  {name:'Lance',type:'Dragon',pokemonId:149},
  {name:'Champion Blue',type:'Various',pokemonId:18},
];
var E4_THRESHOLD = 180;

// ===== ROUTES =====
var ROUTES = [
  'Route 1 \u2014 Pallet Town',
  'Route 3 \u2014 Mt. Moon',
  'Route 5 \u2014 Underground Path',
  'Route 8 \u2014 Celadon Outskirts',
  'Route 12 \u2014 Silence Bridge',
  'Route 16 \u2014 Cycling Road',
  'Route 20 \u2014 Seafoam Islands',
  'Route 22 \u2014 Victory Road',
  'Indigo Plateau',
];

// ===== MISC DATA =====
var TM_MOVES = [
  'Flamethrower','Ice Beam','Thunderbolt','Earthquake','Psychic',
  'Shadow Ball','Surf','Solar Beam','Hyper Beam','Dragon Pulse',
  'Fire Blast','Blizzard','Thunder','Dig','Toxic',
];

var TYPE_COLORS = {
  Normal:'#A8A878', Fire:'#F08030', Water:'#6890F0', Grass:'#78C850',
  Electric:'#F8D030', Rock:'#B8A038', Poison:'#A040A0', Psychic:'#F85888',
  Fighting:'#C03028', Bug:'#A8B820', Ghost:'#705898', Dragon:'#7038F8',
  Ice:'#98D8D8', Ground:'#E0C068',
};

// ===== WHEEL EVENTS =====
var WHEEL_EVENTS = [
  {name:'Wild Pokemon',color:'#4CAF50'},
  {name:'Trainer Battle',color:'#f44336'},
  {name:'Team Rocket',color:'#9C27B0'},
  {name:'Rival Battle',color:'#FF5722'},
  {name:'Potion',color:'#E91E63'},
  {name:'Rare Candy',color:'#FF9800'},
  {name:'Poke Center',color:'#2196F3'},
  {name:'Found TM',color:'#795548'},
  {name:'Berry Harvest',color:'#8BC34A'},
  {name:'Evolution',color:'#00BCD4'},
];
var NUM_SLICES = WHEEL_EVENTS.length;
var ARC = (2 * Math.PI) / NUM_SLICES;

// ===== GAME STATE =====
var game = {
  phase: 'intro',
  party: [],
  badges: [],
  bag: { potions: 0, berries: 0 },
  currentGym: 0,
  spinsOnRoute: 0,
  totalSpins: 0,
  log: [],
};

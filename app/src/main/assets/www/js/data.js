// Demo catalogue — all mock data for the MVP demo
const CREATORS = {
  artverse:   { id: 'artverse', name: 'ArtVerse', handle: '@artverse', mono: 'AV', verified: true, bio: 'Digital artist | Celebrating modern India through art.', followers: '12.4K', following: 8, banner: 'studioBanner' },
  gameon:     { id: 'gameon', name: 'GameOn', handle: '@gameon', mono: 'GO', verified: true, bio: 'Sports collectibles studio. Officially licensed cricket art.', followers: '8.1K', following: 14, banner: 'cricket' },
  kalakendra: { id: 'kalakendra', name: 'Kala Kendra', handle: '@kalakendra', mono: 'KK', verified: true, bio: 'Classical dance, temples and heritage — reimagined digitally.', followers: '6.7K', following: 21, banner: 'temple' },
  street:     { id: 'street', name: 'StreetStudio', handle: '@streetstudio', mono: 'SS', verified: true, bio: 'Colours of everyday India — streets, autos and chai.', followers: '4.2K', following: 5, banner: 'auto' },
  heritage:   { id: 'heritage', name: 'HeritageLab', handle: '@heritagelab', mono: 'HL', verified: true, bio: 'Forts, palaces and royal stories of Rajasthan.', followers: '5.5K', following: 11, banner: 'palace' },
  neon:       { id: 'neon', name: 'NeonDesi', handle: '@neondesi', mono: 'ND', verified: false, bio: 'Night cities, neon lights and Indian futurism.', followers: '2.9K', following: 33, banner: 'cityNight' },
  rail:       { id: 'rail', name: 'RailRoots', handle: '@railroots', mono: 'RR', verified: true, bio: 'Monsoon journeys across Indian railways.', followers: '3.3K', following: 9, banner: 'train' },
};

const COLLECTIONS = [
  { id: 'bharat', name: 'Bharat Forever', creator: 'artverse', art: 'gate', cat: 'Art', price: 799, supply: 500, minted: 455, owners: 312, desc: "A celebration of India's timeless spirit — iconic monuments painted in golden-hour light.", tags: ['Art', 'India', 'Limited Edition'], utility: 'Holders get early access to ArtVerse drops.' },
  { id: 'cricket', name: 'Cricket Legends', creator: 'gameon', art: 'cricket', cat: 'Sports', price: 499, supply: 1000, minted: 731, owners: 604, desc: 'Moments of glory from the gully to the stadium, captured as digital collectibles.', tags: ['Sports', 'Cricket'], utility: 'Unlocks a members-only fan wall.' },
  { id: 'spirit', name: 'Spirit of India', creator: 'kalakendra', art: 'dancer', cat: 'Culture', price: 999, supply: 250, minted: 198, owners: 170, desc: 'Classical dance forms of India in motion — Bharatanatyam, Kathak and Odissi.', tags: ['Culture', 'Dance'], utility: 'Invite to a live virtual performance.' },
  { id: 'temple', name: 'Temple Trails', creator: 'kalakendra', art: 'temple', cat: 'Culture', price: 899, supply: 300, minted: 214, owners: 190, desc: 'Architectural wonders of ancient Indian temples.', tags: ['Culture', 'Heritage'], utility: 'Includes a printable heritage postcard.' },
  { id: 'desi', name: 'Desi Streets', creator: 'street', art: 'auto', cat: 'Art', price: 499, supply: 800, minted: 402, owners: 350, desc: 'Autos, chai stalls and festival lights — the joy of Indian streets.', tags: ['Art', 'Street'], utility: 'Merch discount on StreetStudio store.' },
  { id: 'royal', name: 'Royal Rajasthan', creator: 'heritage', art: 'palace', cat: 'Culture', price: 1299, supply: 150, minted: 121, owners: 108, desc: 'Palaces of the desert kingdoms under painted skies.', tags: ['Culture', 'Royal'], utility: 'Entry to a curated heritage walk (demo).' },
  { id: 'mumbai', name: 'Mumbai Nights', creator: 'neon', art: 'cityNight', cat: 'Music', price: 649, supply: 600, minted: 288, owners: 240, desc: 'Lo-fi beats and neon skylines of the city that never sleeps.', tags: ['Music', 'City'], utility: 'Includes an exclusive lo-fi track.' },
  { id: 'monsoon', name: 'Monsoon Vibes', creator: 'rail', art: 'train', cat: 'Art', price: 599, supply: 400, minted: 260, owners: 222, desc: 'Rain-soaked railway journeys through the Western Ghats.', tags: ['Art', 'Travel'], utility: 'Unlocks a travel playlist.' },
  { id: 'unplugged', name: 'India Unplugged', creator: 'artverse', art: 'family', cat: 'Gaming', price: 399, supply: 1200, minted: 380, owners: 301, desc: 'Characters from a playful Indian adventure game universe.', tags: ['Gaming', 'Characters'], utility: 'In-game skin in the upcoming demo game.' },
];

const HUES = [0, 18, -14, 32, -26, 10, -6, 24];
const RARITY = ['Common', 'Common', 'Rare', 'Common', 'Epic', 'Rare', 'Common', 'Legendary'];
const BG = ['Sunset', 'Dawn', 'Dusk', 'Golden Hour', 'Twilight', 'Saffron Sky', 'Monsoon', 'Starlight'];
// Items per collection
const ITEMS = [];
COLLECTIONS.forEach((c, ci) => {
  for (let i = 0; i < 8; i++) {
    const num = ((ci * 37 + i * 53 + 101) % c.supply) + 1;
    ITEMS.push({
      id: `${c.id}-${i}`, col: c.id, idx: i,
      name: `${c.name} #${String(num).padStart(4, '0')}`,
      edition: num, art: c.art, hue: HUES[i],
      price: c.price + (RARITY[i] === 'Epic' ? 300 : RARITY[i] === 'Legendary' ? 700 : RARITY[i] === 'Rare' ? 150 : 0),
      left: c.supply - c.minted - i * 3,
      attrs: { Rarity: RARITY[i], Background: BG[i], Edition: `${num} / ${c.supply}`, Category: c.cat },
      token: 1000 + ci * 100 + i,
    });
  }
});
// fixed hero NFT matching designs
ITEMS.find(x => x.id === 'bharat-0').name = 'Bharat Forever #0123';
ITEMS.find(x => x.id === 'bharat-0').edition = 123;
ITEMS.find(x => x.id === 'bharat-0').attrs.Edition = '123 / 500';
ITEMS.find(x => x.id === 'bharat-0').left = 45;
ITEMS.find(x => x.id === 'bharat-0').price = 799;

const CATS = [['palette', 'Art', '#F28C28', '#fde9d6'], ['music', 'Music', '#7c4ddb', '#ece4fb'], ['sports', 'Sports', '#2f6fe0', '#e2ecfc'], ['game', 'Gaming', '#12804A', '#dff1e7'], ['culture', 'Culture', '#e0384a', '#fde3e5']];

const DROPS = [
  { col: 'royal', title: 'Royal Rajasthan — Season 2', inHours: 6 },
  { col: 'mumbai', title: 'Mumbai Nights: Lo-fi Edition', inHours: 30 },
  { col: 'spirit', title: 'Spirit of India: Kathak', inHours: 72 },
];

const getCol = id => COLLECTIONS.find(c => c.id === id);
const getItem = id => ITEMS.find(i => i.id === id);
const colItems = id => ITEMS.filter(i => i.col === id);
const inr = n => '₹' + n.toLocaleString('en-IN');
const usd = n => '$' + (n / 84).toFixed(2);

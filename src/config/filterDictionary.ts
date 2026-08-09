export type FilterCategory =
  | 'Kalimdor'
  | 'Eastern Kingdoms'
  | 'Dungeons'
  | 'Other'

/** Order the submenus appear in the Filter dropdown. */
export const CATEGORY_ORDER: FilterCategory[] = [
  'Kalimdor',
  'Eastern Kingdoms',
  'Dungeons',
  'Other',
]

export const FILTER_DICTIONARY: Record<string, FilterCategory> = {
  // --- KALIMDOR ---
  Ashenvale: 'Kalimdor',
  'Ashenvale, Astranaar': 'Kalimdor',
  Azshara: 'Kalimdor',
  Darkshore: 'Kalimdor',
  'Darkshore, Auberdine': 'Kalimdor',
  Darnassus: 'Kalimdor',
  'Darnassus, Teldrassil': 'Kalimdor',
  Desolace: 'Kalimdor',
  Durotar: 'Kalimdor',
  'Dustwallow Marsh': 'Kalimdor',
  'Dustwallow Marsh, Theramore Isle': 'Kalimdor',
  Felwood: 'Kalimdor',
  Feralas: 'Kalimdor',
  Moonglade: 'Kalimdor',
  'Moonglade, Nighthaven': 'Kalimdor',
  Mulgore: 'Kalimdor',
  Orgrimmar: 'Kalimdor',
  Silithus: 'Kalimdor',
  'Stonetalon Mountains': 'Kalimdor',
  Tanaris: 'Kalimdor',
  Teldrassil: 'Kalimdor',
  'The Barrens': 'Kalimdor',
  'Thousand Needles': 'Kalimdor',
  'Thunder Bluff': 'Kalimdor',
  "Un'Goro Crater": 'Kalimdor',
  Winterspring: 'Kalimdor',

  // --- EASTERN KINGDOMS ---
  'Alterac Mountains': 'Eastern Kingdoms',
  'Arathi Highlands': 'Eastern Kingdoms',
  Badlands: 'Eastern Kingdoms',
  'Blasted Lands': 'Eastern Kingdoms',
  'Burning Steppes': 'Eastern Kingdoms',
  'Deadwind Pass': 'Eastern Kingdoms',
  'Deeprun Tram': 'Eastern Kingdoms',
  'Dun Morogh': 'Eastern Kingdoms',
  Duskwood: 'Eastern Kingdoms',
  'Eastern Plaguelands': 'Eastern Kingdoms',
  'Elwynn Forest': 'Eastern Kingdoms',
  'Hillsbrad Foothills': 'Eastern Kingdoms',
  Ironforge: 'Eastern Kingdoms',
  'Ironforge, Dun Morogh': 'Eastern Kingdoms',
  'Loch Modan': 'Eastern Kingdoms',
  Plaguelands: 'Eastern Kingdoms',
  'Redridge Mountains': 'Eastern Kingdoms',
  'Searing Gorge': 'Eastern Kingdoms',
  'Silverpine Forest': 'Eastern Kingdoms',
  'Stormwind City': 'Eastern Kingdoms',
  'Stormwind City, Elwynn Forest': 'Eastern Kingdoms',
  'Stranglethorn Vale': 'Eastern Kingdoms',
  'Stranglethorn Vale, Booty Bay': 'Eastern Kingdoms',
  'Swamp of Sorrows': 'Eastern Kingdoms',
  'The Hinterlands': 'Eastern Kingdoms',
  'Tirisfal Glades': 'Eastern Kingdoms',
  Undercity: 'Eastern Kingdoms',
  'Western Plaguelands': 'Eastern Kingdoms',
  Westfall: 'Eastern Kingdoms',
  Wetlands: 'Eastern Kingdoms',
  'Wetlands, Menethil Harbor': 'Eastern Kingdoms',

  // --- DUNGEONS & RAIDS ---
  'Ragefire Chasm, Durotar': 'Dungeons',
  'Wailing Caverns, The Barrens': 'Dungeons',
  'The Deadmines, Westfall': 'Dungeons',
  'Shadowfang Keep, Silverpine Forest': 'Dungeons',
  'The Stockade, Stormwind City': 'Dungeons',
  'Stormwind Stockade, Stormwind City': 'Dungeons',
  'Blackfathom Deeps, Ashenvale': 'Dungeons',
  'Gnomeregan, Dun Morogh': 'Dungeons',
  'Razorfen Kraul, The Barrens': 'Dungeons',
  'Razorfen Downs, The Barrens': 'Dungeons',
  'Scarlet Monastery, Tirisfal Glades': 'Dungeons',
  'Uldaman, Badlands': 'Dungeons',
  "Zul'Farrak, Tanaris": 'Dungeons',
  'Maraudon, Desolace': 'Dungeons',
  "The Temple of Atal'Hakkar, Swamp of Sorrows": 'Dungeons',
  'Sunken Temple, Swamp of Sorrows': 'Dungeons',
  'Blackrock Depths, Searing Gorge': 'Dungeons',
  'Lower Blackrock Spire, Searing Gorge': 'Dungeons',
  'Upper Blackrock Spire, Searing Gorge': 'Dungeons',
  'Dire Maul, Feralas': 'Dungeons',
  'Scholomance, Western Plaguelands': 'Dungeons',
  'Stratholme, Eastern Plaguelands': 'Dungeons',
  'Molten Core, Searing Gorge': 'Dungeons',
  'Blackwing Lair, Searing Gorge': 'Dungeons',
  "Onyxia's Lair, Dustwallow Marsh": 'Dungeons',
  "Zul'Gurub, Stranglethorn Vale": 'Dungeons',
  "Ruins of Ahn'Qiraj, Silithus": 'Dungeons',
  "Temple of Ahn'Qiraj, Silithus": 'Dungeons',
  'Naxxramas, Eastern Plaguelands': 'Dungeons',
}

/** Case-insensitive lookup, matching the original `Object.keys(...).find(...)`. */
export function categoryOf(location: string): FilterCategory {
  const key = Object.keys(FILTER_DICTIONARY).find(
    (k) => k.toLowerCase() === location.toLowerCase(),
  )
  return key ? FILTER_DICTIONARY[key] : 'Other'
}

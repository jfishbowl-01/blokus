const AI_NAMES = [
  'Captain Waffle',
  'Pixel Panda',
  'Cosmic Noodle',
  'Turbo Sprout',
  'Neon Gecko',
  'Jellybean',
  'Moonlight Moth',
  'Gizmo Goblin',
  'Rocket Raccoon',
  'Disco Sloth',
  'Cactus Cat',
  'Bubble Badger',
  'Wobble Wizard',
  'Mango Moose',
  'Crispy Comet',
  'Zigzag Zebra'
];

export function getAiNames(count, takenNames = new Set()) {
  const taken = new Set(takenNames);
  const names = [];

  for (let i = 0; i < count; i += 1) {
    const available = AI_NAMES.filter((name) => !taken.has(name));
    const pick = available.length
      ? available[Math.floor(Math.random() * available.length)]
      : `Bot ${taken.size + 1}`;
    names.push(pick);
    taken.add(pick);
  }

  return names;
}

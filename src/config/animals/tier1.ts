import type { Animal } from 'types/animals';

export default [
  {
    description: 'ANIMAL:LEPUS_EUROPAEUS_DESCRIPTION',
    habitatPrimary: ['grassland'],
    heading: 'ANIMAL:LEPUS_EUROPAEUS_HEADING',
    hitEnergy: [356, 1068],
    latin: 'ANIMAL:LEPUS_EUROPAEUS_LATIN',
    lifeCycle: [
      { activity: 'feeding', time: 0 },
      { activity: 'sleeping', time: 3 },
      { activity: 'feeding', time: 9 },
      { activity: 'sleeping', time: 17 },
    ],
    maps: ['transylvania'],
    slug: 'european-hare',
    tier: 1,
    type: 'animal:european hare',
  },
  {
    description: 'ANIMAL:LEPUS_AMERICANUS_DESCRIPTION',
    habitatPrimary: ['highland forest'],
    heading: 'ANIMAL:LEPUS_AMERICANUS_HEADING',
    hitEnergy: [56, 628],
    latin: 'ANIMAL:LEPUS_AMERICANUS_LATIN',
    lifeCycle: [
      { activity: 'feeding', time: 0 },
      { activity: 'sleeping', time: 3 },
      { activity: 'feeding', time: 9 },
      { activity: 'sleeping', time: 17 },
    ],
    maps: ['alaska', 'idaho'],
    slug: 'snowshoe-hare',
    tier: 1,
    type: 'animal:snowshoe hare',
  },
] as Array<Animal>;

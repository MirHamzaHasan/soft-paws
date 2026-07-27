export type ToxicitySeverity = 'safe' | 'caution' | 'toxic' | 'emergency';

export type ToxicityItem = {
  action: string;
  aliases: string[];
  details: string;
  id: string;
  name: string;
  poisonControlRecommended: boolean;
  severity: ToxicitySeverity;
  signs: string[];
  sourceName: string;
  sourceUrl: string;
};

export type DogSafetyProfile = {
  name: string;
  weightLbs: number | null;
};

export const ASPCA_POISON_CONTROL_PHONE = '888-426-4435';
export const PET_POISON_HELPLINE_PHONE = '855-764-7661';

const ASPCA_POISON_CONTROL_URL =
  'https://www.aspca.org/pet-care/aspca-poison-control';
const RED_CROSS_FIRST_AID_URL =
  'https://www.redcross.org/take-a-class/resources/learn-pet-first-aid/dog';

export const TOXICITY_ITEMS: ToxicityItem[] = [
  {
    action:
      'Call poison control or an emergency vet now if any amount may have been eaten.',
    aliases: ['raisin', 'raisins', 'grape', 'grapes', 'currant', 'currants'],
    details:
      'Grapes and raisins are treated as high risk for dogs because kidney injury can occur and the risky amount is not predictable.',
    id: 'grapes-raisins',
    name: 'Grapes or raisins',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: [
      'Vomiting',
      'Diarrhea',
      'Not eating',
      'Lethargy',
      'Changes in urination',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call poison control or an emergency vet now, especially if sugar-free gum, candy, baked goods, or peanut butter is involved.',
    aliases: ['xylitol', 'birch sugar', 'sugar free gum', 'sugar-free gum'],
    details:
      'Xylitol can cause a rapid blood sugar drop in dogs and may affect the liver. Product labels matter.',
    id: 'xylitol',
    name: 'Xylitol / birch sugar',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: ['Vomiting', 'Weakness', 'Staggering', 'Collapse', 'Seizures'],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call poison control or an emergency vet. Keep the packaging if available.',
    aliases: [
      'chocolate',
      'dark chocolate',
      'baking chocolate',
      'cocoa',
      'cocoa powder',
      'cocoa mulch',
    ],
    details:
      'Chocolate contains methylxanthines such as theobromine and caffeine. Darker chocolate and baking chocolate are more concerning.',
    id: 'chocolate',
    name: 'Chocolate',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: [
      'Vomiting',
      'Diarrhea',
      'Restlessness',
      'Fast breathing',
      'Tremors',
      'Seizures',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call your vet or poison control. Do not wait for symptoms if a meaningful amount may have been eaten.',
    aliases: [
      'onion',
      'onions',
      'garlic',
      'chive',
      'chives',
      'leek',
      'leeks',
      'shallot',
    ],
    details:
      'Onion-family foods can damage red blood cells in dogs. Powdered or concentrated forms can be especially concerning.',
    id: 'allium',
    name: 'Onion, garlic, chives, or leeks',
    poisonControlRecommended: true,
    severity: 'toxic',
    signs: ['Vomiting', 'Diarrhea', 'Weakness', 'Pale gums', 'Dark urine'],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Contact a vet or poison control if eaten, especially if your dog is small or ate several nuts.',
    aliases: ['macadamia', 'macadamia nut', 'macadamia nuts'],
    details:
      'Macadamia nuts can cause weakness and tremors in dogs. The exact sensitivity can vary.',
    id: 'macadamia',
    name: 'Macadamia nuts',
    poisonControlRecommended: true,
    severity: 'toxic',
    signs: ['Weakness', 'Vomiting', 'Tremors', 'Fever', 'Trouble walking'],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call poison control or an emergency vet. This can become urgent quickly.',
    aliases: ['alcohol', 'beer', 'wine', 'liquor', 'cocktail', 'hard seltzer'],
    details:
      'Alcohol exposure can affect breathing, blood sugar, coordination, and body temperature in dogs.',
    id: 'alcohol',
    name: 'Alcohol',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: [
      'Vomiting',
      'Disorientation',
      'Low body temperature',
      'Slow breathing',
      'Collapse',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call poison control or an emergency vet, especially for coffee grounds, caffeine pills, or energy products.',
    aliases: [
      'coffee',
      'caffeine',
      'espresso',
      'coffee grounds',
      'energy drink',
    ],
    details:
      'Caffeine can overstimulate a dog and may affect heart rhythm or cause tremors.',
    id: 'caffeine',
    name: 'Coffee or caffeine',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: [
      'Restlessness',
      'Panting',
      'Fast heart rate',
      'Tremors',
      'Seizures',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call a vet or poison control if your dog ate medication. Have the bottle ready.',
    aliases: [
      'ibuprofen',
      'advil',
      'motrin',
      'naproxen',
      'aleve',
      'acetaminophen',
      'tylenol',
      'human medication',
      'medicine',
      'pill',
    ],
    details:
      'Human medications are a common poison-control reason. Dose, formulation, and dog weight matter.',
    id: 'human-medications',
    name: 'Human medications',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: [
      'Vomiting',
      'Drooling',
      'Lethargy',
      'Black stool',
      'Trouble breathing',
      'Collapse',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call poison control or an emergency vet. Do not wait for symptoms.',
    aliases: ['antifreeze', 'ethylene glycol', 'coolant'],
    details:
      'Antifreeze can be life-threatening in very small exposures and needs immediate professional care.',
    id: 'antifreeze',
    name: 'Antifreeze / engine coolant',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: [
      'Vomiting',
      'Staggering',
      'Lethargy',
      'Increased thirst',
      'Seizures',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call poison control or an emergency vet and save the product packaging.',
    aliases: ['rat poison', 'mouse poison', 'rodenticide', 'bait block'],
    details:
      'Rodenticides vary by ingredient. Treatment depends on the exact product.',
    id: 'rodenticide',
    name: 'Rat or mouse poison',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: ['Weakness', 'Bleeding', 'Bruising', 'Tremors', 'Seizures'],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call a vet or poison control if eaten, especially if vomiting, diarrhea, or wobbliness appears.',
    aliases: ['marijuana', 'cannabis', 'weed', 'edible', 'thc', 'cbd gummy'],
    details:
      'Cannabis products can affect coordination, alertness, heart rate, and body temperature. Edibles may contain other hazards.',
    id: 'cannabis',
    name: 'Cannabis / marijuana products',
    poisonControlRecommended: true,
    severity: 'toxic',
    signs: [
      'Wobbliness',
      'Sleepiness',
      'Vomiting',
      'Urine dribbling',
      'Low temperature',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call a vet or poison control if a pit, skin, leaves, or a large amount was eaten.',
    aliases: ['avocado', 'avocado pit', 'guacamole'],
    details:
      'Avocado can cause stomach upset in dogs, and the pit can create a choking or obstruction risk.',
    id: 'avocado',
    name: 'Avocado',
    poisonControlRecommended: false,
    severity: 'caution',
    signs: ['Vomiting', 'Diarrhea', 'Choking signs', 'Abdominal discomfort'],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Watch for stomach upset. Call a vet if seeds, core, or a large amount was eaten.',
    aliases: ['apple', 'apples', 'apple slice', 'apple slices'],
    details:
      'Plain apple flesh is generally low concern for many dogs. Seeds, cores, choking, and large amounts are the main cautions.',
    id: 'apple',
    name: 'Apple slices',
    poisonControlRecommended: false,
    severity: 'caution',
    signs: ['Vomiting', 'Diarrhea', 'Choking signs'],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Check the ingredient label. Call poison control immediately if xylitol or birch sugar is listed.',
    aliases: ['peanut butter', 'pb'],
    details:
      'Plain peanut butter is often low concern, but some products contain xylitol or birch sugar, which is dangerous for dogs.',
    id: 'peanut-butter',
    name: 'Peanut butter',
    poisonControlRecommended: false,
    severity: 'caution',
    signs: [
      'Vomiting',
      'Weakness if xylitol is present',
      'Choking if sticky or excessive',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call a vet immediately if bloat, distress, or repeated vomiting is present.',
    aliases: ['bread dough', 'yeast dough', 'raw dough', 'pizza dough'],
    details:
      'Unbaked yeast dough can expand in the stomach and may produce alcohol as it ferments.',
    id: 'yeast-dough',
    name: 'Unbaked yeast dough',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: [
      'Bloated abdomen',
      'Retching',
      'Discomfort',
      'Weakness',
      'Disorientation',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Contact a vet or poison control, especially for repeated vomiting, weakness, or unknown mushroom type.',
    aliases: ['mushroom', 'mushrooms', 'wild mushroom'],
    details:
      'Wild mushrooms are difficult to identify safely. Some can cause serious neurologic or liver effects.',
    id: 'mushrooms',
    name: 'Wild mushrooms',
    poisonControlRecommended: true,
    severity: 'toxic',
    signs: [
      'Vomiting',
      'Diarrhea',
      'Drooling',
      'Weakness',
      'Tremors',
      'Seizures',
    ],
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action: 'Call poison control or an emergency vet if exposure is suspected.',
    aliases: ['sago palm', 'cycad', 'palm seed'],
    details:
      'Sago palm exposure is high risk for dogs, including seeds and plant material.',
    id: 'sago-palm',
    name: 'Sago palm',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: ['Vomiting', 'Diarrhea', 'Weakness', 'Seizures', 'Liver signs'],
    sourceName: 'ASPCA poisonous plants guide',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Call poison control or a vet. Bring a photo or sample of the plant if safe.',
    aliases: ['azalea', 'rhododendron', 'oleander', 'foxglove'],
    details:
      'Several ornamental plants can affect the stomach, heart, or nervous system in dogs.',
    id: 'toxic-ornamentals',
    name: 'Toxic ornamental plants',
    poisonControlRecommended: true,
    severity: 'emergency',
    signs: [
      'Drooling',
      'Vomiting',
      'Weakness',
      'Abnormal heart rate',
      'Collapse',
    ],
    sourceName: 'ASPCA poisonous plants guide',
    sourceUrl: ASPCA_POISON_CONTROL_URL,
  },
  {
    action:
      'Move to shade, offer small amounts of cool water if alert, and contact an emergency vet.',
    aliases: ['heatstroke', 'heat stroke', 'overheating', 'hot car'],
    details:
      'Heatstroke is an emergency. Cooling and transport guidance should come from a veterinary professional.',
    id: 'heatstroke',
    name: 'Heatstroke exposure',
    poisonControlRecommended: false,
    severity: 'emergency',
    signs: ['Heavy panting', 'Weakness', 'Drooling', 'Collapse', 'Seizures'],
    sourceName: 'American Red Cross pet first aid',
    sourceUrl: RED_CROSS_FIRST_AID_URL,
  },
];

const COMMON_HAZARD_IDS = [
  'chocolate',
  'grapes-raisins',
  'xylitol',
  'human-medications',
  'antifreeze',
  'rodenticide',
];

function normalizeSearchTerm(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function getCommonToxicityHazards() {
  return COMMON_HAZARD_IDS.map((id) =>
    TOXICITY_ITEMS.find((item) => item.id === id),
  ).filter((item): item is ToxicityItem => Boolean(item));
}

export function lookupToxicityItem(query: string) {
  const normalizedQuery = normalizeSearchTerm(query);

  if (!normalizedQuery) {
    return null;
  }

  return (
    TOXICITY_ITEMS.find((item) => {
      const terms = [item.name, ...item.aliases].map(normalizeSearchTerm);
      return terms.some(
        (term) =>
          term === normalizedQuery ||
          term.includes(normalizedQuery) ||
          normalizedQuery.includes(term),
      );
    }) ?? null
  );
}

export function getToxicityWeightContext(
  item: ToxicityItem,
  dog: DogSafetyProfile,
) {
  const weightLabel =
    typeof dog.weightLbs === 'number' && Number.isFinite(dog.weightLbs)
      ? `${dog.weightLbs.toFixed(1)} lb`
      : null;

  if (!weightLabel) {
    return `If exposure happened, poison control will ask for ${dog.name}'s weight, the item, amount, and time. Add a weight to the profile for faster calls.`;
  }

  if (item.severity === 'safe' || item.severity === 'caution') {
    return `${dog.name}'s saved weight is ${weightLabel}. Use that when calling a vet if symptoms appear or the amount is unclear.`;
  }

  return `${dog.name}'s saved weight is ${weightLabel}. Share that, the item, estimated amount, and time of exposure when calling poison control or a vet.`;
}

export function getToxicitySeverityLabel(severity: ToxicitySeverity) {
  if (severity === 'emergency') {
    return 'Call now';
  }

  if (severity === 'toxic') {
    return 'Toxic risk';
  }

  if (severity === 'caution') {
    return 'Use caution';
  }

  return 'Low concern';
}

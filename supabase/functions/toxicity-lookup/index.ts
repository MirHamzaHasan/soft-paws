import {
  jsonResponse,
  optionsResponse,
  readJsonBody,
} from '../_shared/http.ts';

type ToxicitySeverity = 'caution' | 'emergency' | 'toxic';

type ToxicityItem = {
  action: string;
  aliases: string[];
  details: string;
  id: string;
  name: string;
  severity: ToxicitySeverity;
  sourceName: string;
  sourceUrl: string;
};

const PROMPT_CONTRACT = 'toxicity-lookup-v1';
const ASPCA_SOURCE_URL = 'https://www.aspca.org/pet-care/aspca-poison-control';

const TOXICITY_ITEMS: ToxicityItem[] = [
  {
    action: 'Call poison control or an emergency vet now.',
    aliases: ['grape', 'grapes', 'raisin', 'raisins', 'currant', 'currants'],
    details:
      'Grapes and raisins are treated as high risk because kidney injury can occur and the risky amount is not predictable.',
    id: 'grapes-raisins',
    name: 'Grapes or raisins',
    severity: 'emergency',
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_SOURCE_URL,
  },
  {
    action: 'Call poison control or an emergency vet now.',
    aliases: ['xylitol', 'birch sugar', 'sugar free gum', 'sugar-free gum'],
    details:
      'Xylitol can cause a rapid blood sugar drop in dogs and may affect the liver.',
    id: 'xylitol',
    name: 'Xylitol / birch sugar',
    severity: 'emergency',
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_SOURCE_URL,
  },
  {
    action:
      'Call poison control or an emergency vet and keep packaging nearby.',
    aliases: ['chocolate', 'dark chocolate', 'baking chocolate', 'cocoa'],
    details:
      'Chocolate contains methylxanthines such as theobromine and caffeine. Darker chocolate is more concerning.',
    id: 'chocolate',
    name: 'Chocolate',
    severity: 'emergency',
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_SOURCE_URL,
  },
  {
    action: 'Call a vet or poison control if eaten.',
    aliases: ['onion', 'onions', 'garlic', 'chive', 'chives', 'leek', 'leeks'],
    details:
      'Onion-family foods can damage red blood cells in dogs. Powdered forms can be especially concerning.',
    id: 'allium',
    name: 'Onion, garlic, chives, or leeks',
    severity: 'toxic',
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_SOURCE_URL,
  },
  {
    action:
      'Check the ingredient label and call immediately if xylitol or birch sugar is listed.',
    aliases: ['peanut butter', 'pb'],
    details:
      'Plain peanut butter is often low concern, but some products contain xylitol or birch sugar.',
    id: 'peanut-butter',
    name: 'Peanut butter',
    severity: 'caution',
    sourceName: 'ASPCA Animal Poison Control',
    sourceUrl: ASPCA_SOURCE_URL,
  },
];

function normalizeSearchTerm(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function lookupToxicityItem(query: string) {
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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'method_not_allowed',
        message: 'Use POST for toxicity-lookup.',
      },
      405,
    );
  }

  const body = await readJsonBody(request);
  const payload =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const query = typeof payload.query === 'string' ? payload.query : '';
  const dogWeightLbs =
    typeof payload.dogWeightLbs === 'number' ? payload.dogWeightLbs : null;

  if (!query.trim()) {
    return jsonResponse(
      {
        error: 'missing_query',
        message: 'Provide a query to look up.',
        promptContract: PROMPT_CONTRACT,
      },
      400,
    );
  }

  const match = lookupToxicityItem(query);

  return jsonResponse({
    dogWeightLbs,
    match,
    promptContract: PROMPT_CONTRACT,
    sourceBoundary:
      'Lookup returns reference content only and does not diagnose or calculate treatment.',
  });
});

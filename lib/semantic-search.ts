// Semantic search without AI - using synonym dictionaries, stemming, and fuzzy matching

// Category definitions for color-coded highlighting
const CATEGORY_COLORS = {
  animals: '#fbbf24', // amber-400 - warm yellow
  proteins: '#ef4444', // red-500 - bright red
  genetics: '#8b5cf6', // violet-500 - purple
  chemistry: '#06b6d4', // cyan-500 - blue
  space: '#10b981', // emerald-500 - green
  medical: '#f97316', // orange-500 - orange
  microbiology: '#ec4899', // pink-500 - pink
  laboratory: '#6366f1', // indigo-500 - indigo
  research: '#64748b', // slate-500 - gray
  default: '#94a3b8' // slate-400 - light gray
} as const;

// Category mappings - which terms belong to which categories
const TERM_CATEGORIES: Record<string, keyof typeof CATEGORY_COLORS> = {
  // Animals
  'animal': 'animals', 'animals': 'animals', 'research animal': 'animals', 'research animals': 'animals',
  'model organism': 'animals', 'model organisms': 'animals',
  'mouse': 'animals', 'mice': 'animals', 'rat': 'animals', 'rats': 'animals',
  'rabbit': 'animals', 'rabbits': 'animals', 'monkey': 'animals', 'monkeys': 'animals',
  'pig': 'animals', 'pigs': 'animals', 'dog': 'animals', 'dogs': 'animals',
  'cat': 'animals', 'cats': 'animals', 'zebrafish': 'animals', 'drosophila': 'animals',
  'c elegans': 'animals', 'caenorhabditis elegans': 'animals', 'fruit fly': 'animals',
  'guinea pig': 'animals', 'hamster': 'animals', 'gerbil': 'animals', 'macaque': 'animals',
  'rhesus': 'animals', 'baboon': 'animals', 'marmoset': 'animals', 'chimpanzee': 'animals',
  'minipig': 'animals', 'beagle': 'animals', 'ferret': 'animals', 'sheep': 'animals',
  'goat': 'animals', 'cow': 'animals', 'horse': 'animals', 'primate': 'animals',
  'murine': 'animals', 'rodent': 'animals', 'mus musculus': 'animals', 'rattus': 'animals',
  'bunny': 'animals', 'oryctolagus': 'animals', 'canine': 'animals', 'canis': 'animals',
  'feline': 'animals', 'felis': 'animals', 'swine': 'animals', 'porcine': 'animals',
  'sus scrofa': 'animals', 'danio rerio': 'animals', 'fish model': 'animals',
  'fly model': 'animals', 'worm model': 'animals', 'nematode': 'animals', 'worm': 'animals',

  // Proteins & Biochemistry
  'protein': 'proteins', 'proteins': 'proteins', 'enzyme': 'proteins', 'enzymes': 'proteins',
  'antibody': 'proteins', 'antibodies': 'proteins', 'polypeptide': 'proteins',
  'immunoglobulin': 'proteins', 'catalyst': 'proteins', 'enzymatic': 'proteins',

  // Genetics
  'dna': 'genetics', 'rna': 'genetics', 'gene': 'genetics', 'genes': 'genetics',
  'genetic': 'genetics', 'genome': 'genetics', 'chromosome': 'genetics', 'chromosomes': 'genetics',
  'allele': 'genetics', 'locus': 'genetics', 'chromatin': 'genetics',
  'deoxyribonucleic acid': 'genetics', 'ribonucleic acid': 'genetics', 'genetic material': 'genetics',
  'mrna': 'genetics', 'transcript': 'genetics', 'sequencing': 'genetics', 'dna sequencing': 'genetics',
  'genome sequencing': 'genetics', 'cloning': 'genetics', 'molecular cloning': 'genetics',
  'gene cloning': 'genetics', 'transfection': 'genetics', 'gene delivery': 'genetics',
  'transformation': 'genetics',

  // Chemistry
  'molecule': 'chemistry', 'molecular': 'chemistry', 'compound': 'chemistry', 'chemical': 'chemistry',
  'chemistry': 'chemistry', 'substance': 'chemistry', 'material': 'chemistry',
  'reaction': 'chemistry', 'reactions': 'chemistry', 'chemical reaction': 'chemistry',
  'synthesis': 'chemistry', 'synthetic': 'chemistry', 'production': 'chemistry',
  'formation': 'chemistry', 'catalysis': 'chemistry', 'accelerator': 'chemistry',
  'acid': 'chemistry', 'acidic': 'chemistry', 'base': 'chemistry', 'basic': 'chemistry',
  'alkaline': 'chemistry', 'ph': 'chemistry', 'hydrogen ion': 'chemistry',
  'ion': 'chemistry', 'ionic': 'chemistry', 'charged': 'chemistry', 'electrolyte': 'chemistry',
  'bond': 'chemistry', 'bonding': 'chemistry', 'chemical bond': 'chemistry', 'molecular bond': 'chemistry',

  // Space & Astronomy
  'space': 'space', 'outer space': 'space', 'cosmos': 'space', 'universe': 'space',
  'celestial': 'space', 'planet': 'space', 'planets': 'space', 'planetary': 'space',
  'celestial body': 'space', 'star': 'space', 'stars': 'space', 'stellar': 'space',
  'sun': 'space', 'solar': 'space', 'galaxy': 'space', 'galaxies': 'space',
  'galactic': 'space', 'milky way': 'space', 'solar system': 'space', 'planetary system': 'space',
  'orbit': 'space', 'orbital': 'space', 'revolution': 'space', 'trajectory': 'space',
  'satellite': 'space', 'satellites': 'space', 'spacecraft': 'space', 'space vehicle': 'space',
  'rocket': 'space', 'probe': 'space', 'astronaut': 'space', 'astronauts': 'space',
  'cosmonaut': 'space', 'space traveler': 'space', 'mars': 'space', 'martian': 'space',
  'red planet': 'space', 'moon': 'space', 'lunar': 'space', 'earth': 'space',
  'terrestrial': 'space', 'planet earth': 'space', 'world': 'space',
  'atmosphere': 'space', 'atmospheric': 'space', 'air': 'space', 'gas layer': 'space',
  'gravity': 'space', 'gravitational': 'space', 'force': 'space', 'attraction': 'space',
  'radiation': 'space', 'cosmic radiation': 'space', 'electromagnetic': 'space',
  'astrobiology': 'space', 'exobiology': 'space', 'space biology': 'space',
  'life in space': 'space', 'exoplanet': 'space', 'extrasolar planet': 'space',
  'alien world': 'space', 'habitable': 'space', 'life-supporting': 'space',
  'goldilocks zone': 'space', 'extremophile': 'space', 'extreme organism': 'space',
  'hardy organism': 'space', 'microgravity': 'space', 'zero gravity': 'space',
  'weightlessness': 'space', 'space station': 'space', 'orbital laboratory': 'space',
  'iss': 'space', 'international space station': 'space',

  // Medical & Biology
  'cancer': 'medical', 'oncology': 'medical', 'tumor': 'medical', 'tumour': 'medical',
  'malignancy': 'medical', 'carcinoma': 'medical', 'neoplasm': 'medical', 'malignant': 'medical',
  'growth': 'medical', 'mass': 'medical', 'disease': 'medical', 'illness': 'medical',
  'disorder': 'medical', 'condition': 'medical', 'pathology': 'medical', 'syndrome': 'medical',
  'treatment': 'medical', 'therapy': 'medical', 'intervention': 'medical', 'cure': 'medical',
  'remedy': 'medical', 'medication': 'medical', 'drug': 'medical', 'medicine': 'medical',
  'pharmaceutical': 'medical',

  // Microbiology
  'bacteria': 'microbiology', 'bacterial': 'microbiology', 'microbe': 'microbiology',
  'microbes': 'microbiology', 'microorganism': 'microbiology', 'prokaryote': 'microbiology',
  'prokaryotic': 'microbiology', 'virus': 'microbiology', 'viral': 'microbiology',
  'pathogen': 'microbiology', 'pathogens': 'microbiology', 'infectious': 'microbiology',
  'antibiotic': 'microbiology', 'antibiotics': 'microbiology', 'antimicrobial': 'microbiology',
  'drug resistance': 'microbiology', 'resistance': 'microbiology', 'resistant': 'microbiology',
  'immunity': 'microbiology', 'tolerance': 'microbiology', 'infection': 'microbiology',
  'contamination': 'microbiology', 'strain': 'microbiology', 'strains': 'microbiology',
  'isolate': 'microbiology', 'variant': 'microbiology',

  // Laboratory
  'culture': 'laboratory', 'cultures': 'laboratory', 'cultivation': 'laboratory',
  'medium': 'laboratory', 'media': 'laboratory', 'culture medium': 'laboratory',
  'growth medium': 'laboratory', 'incubation': 'laboratory', 'incubate': 'laboratory',
  'colony': 'laboratory', 'colonies': 'laboratory', 'bacterial growth': 'laboratory',
  'petri dish': 'laboratory', 'plate': 'laboratory', 'culture plate': 'laboratory',
  'agar plate': 'laboratory', 'agar': 'laboratory', 'sterile': 'laboratory',
  'sterilization': 'laboratory', 'aseptic': 'laboratory', 'contamination-free': 'laboratory',
  'contaminated': 'laboratory', 'pcr': 'laboratory', 'polymerase chain reaction': 'laboratory',
  'amplification': 'laboratory', 'western blot': 'laboratory', 'immunoblot': 'laboratory',
  'protein detection': 'laboratory', 'elisa': 'laboratory', 'enzyme-linked immunosorbent assay': 'laboratory',

  // Research & Academic
  'study': 'research', 'research': 'research', 'investigation': 'research',
  'analysis': 'research', 'analytical': 'research', 'examination': 'research',
  'experiment': 'research', 'experimental': 'research', 'trial': 'research',
  'test': 'research', 'result': 'research', 'results': 'research',
  'outcome': 'research', 'finding': 'research', 'conclusion': 'research',
  'findings': 'research', 'outcomes': 'research', 'conclusions': 'research',
  'discoveries': 'research', 'examine': 'research', 'evaluation': 'research',
  'model': 'research', 'modeling': 'research', 'modelling': 'research',
  'simulation': 'research', 'framework': 'research', 'method': 'research',
  'methodology': 'research', 'approach': 'research', 'technique': 'research',
  'procedure': 'research', 'methods': 'research', 'approaches': 'research',
  'techniques': 'research', 'procedures': 'research'
};

// Function to get category for a term
function getTermCategory(term: string): keyof typeof CATEGORY_COLORS {
  return TERM_CATEGORIES[term.toLowerCase()] || 'default';
}

// Function to get color for a term
export function getTermColor(term: string): string {
  const category = getTermCategory(term);
  return CATEGORY_COLORS[category];
}

// Research animals array - comprehensive list of model organisms and research animals
const RESEARCH_ANIMALS = [
  // Mammals
  'mouse', 'mice', 'rat', 'rats', 'rabbit', 'rabbits', 'guinea pig', 'hamster', 'gerbil',
  'monkey', 'macaque', 'rhesus', 'baboon', 'marmoset', 'chimpanzee', 'pig', 'minipig',
  'dog', 'beagle', 'cat', 'ferret', 'sheep', 'goat', 'cow', 'horse', 'primate',

  // Aquatic models
  'zebrafish', 'medaka', 'killifish', 'goldfish', 'salmon', 'trout', 'frog', 'xenopus',
  'tadpole', 'axolotl', 'sea urchin', 'sea anemone',

  // Invertebrates
  'drosophila', 'fruit fly', 'c elegans', 'caenorhabditis elegans', 'nematode', 'worm',
  'sea slug', 'aplysia', 'squid', 'octopus', 'crab', 'lobster', 'shrimp', 'spider',
  'bee', 'honeybee', 'ant', 'wasp', 'butterfly', 'moth', 'cricket', 'locust',

  // Other models
  'yeast', 'saccharomyces', 'e coli', 'bacteria', 'arabidopsis', 'tobacco', 'corn',
  'rice', 'wheat', 'tomato', 'potato', 'soybean', 'pea', 'bean', 'moss', 'algae',
  'chlamydomonas', 'paramecium', 'amoeba', 'hydra', 'planaria', 'leech',

  // Marine organisms
  'sea turtle', 'dolphin', 'whale', 'seal', 'sea lion', 'manatee', 'shark', 'ray',
  'starfish', 'sea star', 'jellyfish', 'coral', 'sponge', 'barnacle', 'mussel',
  'oyster', 'clam', 'scallop', 'snail', 'slug', 'whelk', 'conch'
];

// Academic/Scientific synonym dictionary
const SYNONYM_DICTIONARY: Record<string, string[]> = {
  // Machine Learning & AI
  'ai': ['artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural networks', 'algorithms'],
  'artificial intelligence': ['ai', 'machine learning', 'ml', 'deep learning', 'neural networks'],
  'machine learning': ['ml', 'ai', 'artificial intelligence', 'deep learning', 'algorithms', 'pattern recognition'],
  'ml': ['machine learning', 'ai', 'artificial intelligence', 'deep learning'],
  'deep learning': ['neural networks', 'ai', 'machine learning', 'ml', 'artificial intelligence'],
  'neural networks': ['deep learning', 'ai', 'machine learning', 'artificial intelligence'],
  'algorithm': ['algorithms', 'method', 'approach', 'technique', 'procedure'],
  'algorithms': ['algorithm', 'methods', 'approaches', 'techniques', 'procedures'],

  // Medical & Biology
  'cancer': ['oncology', 'tumor', 'tumour', 'malignancy', 'carcinoma', 'neoplasm', 'malignant'],
  'tumor': ['tumour', 'cancer', 'neoplasm', 'growth', 'mass', 'oncology'],
  'tumour': ['tumor', 'cancer', 'neoplasm', 'growth', 'mass', 'oncology'],
  'disease': ['illness', 'disorder', 'condition', 'pathology', 'syndrome'],
  'treatment': ['therapy', 'intervention', 'cure', 'remedy', 'medication'],
  'therapy': ['treatment', 'intervention', 'cure', 'remedy'],
  'drug': ['medication', 'medicine', 'pharmaceutical', 'compound'],
  'medication': ['drug', 'medicine', 'pharmaceutical', 'treatment'],

  // Research Animals
  'animal': RESEARCH_ANIMALS,
  'animals': RESEARCH_ANIMALS,
  'research animal': RESEARCH_ANIMALS,
  'research animals': RESEARCH_ANIMALS,
  'model organism': RESEARCH_ANIMALS,
  'model organisms': RESEARCH_ANIMALS,
  'mouse': ['mice', 'murine', 'rodent', 'mus musculus'],
  'mice': ['mouse', 'murine', 'rodent', 'mus musculus'],
  'rat': ['rats', 'rattus', 'rodent'],
  'rats': ['rat', 'rattus', 'rodent'],
  'rabbit': ['rabbits', 'bunny', 'oryctolagus'],
  'monkey': ['monkeys', 'primate', 'macaque', 'rhesus'],
  'pig': ['pigs', 'swine', 'porcine', 'sus scrofa'],
  'dog': ['dogs', 'canine', 'canis'],
  'cat': ['cats', 'feline', 'felis'],
  'zebrafish': ['danio rerio', 'fish model'],
  'drosophila': ['fruit fly', 'fly model'],
  'c elegans': ['caenorhabditis elegans', 'worm model', 'nematode'],

  // Proteins & Biochemistry
  'protein': ['proteins', 'polypeptide', 'enzyme', 'antibody'],
  'enzyme': ['enzymes', 'protein', 'catalyst', 'enzymatic'],
  'antibody': ['antibodies', 'immunoglobulin', 'protein'],
  'dna': ['deoxyribonucleic acid', 'genetic material', 'genome'],
  'rna': ['ribonucleic acid', 'mrna', 'transcript'],
  'gene': ['genes', 'genetic', 'allele', 'locus'],
  'chromosome': ['chromosomes', 'chromatin', 'genetic'],
  'cell': ['cells', 'cellular', 'cytoplasm', 'membrane'],
  'mitochondria': ['mitochondrial', 'organelle', 'powerhouse'],
  'nucleus': ['nuclear', 'nuclei', 'chromatin'],

  // Chemical Terms
  'molecule': ['molecular', 'compound', 'chemical', 'substance'],
  'compound': ['chemical', 'molecule', 'substance', 'material'],
  'chemical': ['chemistry', 'compound', 'molecule', 'substance'],
  'reaction': ['reactions', 'chemical reaction', 'synthesis'],
  'synthesis': ['synthetic', 'production', 'formation'],
  'catalyst': ['catalysis', 'enzyme', 'accelerator'],
  'acid': ['acidic', 'ph', 'hydrogen ion'],
  'base': ['basic', 'alkaline', 'ph'],
  'ion': ['ionic', 'charged', 'electrolyte'],
  'bond': ['bonding', 'chemical bond', 'molecular bond'],

  // Molecular Biology
  'pcr': ['polymerase chain reaction', 'amplification'],
  'western blot': ['immunoblot', 'protein detection'],
  'elisa': ['enzyme-linked immunosorbent assay'],
  'sequencing': ['dna sequencing', 'genome sequencing'],
  'cloning': ['molecular cloning', 'gene cloning'],
  'transfection': ['gene delivery', 'transformation'],

  // Bacteria & Microbiology
  'bacteria': ['bacterial', 'microbe', 'microorganism', 'prokaryote'],
  'bacterial': ['bacteria', 'microbe', 'microorganism', 'prokaryotic'],
  'microbe': ['microbes', 'bacteria', 'microorganism', 'pathogen'],
  'virus': ['viral', 'pathogen', 'infection', 'microorganism'],
  'pathogen': ['pathogens', 'bacteria', 'virus', 'microbe', 'infectious'],
  'antibiotic': ['antibiotics', 'antimicrobial', 'drug resistance'],
  'resistance': ['resistant', 'immunity', 'tolerance'],
  'infection': ['infectious', 'pathogen', 'disease', 'contamination'],
  'strain': ['strains', 'isolate', 'culture', 'variant'],

  // Cell Culture & Laboratory
  'culture': ['cultures', 'cultivation', 'growth', 'medium'],
  'medium': ['media', 'culture medium', 'growth medium'],
  'incubation': ['incubate', 'growth', 'cultivation'],
  'colony': ['colonies', 'bacterial growth', 'culture'],
  'petri dish': ['plate', 'culture plate', 'agar plate'],
  'agar': ['culture medium', 'growth medium', 'plate'],
  'sterile': ['sterilization', 'aseptic', 'contamination-free'],
  'contamination': ['contaminated', 'sterile', 'infection'],

  // Space & Astronomy
  'space': ['outer space', 'cosmos', 'universe', 'celestial'],
  'planet': ['planets', 'planetary', 'celestial body'],
  'star': ['stars', 'stellar', 'sun', 'solar'],
  'galaxy': ['galaxies', 'galactic', 'milky way'],
  'solar system': ['planetary system', 'sun system'],
  'orbit': ['orbital', 'revolution', 'trajectory'],
  'satellite': ['satellites', 'moon', 'spacecraft'],
  'spacecraft': ['space vehicle', 'rocket', 'probe'],
  'astronaut': ['astronauts', 'cosmonaut', 'space traveler'],
  'mars': ['martian', 'red planet'],
  'moon': ['lunar', 'satellite', 'celestial body'],
  'earth': ['terrestrial', 'planet earth', 'world'],
  'atmosphere': ['atmospheric', 'air', 'gas layer'],
  'gravity': ['gravitational', 'force', 'attraction'],
  'radiation': ['cosmic radiation', 'electromagnetic', 'energy'],

  // Astrobiology & Space Biology
  'astrobiology': ['exobiology', 'space biology', 'life in space'],
  'exoplanet': ['extrasolar planet', 'alien world'],
  'habitable': ['life-supporting', 'goldilocks zone'],
  'extremophile': ['extreme organism', 'hardy organism'],
  'microgravity': ['zero gravity', 'weightlessness'],
  'space station': ['orbital laboratory', 'iss'],
  'iss': ['international space station', 'space station'],

  // Climate & Environment
  'climate': ['weather', 'atmospheric', 'environmental', 'meteorological'],
  'global warming': ['climate change', 'greenhouse effect', 'carbon emissions'],
  'climate change': ['global warming', 'greenhouse effect', 'environmental change'],
  'environment': ['environmental', 'ecology', 'ecosystem', 'nature'],
  'pollution': ['contamination', 'emissions', 'waste', 'toxic'],

  // Physics & Chemistry
  'quantum': ['quantum mechanics', 'quantum physics', 'subatomic'],
  'energy': ['power', 'electricity', 'thermal', 'kinetic', 'potential'],
  'atom': ['atomic', 'particle', 'element'],

  // Computer Science
  'computer': ['computing', 'computational', 'digital', 'electronic'],
  'software': ['program', 'application', 'code', 'system'],
  'data': ['information', 'dataset', 'database', 'records'],
  'network': ['networking', 'internet', 'connectivity', 'communication'],

  // Mathematics & Statistics
  'statistics': ['statistical', 'stats', 'probability', 'analysis'],
  'analysis': ['analytical', 'examine', 'study', 'evaluation'],
  'model': ['modeling', 'modelling', 'simulation', 'framework'],
  'method': ['methodology', 'approach', 'technique', 'procedure'],

  // Research & Academic
  'study': ['research', 'investigation', 'analysis', 'examination'],
  'research': ['study', 'investigation', 'analysis', 'examination'],
  'experiment': ['experimental', 'trial', 'test', 'investigation'],
  'result': ['results', 'outcome', 'finding', 'conclusion'],
  'findings': ['results', 'outcomes', 'conclusions', 'discoveries'],
};

// Common abbreviations and their full forms
const ABBREVIATIONS: Record<string, string[]> = {
  'ai': ['artificial intelligence'],
  'ml': ['machine learning'],
  'dl': ['deep learning'],
  'nn': ['neural networks', 'neural network'],
  'nlp': ['natural language processing'],
  'cv': ['computer vision'],
  'iot': ['internet of things'],
  'api': ['application programming interface'],
  'ui': ['user interface'],
  'ux': ['user experience'],
  'dna': ['deoxyribonucleic acid'],
  'rna': ['ribonucleic acid'],
  'covid': ['coronavirus', 'sars-cov-2'],
  'hiv': ['human immunodeficiency virus'],
  'mri': ['magnetic resonance imaging'],
  'ct': ['computed tomography'],
  'gps': ['global positioning system'],
  'nasa': ['national aeronautics and space administration'],
};

// Simple stemming function (removes common suffixes) - more conservative to avoid flower->flow
function stem(word: string): string {
  // Only stem longer words and avoid over-stemming that creates false matches
  const suffixes = ['ing', 'tion', 'sion', 'ness', 'ment', 'ful', 'less'];

  let stemmed = word.toLowerCase();

  // Only stem if word is long enough and won't create ambiguity
  if (stemmed.length > 6) {
    for (const suffix of suffixes) {
      if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 3) {
        stemmed = stemmed.slice(0, -suffix.length);
        break;
      }
    }
  }

  return stemmed;
}

// Check if a term matches as a whole word in text
function matchesWholeWord(text: string, term: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();

  // Use word boundary matching for all terms to avoid false matches like "rat" in "muratani"
  const words = lowerText.split(/\W+/);
  return words.includes(lowerTerm);
}

// Get semantic terms for a query without AI
export function getSemanticTerms(query: string): string[] {
  if (!query || query.trim() === '') return [];

  const terms = new Set<string>();
  const queryLower = query.toLowerCase().trim();

  // Add original query
  terms.add(queryLower);

  // Add stemmed version
  const stemmed = stem(queryLower);
  if (stemmed !== queryLower) {
    terms.add(stemmed);
  }

  // Check for exact matches in synonym dictionary
  if (SYNONYM_DICTIONARY[queryLower]) {
    SYNONYM_DICTIONARY[queryLower].forEach(synonym => terms.add(synonym.toLowerCase()));
  }

  // Check for abbreviations
  if (ABBREVIATIONS[queryLower]) {
    ABBREVIATIONS[queryLower].forEach(fullForm => terms.add(fullForm.toLowerCase()));
  }

  // Check if query is a full form of an abbreviation
  for (const [abbrev, fullForms] of Object.entries(ABBREVIATIONS)) {
    if (fullForms.some(form => form.toLowerCase() === queryLower)) {
      terms.add(abbrev);
    }
  }

  // Check for partial matches in synonym keys (more restrictive)
  for (const [key, synonyms] of Object.entries(SYNONYM_DICTIONARY)) {
    // Only match if query is a significant part of the key (not just 1-2 characters)
    if (queryLower.length >= 3 && key.includes(queryLower)) {
      synonyms.forEach(synonym => terms.add(synonym.toLowerCase()));
    }

    // Check if any synonym contains the query (only for longer queries)
    // Skip reverse lookup to prevent "mice" from finding "animal"
    // Also skip adding all animals when searching for a specific animal
    if (queryLower.length >= 3) {
      synonyms.forEach(synonym => {
        if (synonym.toLowerCase().includes(queryLower)) {
          // Don't add the key back to prevent reverse relationships like "mice" -> "animal"
          // Don't add all synonyms if the key is "animal" or similar broad categories
          if (key !== 'animal' && key !== 'animals' && key !== 'research animal' &&
            key !== 'research animals' && key !== 'model organism' && key !== 'model organisms') {
            // Only add other synonyms that are not the original query
            synonyms.forEach(s => {
              if (s.toLowerCase() !== queryLower) {
                terms.add(s.toLowerCase());
              }
            });
          }
        }
      });
    }
  }

  // Convert back to array and limit results
  return Array.from(terms).slice(0, 10);
}

// Enhanced search function that uses semantic terms with proper word boundaries
export function semanticSearch(text: string, query: string): boolean {
  if (!query || !text) return false;

  const semanticTerms = getSemanticTerms(query);

  return semanticTerms.some(term => matchesWholeWord(text, term));
}

// Get all semantic terms for highlighting with word boundary consideration
export function getHighlightTerms(query: string): string[] {
  return getSemanticTerms(query);
}

// Parse compound queries (e.g., "mice AND protein")
export function parseCompoundQuery(query: string): { conditions: string[], isCompound: boolean } {
  const andPattern = /\s+and\s+/i;

  if (andPattern.test(query)) {
    const conditions = query.split(andPattern).map(condition => condition.trim()).filter(c => c.length > 0);
    return { conditions, isCompound: true };
  }

  return { conditions: [query], isCompound: false };
}

// Enhanced search function for compound queries
export function semanticSearchCompound(text: string, query: string): boolean {
  if (!query || !text) return false;

  const { conditions, isCompound } = parseCompoundQuery(query);

  if (isCompound) {
    // ALL conditions must match (AND logic)
    return conditions.every(condition => {
      const semanticTerms = getSemanticTerms(condition);
      return semanticTerms.some(term => matchesWholeWord(text, term));
    });
  } else {
    // Single condition - use regular semantic search
    return semanticSearch(text, query);
  }
}

// Get semantic terms for each condition in compound queries
export function getCompoundHighlightTerms(query: string): Array<{ condition: string, terms: string[], conditionIndex: number }> {
  const { conditions, isCompound } = parseCompoundQuery(query);

  return conditions.map((condition, index) => ({
    condition: condition.trim(),
    terms: getSemanticTerms(condition.trim()),
    conditionIndex: index
  }));
}

// Find word boundaries for highlighting with condition tracking and color information
export function findWordMatches(text: string, term: string): Array<{ start: number, end: number, color: string, category: string }> {
  const matches: Array<{ start: number, end: number, color: string, category: string }> = [];
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();

  // Use word boundary matching for all terms to avoid highlighting "rat" in "alterations"
  const words = text.split(/(\W+)/); // Split but keep separators
  let currentIndex = 0;

  const color = getTermColor(term);
  const category = getTermCategory(term);

  for (const word of words) {
    if (word.toLowerCase() === lowerTerm) {
      matches.push({
        start: currentIndex,
        end: currentIndex + word.length,
        color,
        category
      });
    }
    currentIndex += word.length;
  }

  return matches;
}

// Find matches for compound queries with condition tracking and color information
export function findCompoundWordMatches(text: string, query: string): Array<{ start: number, end: number, term: string, conditionIndex: number, isOriginal: boolean, color: string, category: string }> {
  const compoundTerms = getCompoundHighlightTerms(query);
  const allMatches: Array<{ start: number, end: number, term: string, conditionIndex: number, isOriginal: boolean, color: string, category: string }> = [];

  compoundTerms.forEach(({ condition, terms, conditionIndex }) => {
    terms.forEach(term => {
      const wordMatches = findWordMatches(text, term);
      wordMatches.forEach(match => {
        allMatches.push({
          start: match.start,
          end: match.end,
          term: text.slice(match.start, match.end),
          conditionIndex,
          isOriginal: term.toLowerCase() === condition.toLowerCase(),
          color: match.color,
          category: match.category
        });
      });
    });
  });

  return allMatches;
}

// Get all unique categories found in a query for legend/reference
export function getQueryCategories(query: string): Array<{ category: keyof typeof CATEGORY_COLORS, color: string, count: number }> {
  const terms = getSemanticTerms(query);
  const categoryCount = new Map<keyof typeof CATEGORY_COLORS, number>();

  terms.forEach(term => {
    const category = getTermCategory(term);
    categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
  });

  return Array.from(categoryCount.entries()).map(([category, count]) => ({
    category,
    color: CATEGORY_COLORS[category],
    count
  })).sort((a, b) => b.count - a.count); // Sort by frequency
}

// Helper function to get category display name
export function getCategoryDisplayName(category: keyof typeof CATEGORY_COLORS): string {
  const displayNames: Record<keyof typeof CATEGORY_COLORS, string> = {
    animals: 'Research Animals',
    proteins: 'Proteins & Enzymes',
    genetics: 'Genetics & DNA',
    chemistry: 'Chemistry',
    space: 'Space & Astronomy',
    medical: 'Medical & Biology',
    microbiology: 'Microbiology',
    laboratory: 'Laboratory Methods',
    research: 'Research & Analysis',
    default: 'General Terms'
  };

  return displayNames[category] || category;
}
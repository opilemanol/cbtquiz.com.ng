import type { Subject, Topic, Question } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'english', name: 'English', code: 'ENG', active: true, displayOrder: 1, description: 'JAMB UTME Use of English (Lexis, Structure, Comprehension & Novel)' },
  { id: 'mathematics', name: 'Mathematics', code: 'MTH', active: true, displayOrder: 2, description: 'General Mathematics, Algebra, Calculus & Geometry' },
  { id: 'physics', name: 'Physics', code: 'PHY', active: true, displayOrder: 3, description: 'Mechanics, Heat, Waves, Electricity & Modern Physics' },
  { id: 'chemistry', name: 'Chemistry', code: 'CHM', active: true, displayOrder: 4, description: 'General, Physical, Inorganic & Organic Chemistry' },
  { id: 'biology', name: 'Biology', code: 'BIO', active: true, displayOrder: 5, description: 'Ecology, Genetics, Cell Biology & Human Anatomy' },
  { id: 'economics', name: 'Economics', code: 'ECO', active: true, displayOrder: 6, description: 'Microeconomics, Macroeconomics & Public Finance' },
  { id: 'government', name: 'Government', code: 'GOV', active: true, displayOrder: 7, description: 'Political Science, Nigerian & International Politics' },
  { id: 'literature', name: 'Literature Textbooks', code: 'LIT', active: true, displayOrder: 8, description: 'Drama, Poetry, Prose & Prescribed Texts' },
  { id: 'life_changer', name: 'The Life Changer', code: 'TLC', active: true, displayOrder: 9, description: 'Compulsory Reading Text by Khadija Abubakar Jalli' },
  { id: 'commerce', name: 'Commerce', code: 'COM', active: true, displayOrder: 10, description: 'Trade, Banking, Insurance & Marketing' },
  { id: 'accounts', name: 'Accounts', code: 'ACC', active: true, displayOrder: 11, description: 'Principles of Accounting & Bookkeeping' },
  { id: 'agriculture', name: 'Agriculture', code: 'AGR', active: true, displayOrder: 12, description: 'Crop Science, Animal Husbandry & Soil Science' },
  { id: 'crk', name: 'CRK', code: 'CRK', active: true, displayOrder: 13, description: 'Christian Religious Knowledge' },
  { id: 'geography', name: 'Geography', code: 'GEO', active: true, displayOrder: 14, description: 'Physical, Regional & Human Geography' },
  { id: 'french', name: 'French', code: 'FRN', active: true, displayOrder: 15, description: 'Grammaire, Vocabulaire et Compréhension' },
  { id: 'history', name: 'History', code: 'HIS', active: true, displayOrder: 16, description: 'Nigerian & African History' },
  { id: 'fine_art', name: 'Fine Art', code: 'ART', active: true, displayOrder: 17, description: 'Visual Arts, History of Art & Design' },
  { id: 'hausa', name: 'Hausa', code: 'HAU', active: true, displayOrder: 18, description: 'Harshe da Al\'adun Hausa' },
  { id: 'arabic', name: 'Arabic', code: 'ARB', active: true, displayOrder: 19, description: 'Arabic Language and Literature' },
];

export const INITIAL_TOPICS: Topic[] = [
  // English
  { id: 'top_eng_1', subjectId: 'english', name: 'Independence (Prescribed Novel)', active: true, displayOrder: 1 },
  { id: 'top_eng_2', subjectId: 'english', name: 'Comprehension & Summary', active: true, displayOrder: 2 },
  { id: 'top_eng_3', subjectId: 'english', name: 'Lexis and Structure', active: true, displayOrder: 3 },
  { id: 'top_eng_4', subjectId: 'english', name: 'Antonyms & Synonyms', active: true, displayOrder: 4 },
  { id: 'top_eng_5', subjectId: 'english', name: 'Oral English & Vowels', active: true, displayOrder: 5 },

  // Mathematics
  { id: 'top_mth_1', subjectId: 'mathematics', name: 'Algebra & Polynomials', active: true, displayOrder: 1 },
  { id: 'top_mth_2', subjectId: 'mathematics', name: 'Calculus (Differentiation & Integration)', active: true, displayOrder: 2 },
  { id: 'top_mth_3', subjectId: 'mathematics', name: 'Trigonometry & Geometry', active: true, displayOrder: 3 },
  { id: 'top_mth_4', subjectId: 'mathematics', name: 'Statistics & Probability', active: true, displayOrder: 4 },
  { id: 'top_mth_5', subjectId: 'mathematics', name: 'Matrices & Determinants', active: true, displayOrder: 5 },

  // Physics
  { id: 'top_phy_1', subjectId: 'physics', name: 'Mechanics & Motion', active: true, displayOrder: 1 },
  { id: 'top_phy_2', subjectId: 'physics', name: 'Electricity & Magnetism', active: true, displayOrder: 2 },
  { id: 'top_phy_3', subjectId: 'physics', name: 'Waves, Light & Optics', active: true, displayOrder: 3 },
  { id: 'top_phy_4', subjectId: 'physics', name: 'Thermal Physics', active: true, displayOrder: 4 },
  { id: 'top_phy_5', subjectId: 'physics', name: 'Atomic & Nuclear Physics', active: true, displayOrder: 5 },

  // Chemistry
  { id: 'top_chm_1', subjectId: 'chemistry', name: 'Periodic Table & Atomic Structure', active: true, displayOrder: 1 },
  { id: 'top_chm_2', subjectId: 'chemistry', name: 'Chemical Bonding & Stoichiometry', active: true, displayOrder: 2 },
  { id: 'top_chm_3', subjectId: 'chemistry', name: 'Acids, Bases and Salts', active: true, displayOrder: 3 },
  { id: 'top_chm_4', subjectId: 'chemistry', name: 'Organic Chemistry & Hydrocarbons', active: true, displayOrder: 4 },
  { id: 'top_chm_5', subjectId: 'chemistry', name: 'Electrochemistry & Redox Reactions', active: true, displayOrder: 5 },

  // Biology
  { id: 'top_bio_1', subjectId: 'biology', name: 'Cell Biology & Organization of Life', active: true, displayOrder: 1 },
  { id: 'top_bio_2', subjectId: 'biology', name: 'Genetics & Evolution', active: true, displayOrder: 2 },
  { id: 'top_bio_3', subjectId: 'biology', name: 'Ecology & Ecosystems', active: true, displayOrder: 3 },
  { id: 'top_bio_4', subjectId: 'biology', name: 'Physiology & Nutrition', active: true, displayOrder: 4 },

  // Economics
  { id: 'top_eco_1', subjectId: 'economics', name: 'Theory of Demand and Supply', active: true, displayOrder: 1 },
  { id: 'top_eco_2', subjectId: 'economics', name: 'Inflation & National Income', active: true, displayOrder: 2 },

  // Government
  { id: 'top_gov_1', subjectId: 'government', name: 'Constitutional Development in Nigeria', active: true, displayOrder: 1 },
  { id: 'top_gov_2', subjectId: 'government', name: 'Arms of Government & Public Administration', active: true, displayOrder: 2 },

  // The Life Changer
  { id: 'top_tlc_1', subjectId: 'life_changer', name: 'Campus Life & Salma\'s Experience', active: true, displayOrder: 1 },
  { id: 'top_tlc_2', subjectId: 'life_changer', name: 'Characters & Themes', active: true, displayOrder: 2 },
];

export const INITIAL_QUESTIONS: Question[] = [
  // --- ENGLISH QUESTIONS ---
  // SCREENSHOT 1 PRIMARY QUESTION:
  {
    id: 'eng_001',
    subjectId: 'english',
    subjectName: 'English',
    topicId: 'top_eng_1',
    topicName: 'Independence (Prescribed Novel)',
    passage: "This question is based on S.L. Manyika's IN DEPENDENCE.",
    questionText: "Tayo regarded Yusuf's establishment of several Christian television stations as",
    options: [
      'humanitarian',
      'hypocritic',
      'true belief in christ',
      'opportunistic'
    ],
    correctAnswerIndex: 3,
    solution: "In S.L. Manyika's novel 'In Dependence', Tayo views Yusuf's foray into setting up Christian TV stations as purely opportunistic, capitalizing on religious television commercialization rather than authentic devotion.",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'eng_002',
    subjectId: 'english',
    subjectName: 'English',
    topicId: 'top_eng_3',
    topicName: 'Lexis and Structure',
    passage: 'Choose the option that nearest in meaning to the capitalized word.',
    questionText: 'The commissioner made a CONCILIATORY statement after the peaceful protest.',
    options: [
      'provocative',
      'peacemaking',
      'condemnatory',
      'argumentative'
    ],
    correctAnswerIndex: 1,
    solution: "'Conciliatory' means intended to placate or pacify, hence 'peacemaking' is the closest in meaning.",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'eng_003',
    subjectId: 'english',
    subjectName: 'English',
    topicId: 'top_eng_4',
    topicName: 'Antonyms & Synonyms',
    passage: 'Choose the word that is opposite in meaning to the underlined word.',
    questionText: 'The witness gave a MENDACIOUS statement under oath.',
    options: [
      'deceitful',
      'truthful',
      'confusing',
      'verbose'
    ],
    correctAnswerIndex: 1,
    solution: "'Mendacious' means not telling the truth or lying. The opposite is 'truthful'.",
    difficulty: 'medium',
    year: 2026,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'eng_004',
    subjectId: 'english',
    subjectName: 'English',
    topicId: 'top_eng_3',
    topicName: 'Lexis and Structure',
    passage: 'Choose the option that best completes the sentence.',
    questionText: 'Neither the teacher nor the students _______ present at the convocation ceremony yesterday.',
    options: [
      'was',
      'were',
      'are',
      'is'
    ],
    correctAnswerIndex: 1,
    solution: "According to the rule of proximity in subject-verb agreement with 'neither...nor', the verb agrees with the closer subject ('the students', plural) in past tense: 'were'.",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'eng_005',
    subjectId: 'english',
    subjectName: 'English',
    topicId: 'top_eng_5',
    topicName: 'Oral English & Vowels',
    questionText: 'Which of the following words contains the same vowel sound as the underlined sound in "cl<u>er</u>k"?',
    options: [
      'heart',
      'nurse',
      'park',
      'guard'
    ],
    correctAnswerIndex: 2,
    solution: "In Received Pronunciation (British English standard for JAMB), 'clerk' is pronounced /klɑːk/, sharing the /ɑː/ vowel sound with 'park' and 'heart'. In JAMB syllabus, 'park' is the designated standard.",
    difficulty: 'hard',
    year: 2025,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'eng_006',
    subjectId: 'english',
    subjectName: 'English',
    topicId: 'top_eng_1',
    topicName: 'Independence (Prescribed Novel)',
    passage: "Based on S.L. Manyika's IN DEPENDENCE.",
    questionText: "What was Tayo's primary course of study when he arrived at Balliol College, Oxford?",
    options: [
      'Medicine and Surgery',
      'Modern History',
      'Law and Jurisprudence',
      'Political Science'
    ],
    correctAnswerIndex: 1,
    solution: "Tayo Ajayi went to Balliol College, Oxford on a government scholarship to study Modern History.",
    difficulty: 'easy',
    year: 2026,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'eng_007',
    subjectId: 'english',
    subjectName: 'English',
    topicId: 'top_eng_3',
    topicName: 'Lexis and Structure',
    questionText: 'Had I known about the changes in the syllabus, I _______ differently.',
    options: [
      'would prepare',
      'will have prepared',
      'would have prepared',
      'should prepare'
    ],
    correctAnswerIndex: 2,
    solution: "In third conditional sentences expressing an unreal past event ('Had I known...'), the main clause requires 'would have + past participle' (would have prepared).",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'eng_008',
    subjectId: 'english',
    subjectName: 'English',
    topicId: 'top_eng_2',
    topicName: 'Comprehension & Summary',
    questionText: 'An author\'s attitude in an expository essay that relies purely on empirical statistics is best described as:',
    options: [
      'subjective and biased',
      'objective and analytical',
      'cynical and dismissive',
      'hyperbolic and dramatic'
    ],
    correctAnswerIndex: 1,
    solution: "An essay relying on verifiable empirical data and facts exhibits an objective and analytical tone.",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },

  // --- MATHEMATICS QUESTIONS ---
  {
    id: 'mth_001',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topicId: 'top_mth_1',
    topicName: 'Algebra & Polynomials',
    questionText: 'If 3^(2x - 1) = 81, find the value of x.',
    options: [
      '2',
      '2.5',
      '3',
      '4'
    ],
    correctAnswerIndex: 1,
    solution: "81 can be rewritten as 3^4. Therefore, 3^(2x - 1) = 3^4 => 2x - 1 = 4 => 2x = 5 => x = 2.5.",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'mth_002',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topicId: 'top_mth_2',
    topicName: 'Calculus (Differentiation & Integration)',
    questionText: 'Differentiate y = (3x^2 - 5)^4 with respect to x.',
    options: [
      '12x(3x^2 - 5)^3',
      '24x(3x^2 - 5)^3',
      '4(3x^2 - 5)^3',
      '6x(3x^2 - 5)^4'
    ],
    correctAnswerIndex: 1,
    solution: "Using the chain rule: dy/dx = 4(3x^2 - 5)^3 * d/dx(3x^2 - 5) = 4(3x^2 - 5)^3 * 6x = 24x(3x^2 - 5)^3.",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'mth_003',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topicId: 'top_mth_3',
    topicName: 'Trigonometry & Geometry',
    questionText: 'Evaluate the determinant of the 2x2 matrix: [[4, -2], [3, 5]].',
    options: [
      '14',
      '26',
      '20',
      '-6'
    ],
    correctAnswerIndex: 1,
    solution: "Determinant = (4 * 5) - (-2 * 3) = 20 - (-6) = 20 + 6 = 26.",
    difficulty: 'easy',
    year: 2026,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'mth_004',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topicId: 'top_mth_4',
    topicName: 'Statistics & Probability',
    questionText: 'A bag contains 5 red balls and 4 blue balls. If two balls are drawn at random without replacement, find the probability that both are red.',
    options: [
      '5/18',
      '5/9',
      '25/81',
      '10/36'
    ],
    correctAnswerIndex: 0,
    solution: "P(1st red) = 5/9. P(2nd red | 1st red) = 4/8 = 1/2. P(both red) = (5/9) * (1/2) = 5/18.",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'mth_005',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topicId: 'top_mth_2',
    topicName: 'Calculus (Differentiation & Integration)',
    questionText: 'Evaluate the definite integral ∫ (from 0 to 2) (3x^2 + 2x) dx.',
    options: [
      '10',
      '12',
      '14',
      '16'
    ],
    correctAnswerIndex: 1,
    solution: "Integral of (3x^2 + 2x) dx = x^3 + x^2. Evaluating from 0 to 2: [2^3 + 2^2] - [0] = 8 + 4 = 12.",
    difficulty: 'medium',
    year: 2026,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'mth_006',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topicId: 'top_mth_1',
    topicName: 'Algebra & Polynomials',
    questionText: 'Find the positive root of the quadratic equation 2x^2 - 5x - 3 = 0 using the quadratic formula x = (-b ± √(b^2 - 4ac)) / (2a).',
    options: [
      '3',
      '1/2',
      '-1/2',
      '√3'
    ],
    correctAnswerIndex: 0,
    solution: "Using the quadratic formula: x = (5 ± √(25 - 4(2)(-3))) / 4 = (5 ± √49) / 4 = (5 ± 7) / 4. For the positive root: x = (5 + 7) / 4 = 12 / 4 = 3.",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'mth_007',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topicId: 'top_mth_3',
    topicName: 'Trigonometry & Geometry',
    questionText: 'Simplify the trigonometric identity: sin^2 θ + cos^2 θ + tan^2 θ.',
    options: [
      'sec^2 θ',
      'cosec^2 θ',
      '1 + cot^2 θ',
      '2'
    ],
    correctAnswerIndex: 0,
    solution: "Since sin^2 θ + cos^2 θ = 1, the expression becomes 1 + tan^2 θ = sec^2 θ.",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },

  // --- PHYSICS QUESTIONS ---
  {
    id: 'phy_001',
    subjectId: 'physics',
    subjectName: 'Physics',
    topicId: 'top_phy_1',
    topicName: 'Mechanics & Motion',
    questionText: 'A car moving with a velocity of 20 m/s accelerates uniformly at 2 m/s^2 for 5 seconds. What is the total distance covered during this time?',
    options: [
      '100 m',
      '125 m',
      '150 m',
      '175 m'
    ],
    correctAnswerIndex: 1,
    solution: "Using equation of motion s = ut + 0.5*a*t^2: s = (20 * 5) + 0.5 * 2 * (5^2) = 100 + 25 = 125 m.",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'phy_002',
    subjectId: 'physics',
    subjectName: 'Physics',
    topicId: 'top_phy_2',
    topicName: 'Electricity & Magnetism',
    questionText: 'Two resistors of resistance 4 Ω and 6 Ω are connected in parallel across a 12 V battery of negligible internal resistance. Calculate the total current in the circuit.',
    options: [
      '1.2 A',
      '2.4 A',
      '5.0 A',
      '6.0 A'
    ],
    correctAnswerIndex: 2,
    solution: "Equivalent resistance R_eq = (4 * 6) / (4 + 6) = 24 / 10 = 2.4 Ω. Total current I = V / R_eq = 12 / 2.4 = 5.0 A.",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'phy_003',
    subjectId: 'physics',
    subjectName: 'Physics',
    topicId: 'top_phy_3',
    topicName: 'Waves, Light & Optics',
    questionText: 'Which phenomenon confirms the transverse nature of electromagnetic light waves?',
    options: [
      'Diffraction',
      'Interference',
      'Polarization',
      'Refraction'
    ],
    correctAnswerIndex: 2,
    solution: "Polarization can only occur in transverse waves where vibrations are perpendicular to wave propagation; longitudinal waves cannot be polarized.",
    difficulty: 'easy',
    year: 2026,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'phy_004',
    subjectId: 'physics',
    subjectName: 'Physics',
    topicId: 'top_phy_5',
    topicName: 'Atomic & Nuclear Physics',
    questionText: 'The half-life of a radioactive sample is 10 days. If the initial mass is 64 grams, what mass remains undecayed after 30 days?',
    options: [
      '4 grams',
      '8 grams',
      '16 grams',
      '32 grams'
    ],
    correctAnswerIndex: 1,
    solution: "Number of half-lives n = 30 / 10 = 3. Remaining mass = 64 / (2^3) = 64 / 8 = 8 grams.",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },

  // --- CHEMISTRY QUESTIONS ---
  {
    id: 'chm_001',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topicId: 'top_chm_1',
    topicName: 'Periodic Table & Atomic Structure',
    questionText: 'The electronic configuration of an element X is 1s^2 2s^2 2p^6 3s^2 3p^4. Element X belongs to which group and period?',
    options: [
      'Group 4, Period 3',
      'Group 6, Period 3',
      'Group 3, Period 4',
      'Group 2, Period 3'
    ],
    correctAnswerIndex: 1,
    solution: "Highest principal quantum number is n=3 (Period 3). Total valence electrons in shell 3 is 2 + 4 = 6 (Group 6 or Group 16).",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'chm_002',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topicId: 'top_chm_3',
    topicName: 'Acids, Bases and Salts',
    questionText: 'Calculate the pH of a 0.001 mol/dm^3 solution of tetraoxosulphate(VI) acid (H2SO4), assuming complete dissociation.',
    options: [
      '2.7',
      '3.0',
      '2.0',
      '1.7'
    ],
    correctAnswerIndex: 0,
    solution: "H2SO4 -> 2H+ + SO4^2-. [H+] = 2 * 0.001 = 0.002 mol/dm^3 = 2 x 10^-3 M. pH = -log(2 x 10^-3) = 3 - log10(2) = 3 - 0.301 = 2.699 ≈ 2.7.",
    difficulty: 'hard',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'chm_003',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topicId: 'top_chm_4',
    topicName: 'Organic Chemistry & Hydrocarbons',
    questionText: 'The IUPAC name for CH3-CH(CH3)-CH2-CH2-OH is:',
    options: [
      '2-methylbutan-4-ol',
      '3-methylbutan-1-ol',
      'pentan-1-ol',
      '2-ethylpropan-1-ol'
    ],
    correctAnswerIndex: 1,
    solution: "The principal functional group -OH receives the lowest locant (carbon 1). The 4-carbon chain is butane, with a methyl substituent at carbon 3: 3-methylbutan-1-ol.",
    difficulty: 'medium',
    year: 2026,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'chm_004',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topicId: 'top_chm_5',
    topicName: 'Electrochemistry & Redox Reactions',
    questionText: 'During the electrolysis of acidified water using platinum electrodes, the gas evolved at the anode is:',
    options: [
      'Hydrogen',
      'Oxygen',
      'Chlorine',
      'Nitrogen'
    ],
    correctAnswerIndex: 1,
    solution: "At the anode (positive electrode), oxidation of OH- ions occurs: 4OH- -> O2 + 2H2O + 4e-. Hence oxygen gas is discharged.",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },

  // --- BIOLOGY QUESTIONS ---
  {
    id: 'bio_001',
    subjectId: 'biology',
    subjectName: 'Biology',
    topicId: 'top_bio_1',
    topicName: 'Cell Biology & Organization of Life',
    questionText: 'Which organelle is responsible for cellular respiration and adenosine triphosphate (ATP) synthesis?',
    options: [
      'Ribosome',
      'Endoplasmic reticulum',
      'Mitochondria',
      'Golgi apparatus'
    ],
    correctAnswerIndex: 2,
    solution: "The mitochondrion is known as the powerhouse of the cell, carrying out the Krebs cycle and oxidative phosphorylation to produce ATP.",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'bio_002',
    subjectId: 'biology',
    subjectName: 'Biology',
    topicId: 'top_bio_2',
    topicName: 'Genetics & Evolution',
    questionText: 'A cross between a homozygous dominant red flower (RR) and a homozygous recessive white flower (rr) yields:',
    options: [
      '100% heterozygous red flowers',
      '50% red and 50% white flowers',
      '75% red and 25% white flowers',
      '100% white flowers'
    ],
    correctAnswerIndex: 0,
    solution: "All F1 generation offspring receive allele R from the red parent and r from the white parent (Rr), displaying the dominant red phenotype.",
    difficulty: 'easy',
    year: 2026,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'bio_003',
    subjectId: 'biology',
    subjectName: 'Biology',
    topicId: 'top_bio_3',
    topicName: 'Ecology & Ecosystems',
    questionText: 'The association between nitrogen-fixing bacteria in the root nodules of leguminous plants is an example of:',
    options: [
      'Parasitism',
      'Mutualism',
      'Commensalism',
      'Amensalism'
    ],
    correctAnswerIndex: 1,
    solution: "Mutualism is a symbiotic relationship where both organisms benefit: bacteria receive carbohydrates while the plant receives fixed nitrates.",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },

  // --- THE LIFE CHANGER QUESTIONS ---
  {
    id: 'tlc_001',
    subjectId: 'life_changer',
    subjectName: 'The Life Changer',
    topicId: 'top_tlc_1',
    topicName: 'Campus Life & Salma\'s Experience',
    passage: "Based on 'The Life Changer' by Khadija Abubakar Jalli.",
    questionText: "What was Salma's initial attitude towards the university dress code and regulations?",
    options: [
      'Humble compliance',
      'Nonchalant and defiant',
      'Excited and supportive',
      'Completely oblivious'
    ],
    correctAnswerIndex: 1,
    solution: "Upon arrival on campus, Salma displayed a haughty, confident and defiant demeanor towards registration protocols and university decorum.",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },
  {
    id: 'tlc_002',
    subjectId: 'life_changer',
    subjectName: 'The Life Changer',
    topicId: 'top_tlc_2',
    topicName: 'Characters & Themes',
    passage: "Based on 'The Life Changer'.",
    questionText: "Who is the primary narrator telling the story to her daughters in the family compound?",
    options: [
      'Bint',
      'Salma',
      'Ummi',
      'Teemah'
    ],
    correctAnswerIndex: 2,
    solution: "Ummi is the mother who narrates the moral lessons, anecdotes and Salma's university adventures to her children Omar, Teemah, Jamila and Bint.",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },

  // --- ECONOMICS QUESTIONS ---
  {
    id: 'eco_001',
    subjectId: 'economics',
    subjectName: 'Economics',
    topicId: 'top_eco_1',
    topicName: 'Theory of Demand and Supply',
    questionText: 'A shift in the demand curve to the right indicates:',
    options: [
      'A decrease in price of the commodity',
      'An increase in demand at each existing price',
      'A decrease in quantity supplied',
      'A movement along the demand curve'
    ],
    correctAnswerIndex: 1,
    solution: "A shift of the demand curve to the right is an increase in overall demand caused by non-price factors (e.g. increase in consumer income, taste, population).",
    difficulty: 'easy',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  },

  // --- GOVERNMENT QUESTIONS ---
  {
    id: 'gov_001',
    subjectId: 'government',
    subjectName: 'Government',
    topicId: 'top_gov_1',
    topicName: 'Constitutional Development in Nigeria',
    questionText: 'The constitution that introduced the federal structure of three regions in Nigeria was the:',
    options: [
      'Clifford Constitution of 1922',
      'Richards Constitution of 1946',
      'Macpherson Constitution of 1951',
      'Lyttelton Constitution of 1954'
    ],
    correctAnswerIndex: 3,
    solution: "The Lyttelton Constitution of 1954 formally established the federal system of government in Nigeria, dividing powers between the central and regional governments.",
    difficulty: 'medium',
    year: 2027,
    examType: 'JAMB UTME',
    active: true,
  }
];

export const JAMB_INSTRUCTIONS_TEXT = `
JAMB UTME EXAMINATION GENERAL INSTRUCTIONS (2027 CBT EDITION)

1. CANDIDATE AUTHENTICATION:
Ensure that your registered examination number and verified username are accurately reflected on the header workstation before beginning.

2. SUBJECT CONFIGURATION:
UTME candidates are examined on Use of English (compulsory) and three relevant subjects chosen according to their chosen tertiary course of study.

3. WORKSTATION NAVIGATION:
• Use the [Previous] and [Next] buttons or the numbered keypad below to navigate through test items.
• Active question is highlighted in BLUE on the keypad.
• Answered items are marked in GREEN.
• Click the [Bookmark] button in the upper toolbar to flag complex questions for later review (marked in YELLOW).

4. TIME MANAGEMENT:
• Your remaining time counts down dynamically in the upper right indicator.
• If time elapses, the examination workstation will automatically record and submit your completed responses.
• You can review or alter selected options at any time before clicking the red [SUBMIT] button.

5. AUXILIARY CBT TOOLS:
• CALCULATOR: Click the Calculator button in the top menu bar to open the standard four-function CBT calculator.
• DICTIONARY: Click the Dictionary icon to verify English vocabulary definitions without leaving your test screen.
• AUDIO READOUT: Click the speaker icon beside any question number to listen to the question read aloud.
• REPORT ERROR: If you detect any typographical or question ambiguity, click 'Report Error' to lodge an instant feedback ticket.

6. FINAL SUBMISSION:
Click the red [SUBMIT] button once you have reviewed all subjects. An audit confirmation dialogue will appear displaying your total answered vs unattended questions.
`;

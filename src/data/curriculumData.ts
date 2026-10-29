import type { SubjectCurriculum } from '../types';

export const SUBJECT_CURRICULA: Record<string, SubjectCurriculum> = {
  english: {
    subjectId: 'english',
    subjectName: 'Use of English',
    code: 'ENG',
    description: 'Compulsory for all JAMB UTME candidates. Evaluates comprehension, vocabulary, summary skills, grammatical structures, and the official prescribed literary novel.',
    objectives: [
      'Communicate effectively in written and spoken English in academic and professional contexts.',
      'Critically analyze passages of varying complexity and extract core thesis and supporting claims.',
      'Demonstrate sound mastery of English grammar, concord, tenses, active/passive voice, and prepositions.',
      'Master the themes, characterization, plot, and socio-cultural relevance of the prescribed literature novel.'
    ],
    topicsOverview: [
      {
        title: 'Section A: Comprehension and Summary',
        description: 'Expository, narrative, and argumentative passages followed by analytical multiple-choice questions.',
        subtopics: [
          'Direct factual recall and explicit deduction',
          'Inference, contextual meaning of words and phrases',
          'Tone, mood, stylistic registers, and figurative devices',
          'Sentence summary and main idea extraction'
        ]
      },
      {
        title: 'Section B: Lexis and Structure',
        description: 'Testing candidates mastery of English syntax, idioms, collocations, and grammatical concord.',
        subtopics: [
          'Synonyms (words nearest in meaning)',
          'Antonyms (words opposite in meaning)',
          'Sentence completion with appropriate prepositions and phrasal verbs',
          'Subject-verb agreement (rules of grammatical concord)',
          'Idiomatic expressions and figurative language'
        ]
      },
      {
        title: 'Section C: Oral Forms and Phonology',
        description: 'Testing sound identification, syllable stress, and intonation in standard English.',
        subtopics: [
          'Vowel sounds (monophthongs and diphthongs)',
          'Consonant clusters and silent letters',
          'Primary syllable stress patterns in polysyllabic words',
          'Emphatic stress and contrastive focus'
        ]
      },
      {
        title: 'Section D: Prescribed Literary Text',
        description: 'In-depth textual examination of the compulsory UTME reading text.',
        subtopics: [
          'Chapter-by-chapter plot development',
          'Major and minor character profiling',
          'Key themes: integrity, academic pursuit, social pressures',
          'Contextual quotes and attribution'
        ]
      }
    ],
    recommendedTexts: [
      'The Compulsory Novel prescribed by JAMB for the current examination year',
      'Attah, M. O. (2013) Practice in Spoken English for Intermediate and Advanced Learners',
      'Banjo, A. et al. (2004) New Oxford Secondary English Course (Book 6)',
      'Idowu, O. O. et al. (2003) Round-up English: A Complete Guide'
    ],
    examFormat: {
      questionCount: 60,
      timeAllocationMinutes: 45,
      markPerQuestion: 1,
      keySections: ['Comprehension & Summary (15)', 'Prescribed Text (10)', 'Lexis & Structure (25)', 'Oral English (10)']
    }
  },

  mathematics: {
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    code: 'MTH',
    description: 'Evaluates logical reasoning, algebraic manipulation, geometric proof, trigonometric identities, and differential/integral calculus.',
    objectives: [
      'Apply mathematical principles to solve abstract and real-world quantitative problems.',
      'Manipulate algebraic formulas, matrices, sequences, and polynomial equations with high speed.',
      'Solve geometric, trigonometric, and spatial problems with coordinate systems.',
      'Perform differentiation and integration to analyze rates of change, maxima, minima, and enclosed areas.'
    ],
    topicsOverview: [
      {
        title: '1. Number and Numeration',
        description: 'Number bases, modular arithmetic, indices, logarithms, surds, and sets.',
        subtopics: ['Operations in bases 2 through 10', 'Laws of logarithms and base change formula', 'Simplification and rationalization of surds', 'Set operations, Venn diagrams, and cardinality']
      },
      {
        title: '2. Algebra',
        description: 'Simultaneous and quadratic equations, inequalities, AP/GP, and polynomials.',
        subtopics: ['Roots of quadratic equations and symmetric functions', 'Linear programming and inequalities on Cartesian planes', 'Arithmetic and Geometric Progressions (nth term and sum to infinity)', 'Remainder and factor theorems for cubic polynomials']
      },
      {
        title: '3. Geometry and Trigonometry',
        description: 'Euclidean circle theorems, vectors in 2D, coordinates, and trigonometric ratios.',
        subtopics: ['Circle geometry: angle at centre, alternate segment theorem, cyclic quadrilaterals', 'Equation of straight lines: gradient, perpendicularity, parallelism', 'Sine and cosine rules for acute and obtuse triangles', 'Trigonometric identities: sin²θ + cos²θ = 1 and double-angle formulas']
      },
      {
        title: '4. Calculus',
        description: 'Differentiation from first principles, standard derivatives, and integration applications.',
        subtopics: ['Derivatives of polynomials, trigonometric and exponential functions', 'Product rule, quotient rule, and chain rule', 'Stationary points, points of inflection, and curve sketching', 'Definite and indefinite integrals, areas under curves']
      },
      {
        title: '5. Statistics and Probability',
        description: 'Measures of central tendency, dispersion, permutations, combinations, and probability.',
        subtopics: ['Mean, median, mode for grouped and ungrouped data', 'Variance, standard deviation, and mean deviation', 'Permutations nPr and combinations nCr', 'Mutually exclusive and independent event probabilities']
      }
    ],
    recommendedTexts: [
      'Channon, J. B. et al. (2001) New General Mathematics for West Africa (Books 1 - 3)',
      'Godman, A. & Talbert, J. F. (2008) Additional Mathematics for West Africa',
      'Egbe, E. et al. (2000) Further Mathematics for Senior Secondary Schools'
    ],
    examFormat: {
      questionCount: 40,
      timeAllocationMinutes: 40,
      markPerQuestion: 1,
      keySections: ['Number & Numeration (10)', 'Algebra (12)', 'Geometry & Trig (8)', 'Calculus (6)', 'Statistics & Prob (4)']
    }
  },

  physics: {
    subjectId: 'physics',
    subjectName: 'Physics',
    code: 'PHY',
    description: 'Covers physical quantities, classical Newtonian mechanics, thermal physics, wave mechanics, electrostatics, electromagnetism, and atomic physics.',
    objectives: [
      'Understand the fundamental laws governing matter, energy, and radiation in the universe.',
      'Formulate and solve quantitative physics problems using standard SI units and dimensional formulas.',
      'Explain everyday optical, electrical, and thermal phenomena using precise scientific principles.',
      'Apply safety and modern principles regarding radioactivity, semiconductor electronics, and photon emissions.'
    ],
    topicsOverview: [
      {
        title: '1. Mechanics and Motion',
        description: 'Vectors, linear and projectile motion, Newtons laws, work, energy, and circular motion.',
        subtopics: ['Kinematic equations of uniformly accelerated motion', 'Conservation of linear momentum and impulse', 'Simple harmonic motion: pendulum and loaded spiral springs', 'Centripetal force, angular velocity, and banking of road turns']
      },
      {
        title: '2. Thermal Physics',
        description: 'Temperature measurement, thermometry, heat transfer, gas laws, and thermodynamics.',
        subtopics: ['Specific heat capacity and latent heat of fusion/vaporization', 'Boyles law, Charles law, and ideal gas equation PV = nRT', 'Linear, superficial, and cubical expansivity of solids and liquids']
      },
      {
        title: '3. Waves and Optics',
        description: 'Wave propagation, resonance, sound, reflection, refraction, and optical instruments.',
        subtopics: ['Transverse and longitudinal waves; stationary waves', 'Reflection at plane and curved spherical mirrors', 'Refraction through prisms, Snells law, and total internal reflection', 'Compound microscopes, astronomical telescopes, and human eye defects']
      },
      {
        title: '4. Electricity and Magnetism',
        description: 'Electric fields, Ohms law, alternating current circuits, and magnetic induction.',
        subtopics: ['Coulombs law, electric potential, and capacitance in series/parallel', 'Kirchhoffs current and voltage laws in resistor networks', 'Faradays laws of electromagnetic induction and Lenzs law', 'Resonance in series RLC alternating current circuits']
      },
      {
        title: '5. Modern Physics',
        description: 'Photoelectric effect, X-rays, radioactivity, nuclear fission, and semiconductors.',
        subtopics: ['Einsteins photoelectric equation hf = W + KE_max', 'Alpha, beta, and gamma radiation; half-life decay equations', 'p-n junction diodes, rectification, and solar cell physics']
      }
    ],
    recommendedTexts: [
      'Nelkon, M. & Parker, P. (1995) Advanced Level Physics (7th Edition)',
      'Anyakoha, M. W. (2010) New School Physics for Senior Secondary Schools',
      'Okeke, P. N. & Anyakoha, M. W. (2000) Senior Secondary School Physics'
    ],
    examFormat: {
      questionCount: 40,
      timeAllocationMinutes: 40,
      markPerQuestion: 1,
      keySections: ['Mechanics (14)', 'Thermal Physics (6)', 'Waves & Optics (8)', 'Electricity & Magnetism (8)', 'Modern Physics (4)']
    }
  },

  chemistry: {
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    code: 'CHM',
    description: 'Examines the composition, properties, and transformations of matter across Physical, Inorganic, and Organic Chemistry.',
    objectives: [
      'Explain chemical reactions in terms of atomic structure, electron configuration, and chemical bonding.',
      'Perform stoichiometric calculations involving mole concepts, molar masses, and gas volumes at STP.',
      'Predict equilibrium shifts using Le Chateliers principle and calculate pH and rate constants.',
      'Identify organic homologous series, IUPAC nomenclature, isomerism, and industrial synthesis routes.'
    ],
    topicsOverview: [
      {
        title: '1. Atomic Structure and Bonding',
        description: 'Subatomic particles, quantum numbers, periodic table trends, and chemical bonding.',
        subtopics: ['Electronic configuration (Aufbau, Hunds rule, Pauli exclusion)', 'Electronegativity, ionization energy, and atomic radius trends across periods', 'Ionic, covalent, coordinate, and hydrogen bonding mechanisms']
      },
      {
        title: '2. Physical Chemistry & Stoichiometry',
        description: 'The mole concept, empirical formulas, gas laws, chemical kinetics, and energetics.',
        subtopics: ['Molarity, percentage purity, and volumetric titration calculations', 'Endothermic vs exothermic enthalpy changes (ΔH)', 'Factors affecting reaction rates: temperature, catalysts, concentration, surface area', 'Equilibrium constants (Kc) and Le Chateliers principle']
      },
      {
        title: '3. Inorganic Chemistry',
        description: 'Chemistry of non-metals (oxygen, halogens, nitrogen, sulfur) and representative metals.',
        subtopics: ['Extraction of iron, aluminum, and copper', 'Allotropes of carbon, sulfur, and phosphorus', 'Industrial preparation of ammonia (Haber process) and sulfuric acid (Contact process)', 'Acids, bases, salts, buffer solutions, and solubility product (Ksp)']
      },
      {
        title: '4. Organic Chemistry',
        description: 'Hydrocarbons, functional groups, reaction mechanisms, and polymers.',
        subtopics: ['Alkanes, alkenes, alkynes: cracking, halogenation, polymerization', 'Alkanols, alkanoic acids, esters (saponification reaction)', 'Benzene structure, resonance stability, and electrophilic substitution', 'Natural and synthetic polymers: starch, proteins, nylon, and polythene']
      }
    ],
    recommendedTexts: [
      'Ababio, O. Y. (2005) New School Chemistry for Senior Secondary Schools',
      'Bajah, S. T. et al. (1998) Senior Secondary Chemistry (Books 1 - 3)',
      'Ojokuku, G. O. (2012) Understanding Chemistry for Schools and Colleges'
    ],
    examFormat: {
      questionCount: 40,
      timeAllocationMinutes: 40,
      markPerQuestion: 1,
      keySections: ['Atomic Structure & Bonding (8)', 'Physical Chemistry & Stoichiometry (12)', 'Inorganic Elements (10)', 'Organic Chemistry (10)']
    }
  },

  biology: {
    subjectId: 'biology',
    subjectName: 'Biology',
    code: 'BIO',
    description: 'Explores the scientific study of living organisms, their evolutionary development, physiological systems, genetic inheritance, and environmental interactions.',
    objectives: [
      'Recognize structural adaptations that enable plants and animals to survive in diverse habitats.',
      'Understand biological systems including circulation, respiration, nervous coordination, and reproduction.',
      'Explain Mendelian genetics, monohybrid/dihybrid crosses, sex linkage, and gene mutations.',
      'Analyze ecological pyramids, food webs, nutrient recycling (carbon and nitrogen cycles), and conservation.'
    ],
    topicsOverview: [
      {
        title: '1. Cell Biology and Organization of Life',
        description: 'Cell structure, organelle functions, mitosis, meiosis, and levels of biological organization.',
        subtopics: ['Plant vs animal cell differences under electron microscopy', 'Diffusion, osmosis, active transport, and plasmolysis', 'Mitotic cell division vs meiotic reduction division in gametogenesis']
      },
      {
        title: '2. Plant Physiology and Anatomy',
        description: 'Photosynthesis, transport systems (xylem and phloem), transpiration, and plant hormones.',
        subtopics: ['Light-dependent and light-independent stages of photosynthesis', 'Cohesion-tension theory and transpiration pull in tall trees', 'Auxins, gibberellins, and abscisic acid control of plant tropisms']
      },
      {
        title: '3. Animal Physiology',
        description: 'Digestive, circulatory, respiratory, excretory, and endocrine systems in humans and mammals.',
        subtopics: ['Enzymatic digestion of carbohydrates, proteins, and lipids', 'Double circulation of blood: pulmonary and systemic circuits', 'Kidney nephron ultrafiltration, selective reabsorption, and osmoregulation', 'Hormonal control: insulin, glucagon, adrenaline, and thyroxine']
      },
      {
        title: '4. Genetics, Evolution and Ecology',
        description: 'Mendels laws of inheritance, DNA structure, natural selection, and ecological balance.',
        subtopics: ['Monohybrid cross phenotypic ratio (3:1) and genotypic ratio (1:2:1)', 'Sex-linked traits: haemophilia, red-green colour blindness', 'Darwins theory of natural selection vs Lamarckian theory', 'Ecological succession: hydrosere and xerosere stages']
      }
    ],
    recommendedTexts: [
      'Idodo-Umeh, G. (1996) College Biology',
      'Ramalingam, S. T. (2011) Modern Biology for Senior Secondary Schools',
      'Stone, R. H. & Cozens, A. B. C. (1982) New Biology for West African Schools'
    ],
    examFormat: {
      questionCount: 40,
      timeAllocationMinutes: 40,
      markPerQuestion: 1,
      keySections: ['Cell Biology (8)', 'Plant Systems (8)', 'Animal Physiology (12)', 'Genetics & Ecology (12)']
    }
  },

  economics: {
    subjectId: 'economics',
    subjectName: 'Economics',
    code: 'ECO',
    description: 'Covers price determination, consumer behavior, market structures, national income accounting, banking, inflation, and international trade in emerging markets.',
    objectives: [
      'Apply economic concepts of scarcity, choice, opportunity cost, and production possibility curves.',
      'Calculate price elasticity of demand and supply and interpret market equilibrium shifts.',
      'Compute Gross Domestic Product (GDP), Gross National Product (GNP), and real vs nominal national income.',
      'Explain monetary and fiscal policy tools used by central banks and ministries of finance to control inflation.'
    ],
    topicsOverview: [
      {
        title: '1. Basic Economic Concepts & Microeconomics',
        description: 'Scarcity, scale of preference, opportunity cost, and consumer utility theory.',
        subtopics: ['Law of diminishing marginal utility and consumer equilibrium', 'Demand and supply functions and equilibrium price calculation', 'Price, income, and cross elasticity of demand formulas', 'Market structures: perfect competition, monopoly, oligopoly, and monopolistic competition']
      },
      {
        title: '2. Production and Cost Theories',
        description: 'Factors of production, division of labour, economies of scale, and cost curves.',
        subtopics: ['Law of diminishing returns (law of variable proportions)', 'Short-run and long-run average cost curves (economies of scale)', 'Fixed, variable, marginal, and total cost calculations']
      },
      {
        title: '3. Macroeconomics and National Income',
        description: 'Measuring national output, consumption function, and circular flow of income.',
        subtopics: ['Income, output, and expenditure methods of national income accounting', 'Marginal propensity to consume (MPC) and the investment multiplier', 'Demand-pull inflation vs cost-push inflation mechanisms']
      },
      {
        title: '4. Money, Banking and International Trade',
        description: 'Financial institutions, central bank tools, balance of payments, and exchange rates.',
        subtopics: ['Commercial bank credit creation process and reserve ratios', 'Open market operations, cash reserve requirement, and monetary policy rate (MPR)', 'Comparative cost advantage theory in international trade', 'Balance of payments deficits and corrective fiscal policies']
      }
    ],
    recommendedTexts: [
      'Aderinto, A. A. et al. (1996) Economics for Senior Secondary Schools',
      'Anyanwuocha, R. A. I. (2001) Fundamentals of Economics for Senior Secondary Schools',
      'Lipsey, R. G. & Chrystal, K. A. (2007) Economics (11th Edition)'
    ],
    examFormat: {
      questionCount: 40,
      timeAllocationMinutes: 40,
      markPerQuestion: 1,
      keySections: ['Basic Concepts & Micro (14)', 'Production & Costs (8)', 'Macro & National Income (10)', 'Money, Banking & Trade (8)']
    }
  },

  accounts: {
    subjectId: 'accounts',
    subjectName: 'Principles of Accounts',
    code: 'ACC',
    description: 'Focuses on financial record keeping, dual-entry principles, ledger balancing, financial statements, and partnership/company accounts.',
    objectives: [
      'Apply the fundamental accounting equation: Assets = Capital + Liabilities in all transactions.',
      'Record transactions in subsidiary books, ledgers, and extract accurate trial balances.',
      'Prepare statement of profit or loss and statement of financial position for sole proprietorships.',
      'Account for depreciation, bad debts, accruals, prepayments, and bank reconciliation differences.'
    ],
    topicsOverview: [
      {
        title: '1. Fundamentals and Double Entry Bookkeeping',
        description: 'Classification of accounts, rules of debit and credit, source documents, and journals.',
        subtopics: ['Assets = Liabilities + Owners Equity relationships', 'Cash book: single, double, and three-column cash books with discounts', 'Petty cash book with the imprest system', 'Extraction and balancing of the Trial Balance']
      },
      {
        title: '2. Period-End Adjustments and Final Accounts',
        description: 'Depreciation methods, provision for doubtful debts, accruals, and prepayments.',
        subtopics: ['Straight-line method vs reducing balance method for depreciation', 'Statement of Profit or Loss (Trading, Profit and Loss Account)', 'Statement of Financial Position (Balance Sheet)', 'Correction of errors that do and do not affect the trial balance']
      },
      {
        title: '3. Bank Reconciliation and Incomplete Records',
        description: 'Identifying discrepancies between cash book and bank statements; single entry accounting.',
        subtopics: ['Uncredited cheques, unpresented cheques, and bank direct debits/credits', 'Adjusted cash book preparation and bank reconciliation statement', 'Statement of Affairs method to determine profit from incomplete records']
      },
      {
        title: '4. Partnership and Company Accounts',
        description: 'Partnership agreements, profit sharing, goodwill, and corporate share capital.',
        subtopics: ['Partnership profit and loss appropriation account and current accounts', 'Admission and retirement of partners with goodwill adjustment', 'Ordinary shares, preference shares, debentures, and company reserves']
      }
    ],
    recommendedTexts: [
      'Frank Wood & Alan Sangster (2008) Business Accounting 1 & 2',
      'Femi Longe (2012) Simplified and Amplified Book-Keeping and Accounting',
      'Igben, R. O. (2004) Financial Accounting Made Simple'
    ],
    examFormat: {
      questionCount: 40,
      timeAllocationMinutes: 40,
      markPerQuestion: 1,
      keySections: ['Double Entry & Books of Prime Entry (12)', 'Final Accounts & Adjustments (14)', 'Bank Reconciliation & Control (6)', 'Partnership & Companies (8)']
    }
  }
};

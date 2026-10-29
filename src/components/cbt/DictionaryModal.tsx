import React, { useState } from 'react';
import { X, Search, BookOpen, Volume2, Loader2 } from 'lucide-react';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DefinitionResult {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

const COMMON_JAMB_TERMS: Record<string, { partOfSpeech: string; definition: string; example: string }> = {
  humanitarian: {
    partOfSpeech: 'adjective',
    definition: 'Concerned with or seeking to promote human welfare and reduce suffering.',
    example: 'Groups organized humanitarian aid for displaced refugees.',
  },
  hypocritic: {
    partOfSpeech: 'adjective',
    definition: 'Characterized by behavior that contradicts what one claims to believe or feel.',
    example: 'His hypocritic attitude turned his close friends away.',
  },
  opportunistic: {
    partOfSpeech: 'adjective',
    definition: 'Exploiting opportunities with little regard to moral principles or consequences.',
    example: 'He took an opportunistic approach to political advancement.',
  },
  conciliatory: {
    partOfSpeech: 'adjective',
    definition: 'Intended or likely to placate, pacify, or bring about agreement.',
    example: 'The leader struck a conciliatory tone during the debate.',
  },
  mendacious: {
    partOfSpeech: 'adjective',
    definition: 'Not telling the truth; habitually lying or characterized by deceit.',
    example: 'The testimony was rejected as mendacious propaganda.',
  },
  polarization: {
    partOfSpeech: 'noun',
    definition: 'The property in transverse waves where vibrations are confined to one plane.',
    example: 'Polarization filters reduce glare from reflected light.',
  },
  stoichiometry: {
    partOfSpeech: 'noun',
    definition: 'Calculation of relative quantities of reactants and products in chemical reactions.',
    example: 'Stoichiometry allows chemists to determine theoretical yields.',
  },
  dissociation: {
    partOfSpeech: 'noun',
    definition: 'The separation of ions or smaller molecules when an ionic compound dissolves.',
    example: 'Complete dissociation of sulfuric acid releases hydronium ions.',
  }
};

export const DictionaryModal: React.FC<DictionaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DefinitionResult | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (!query) return;

    setError(null);
    setLoading(true);

    // Check fast local dictionary first
    if (COMMON_JAMB_TERMS[query]) {
      const local = COMMON_JAMB_TERMS[query];
      setResult({
        word: query,
        meanings: [
          {
            partOfSpeech: local.partOfSpeech,
            definitions: [
              {
                definition: local.definition,
                example: local.example,
              },
            ],
          },
        ],
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error('Definition not found. Check spelling or try a root word.');
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setResult(data[0]);
      } else {
        throw new Error('Definition not found.');
      }
    } catch (err: any) {
      setError(err?.message || 'Word definition could not be retrieved.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-400 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#1e5622] text-white px-4 py-2.5 flex items-center justify-between font-semibold text-sm">
          <div className="flex items-center gap-2">
            <BookOpen size={16} />
            <span>JAMB CBT ENGLISH DICTIONARY</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-600 rounded text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="p-3 bg-gray-50 border-b border-gray-200 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter word (e.g. opportunistic, mendacious)..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              autoFocus
            />
            <Search size={16} className="absolute left-2.5 top-3 text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#2e7d32] hover:bg-[#1e5622] text-white rounded text-sm font-semibold transition-colors flex items-center gap-1"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
              {error}
            </div>
          )}

          {!result && !error && !loading && (
            <div className="text-center py-6 text-gray-500 text-xs">
              <BookOpen size={36} className="mx-auto text-gray-300 mb-2" />
              <p>Type a word and press Search to look up its definition.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {['opportunistic', 'conciliatory', 'mendacious', 'polarization'].map((word) => (
                  <button
                    key={word}
                    onClick={() => {
                      setSearchTerm(word);
                      setTimeout(() => {
                        // fast local trigger
                        const local = COMMON_JAMB_TERMS[word];
                        if (local) {
                          setResult({
                            word,
                            meanings: [{ partOfSpeech: local.partOfSpeech, definitions: [{ definition: local.definition, example: local.example }] }]
                          });
                        }
                      }, 50);
                    }}
                    className="text-[11px] bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded hover:bg-green-100"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="text-xl font-bold capitalize text-gray-900">{result.word}</h3>
                  {result.phonetic && <span className="text-xs text-gray-500">{result.phonetic}</span>}
                </div>
                <button
                  onClick={() => handleSpeak(result.word)}
                  className="p-2 text-green-700 hover:bg-green-50 rounded-full border border-green-200"
                  title="Listen to pronunciation"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {result.meanings.slice(0, 3).map((m, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="inline-block bg-gray-200 text-gray-800 text-[11px] font-bold px-2 py-0.5 rounded uppercase mb-1">
                      {m.partOfSpeech}
                    </span>
                    <ol className="list-decimal list-inside space-y-1.5 text-gray-700 pl-1 text-xs">
                      {m.definitions.slice(0, 2).map((d, dIdx) => (
                        <li key={dIdx} className="leading-relaxed">
                          <span className="text-gray-900 font-medium">{d.definition}</span>
                          {d.example && (
                            <p className="text-gray-500 italic pl-4 text-[11px]">"{d.example}"</p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

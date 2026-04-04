export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  displayUrl: string;
  source: string;
  detailedSnippet?: string;
}

const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY;
const SERPER_URL = 'https://google.serper.dev/search';

export const webSearchService = {
  async searchLegal(query: string, numResults: number = 10, page: number = 1): Promise<WebSearchResult[]> {
    if (!SERPER_API_KEY) {
      console.warn('VITE_SERPER_API_KEY is not set. Returning mock results.');
      return getMockResults(query, page, numResults);
    }

    try {
      const response = await fetch(SERPER_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: `${query} Indian law legal`,
          num: numResults,
          page,
          gl: 'in',
          hl: 'en',
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
      }

      const data = await response.json();
      const organicResults = data.organic || [];

      return organicResults.slice(0, numResults).map((item: any) => ({
        title: item.title || 'Untitled',
        snippet: item.snippet || '',
        url: item.link || '',
        displayUrl: item.displayLink || new URL(item.link || 'https://example.com').hostname,
        source: item.displayLink || new URL(item.link || 'https://example.com').hostname,
        detailedSnippet: item.snippetHighlightedWords
          ? item.snippet
          : undefined,
      }));
    } catch (error) {
      console.error('Web search error:', error);
      return getMockResults(query, page, numResults);
    }
  },
};

const ALL_MOCK_SOURCES = [
  {
    urlFn: (q: string) => `https://indiankanoon.org/search/?formInput=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `Indian Law on "${q}" – IndiaKanoon`,
    snippetFn: (q: string) => `Comprehensive legal database with judgments and case laws related to ${q} in India. Includes Supreme Court and High Court judgments.`,
    host: 'indiankanoon.org',
  },
  {
    urlFn: (q: string) => `https://www.barandbench.com/search?q=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – Legal Analysis | Bar & Bench`,
    snippetFn: (q: string) => `Analysis of ${q} under Indian law, including key statutes, case precedents, and landmark judgments relevant to legal practitioners.`,
    host: 'barandbench.com',
  },
  {
    urlFn: (q: string) => `https://www.scconline.com/blog/?s=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – Supreme Court Cases | SCC Online`,
    snippetFn: (q: string) => `SCC Online provides curated case laws, legal commentary and statutes related to ${q}. Used by top Indian law firms and courts.`,
    host: 'scconline.com',
  },
  {
    urlFn: (q: string) => `https://www.manupatra.com/roundup/searchresult.aspx?keyword=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} under IPC/CrPC – Manupatra`,
    snippetFn: (q: string) => `Manupatra's database contains comprehensive case laws and statutory provisions applicable to ${q} under various Indian statutes.`,
    host: 'manupatra.com',
  },
  {
    urlFn: (q: string) => `https://lawrato.com/search?q=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – Legal Provisions | LawRato`,
    snippetFn: (q: string) => `Understand your rights and legal remedies related to ${q}. Expert legal advice and articles by top Indian advocates.`,
    host: 'lawrato.com',
  },
  {
    urlFn: () => `https://lawcommissionofindia.nic.in/`,
    titleFn: (q: string) => `${q} – Law Commission Reports`,
    snippetFn: (q: string) => `Official Law Commission of India reports and recommendations on ${q}, available for legal research and academic use.`,
    host: 'lawcommissionofindia.nic.in',
  },
  {
    urlFn: (q: string) => `https://www.livelaw.in/search?query=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – High Court Rulings | Live Law`,
    snippetFn: (q: string) => `Latest High Court and Supreme Court rulings on ${q}. Coverage of significant legal developments across Indian courts.`,
    host: 'livelaw.in',
  },
  {
    urlFn: (q: string) => `https://www.myadvo.in/blog/?s=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – Legal Dictionary | MyAdvo`,
    snippetFn: (q: string) => `Clear definitions, legal framework, and procedural guidance on ${q} in the Indian legal system. Curated by legal experts.`,
    host: 'myadvo.in',
  },
  {
    urlFn: () => `https://legislative.gov.in/`,
    titleFn: (q: string) => `${q} – Ministry of Law & Justice | India.gov.in`,
    snippetFn: (q: string) => `Official Government of India Ministry of Law and Justice portal with Acts, Bills and government notifications relating to ${q}.`,
    host: 'legislative.gov.in',
  },
  {
    urlFn: () => `https://www.taxmann.com/research/`,
    titleFn: (q: string) => `${q} – Taxmann Legal`,
    snippetFn: (q: string) => `In-depth commentary, case laws and statutory interpretation related to ${q}. Trusted source for Indian legal and tax professionals.`,
    host: 'taxmann.com',
  },
  {
    urlFn: (q: string) => `https://www.advocatekhoj.com/library/?s=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – AdvocateKhoj Legal Library`,
    snippetFn: (q: string) => `Access a curated library of legal articles, case laws, and statutes related to ${q}. Ideal for Indian advocates and law students.`,
    host: 'advocatekhoj.com',
  },
  {
    urlFn: (q: string) => `https://main.sci.gov.in/judgments`,
    titleFn: (q: string) => `${q} – Supreme Court of India Judgments`,
    snippetFn: (q: string) => `Official Supreme Court of India judgment repository. Search for authoritative rulings on ${q} directly from the court's official portal.`,
    host: 'sci.gov.in',
  },
  {
    urlFn: (q: string) => `https://www.legalbites.in/?s=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – Legal Bites`,
    snippetFn: (q: string) => `Articles, case briefs and notes on ${q} for Indian law students and practitioners. Covers IPC, CrPC, CPC, constitutional law, and more.`,
    host: 'legalbites.in',
  },
  {
    urlFn: (q: string) => `https://economictimes.indiatimes.com/search?q=${encodeURIComponent(q)}+law`,
    titleFn: (q: string) => `${q} – Economic Times Legal & Regulatory`,
    snippetFn: (q: string) => `Business and regulatory developments related to ${q} in India. Covers amendments, government notifications, and court orders.`,
    host: 'economictimes.indiatimes.com',
  },
  {
    urlFn: (q: string) => `https://prsindia.org/bills-search?q=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – PRS India Legislative Research`,
    snippetFn: (q: string) => `Independent research on Parliament Bills, Acts and ${q} policy. Detailed analysis of legislation and its practical implications.`,
    host: 'prsindia.org',
  },
  {
    urlFn: (q: string) => `https://www.jstor.org/action/doBasicSearch?Query=${encodeURIComponent(q)}+indian+law`,
    titleFn: (q: string) => `${q} – Academic Journals | JSTOR`,
    snippetFn: (q: string) => `Peer-reviewed academic legal research on ${q} in the Indian context. Includes journal articles from leading Indian and international law reviews.`,
    host: 'jstor.org',
  },
  {
    urlFn: (q: string) => `https://www.epw.in/search-result.html?searchkeyword=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – Economic & Political Weekly`,
    snippetFn: (q: string) => `Socio-legal analysis of ${q} from an Indian policy perspective, covering judicial trends, legislative changes, and their societal impact.`,
    host: 'epw.in',
  },
  {
    urlFn: (q: string) => `https://nlsir.com/?s=${encodeURIComponent(q)}`,
    titleFn: (q: string) => `${q} – NLS India Review`,
    snippetFn: (q: string) => `NLS India Review scholarly articles on ${q}. Published by the National Law School of India University, Bengaluru.`,
    host: 'nlsir.com',
  },
  {
    urlFn: (q: string) => `https://www.highcourtofdelhi.nic.in/`,
    titleFn: (q: string) => `${q} – Delhi High Court Orders`,
    snippetFn: (q: string) => `Recent orders and judgements from the Delhi High Court relating to ${q}. Browse case status, daily orders, and archived judgments.`,
    host: 'highcourtofdelhi.nic.in',
  },
  {
    urlFn: (q: string) => `https://bombayhighcourt.nic.in/`,
    titleFn: (q: string) => `${q} – Bombay High Court Orders`,
    snippetFn: (q: string) => `Judgment repository of the Bombay High Court. Find relevant cases and orders on ${q} from one of India's oldest High Courts.`,
    host: 'bombayhighcourt.nic.in',
  },
];

function getMockResults(query: string, page: number = 1, pageSize: number = 10): WebSearchResult[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = ALL_MOCK_SOURCES.slice(start, end);
  return slice.map(s => ({
    title: s.titleFn(query),
    snippet: s.snippetFn(query),
    url: s.urlFn(query),
    displayUrl: s.host,
    source: s.host,
  }));
}

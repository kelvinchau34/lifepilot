import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface SearchResult {
  index: number;
  document: string;
  similarity: number;
  reportId: string;
  reportName: string;
}

export const HealthSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await axios.post('/api/agents/health/search', { query });
      
      if (response.data.success) {
        setResults(response.data.data);
        setHasSearched(true);
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error performing search');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const highlightMatchText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.split(' ').join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? 
            <span key={i} className="bg-yellow-200">{part}</span> : 
            <span key={i}>{part}</span>
        )}
      </>
    );
  };

  const formatSimilarity = (similarity: number) => {
    // Convert similarity score to percentage
    return `${(similarity * 100).toFixed(0)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Search Health Documents</h2>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for medical terms, diagnoses, medications..."
            className="flex-1 px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={isSearching}
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="mt-4">
          {searchError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
              <p className="font-medium">Search error</p>
              <p className="text-sm mt-1">{searchError}</p>
            </div>
          )}
          
          {isSearching && (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                </div>
              ))}
            </div>
          )}
          
          {hasSearched && !isSearching && results.length === 0 && (
            <div className="text-center py-8">
              <svg 
                className="w-12 h-12 text-gray-400 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-gray-500">
                Try different search terms or upload more documents
              </p>
            </div>
          )}
          
          {!isSearching && results.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                Found {results.length} results for "{query}"
              </div>
              
              {results.map((result, index) => (
                <Link 
                  key={index}
                  to={`/health/reports/${result.reportId}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-blue-600">
                      {result.reportName}
                    </h3>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                      Match: {formatSimilarity(result.similarity)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 text-sm">
                    {highlightMatchText(result.document, query)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthSearch;
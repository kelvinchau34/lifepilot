import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { healthService, SearchResult } from '../../../services/healthService';

export const HealthSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || query.trim().length < 3) {
      setSearchError('Please enter at least 3 characters to search');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const searchResults = await healthService.search(query.trim());
      setResults(searchResults);
      setHasSearched(true);
    } catch (err: any) {
      setSearchError(err.message || 'Error performing search');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear error when user starts typing
    if (searchError && value.length >= 3) {
      setSearchError(null);
    }
  };

  const highlightMatchText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    // Split query into words and create regex
    const queryWords = searchQuery.trim().split(/\s+/).filter(word => word.length > 0);
    if (queryWords.length === 0) return text;
    
    const regex = new RegExp(`(${queryWords.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? 
            <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
            <span key={i}>{part}</span>
        )}
      </>
    );
  };

  const formatSimilarity = (similarity: number) => {
    // Convert similarity score to percentage
    return `${Math.round(similarity * 100)}% match`;
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">Search Health Documents</h2>
        <p className="text-sm text-gray-600 mt-1">
          Search across all your processed health documents using AI-powered semantic search
        </p>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search for medical terms, diagnoses, medications, symptoms..."
              className="flex-1 px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={isSearching}
              minLength={3}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSearching || query.trim().length < 3}
            >
              {isSearching ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Searching...
                </div>
              ) : (
                'Search'
              )}
            </button>
          </div>
          
          {/* Search tips */}
          <div className="text-xs text-gray-500">
            <strong>Search tips:</strong> Try terms like "blood pressure", "diabetes", "medication names", or "lab results"
          </div>
        </form>

        <div className="mt-6">
          {searchError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Search error:</span>
              </div>
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
          
          {hasSearched && !isSearching && results.length === 0 && !searchError && (
            <div className="text-center py-12">
              <svg 
                className="w-16 h-16 text-gray-400 mx-auto mb-4" 
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">
                No documents matched your search for "{query}". Try different terms or upload more documents.
              </p>
              <div className="text-sm text-gray-600">
                <p><strong>Suggestions:</strong></p>
                <ul className="mt-1 space-y-1">
                  <li>• Try more general terms (e.g., "heart" instead of "cardiac arrhythmia")</li>
                  <li>• Check spelling and try alternative terms</li>
                  <li>• Use common medical terminology</li>
                </ul>
              </div>
            </div>
          )}
          
          {!isSearching && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"
                </div>
                <div className="text-xs text-gray-500">
                  Results ranked by relevance
                </div>
              </div>
              
              {results.map((result, index) => (
                <Link 
                  key={`${result.reportId}-${index}`}
                  to={`/health/reports/${result.reportId}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
                      📄 {result.reportName}
                    </h3>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {formatSimilarity(result.similarity)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {highlightMatchText(truncateText(result.document), query)}
                  </p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Click to view full document
                    </span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {hasSearched && results.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 How semantic search works</h4>
              <p className="text-sm text-blue-800">
                Our AI understands the meaning behind your search terms, not just exact word matches. 
                It can find relevant information even when different terminology is used in your documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthSearch;
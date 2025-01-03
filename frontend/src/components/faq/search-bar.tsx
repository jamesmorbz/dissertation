import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentSearches?: string[];
  popularTags?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  recentSearches = ['smart plug setup', 'energy saving tips', 'automation'],
  popularTags = ['setup', 'devices', 'energy', 'savings', 'automation'],
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        setShowSuggestions(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative max-w-md mx-auto search-container">
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={false}
          animate={{
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused
              ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
              : '0 0 0 0 transparent',
          }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search questions, answers, or topics..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-8 pr-12 bg-background transition-all"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-2 top-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </form>

      <AnimatePresence>
        {showSuggestions && (searchQuery || isFocused) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute w-full mt-2 z-50"
          >
            <Card className="p-4 shadow-lg">
              {searchQuery && (
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-sm text-muted-foreground"
                    onClick={() => {
                      setShowSuggestions(false);
                    }}
                  >
                    <span>Press enter to search</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!searchQuery && (
                <>
                  {recentSearches.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">
                        Recent Searches
                      </h3>
                      <div className="space-y-2">
                        {recentSearches.map((search, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-sm"
                            onClick={() => {
                              setSearchQuery(search);
                              setShowSuggestions(false);
                            }}
                          >
                            <Search className="h-3 w-3 mr-2" />
                            {search}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium mb-2">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map((tag, index) => (
                        <Button
                          key={index}
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchQuery(tag);
                            setShowSuggestions(false);
                          }}
                        >
                          #{tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { SearchBar };

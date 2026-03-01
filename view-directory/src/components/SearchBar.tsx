import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearch } from '../hooks/useSearch';
import { useActiveNode } from '../contexts/ActiveNodeContext';
import { useExpanded } from '../contexts/ExpandedContext';
import { useSearchContext } from '../contexts/SearchContext';
import { useTranslation } from '../contexts/I18nContext';
import { RawFileNode } from '../types';

const DEBOUNCE_MS = 300;

export const SearchBar: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const { t } = useTranslation();

    const { results, nodeMap, isLoading } = useSearch(debouncedValue);
    const { setActiveNodeId } = useActiveNode();
    const { expandMultiple } = useExpanded();
    const { setSearchQuery } = useSearchContext();

    // Debounce input
    const handleInputChange = useCallback((value: string) => {
        setInputValue(value);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedValue(value);
            setSearchQuery(value.trim());
            setHighlightedIndex(-1);
        }, DEBOUNCE_MS);
    }, [setSearchQuery]);

    // Open dropdown when results are available
    useEffect(() => {
        if (debouncedValue.trim().length >= 2 && results.length > 0) {
            setIsOpen(true);
        } else if (debouncedValue.trim().length < 2) {
            setIsOpen(false);
        }
    }, [debouncedValue, results]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Build ancestor path and navigate to a result
    const navigateToResult = useCallback((node: RawFileNode) => {
        const ancestorIds: string[] = [];
        let currentId = node.parentId;
        const seen = new Set<string>();

        while (currentId && currentId !== 'root') {
            if (seen.has(currentId)) break;
            seen.add(currentId);
            ancestorIds.push(currentId);
            const parent = nodeMap.get(currentId);
            currentId = parent?.parentId ?? null;
        }

        // Expand all ancestors so the node becomes visible in the tree
        if (ancestorIds.length > 0) {
            expandMultiple(ancestorIds);
        }

        // If the node itself is a directory, expand it too
        if (node.type === 'directory') {
            expandMultiple([node.id]);
        }

        setActiveNodeId(node.id);
        setIsOpen(false);
        inputRef.current?.blur();
    }, [nodeMap, expandMultiple, setActiveNodeId]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) {
            if (e.key === 'Escape') {
                handleClear();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    const next = prev < results.length - 1 ? prev + 1 : 0;
                    resultRefs.current[next]?.scrollIntoView({ block: 'nearest' });
                    return next;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    const next = prev > 0 ? prev - 1 : results.length - 1;
                    resultRefs.current[next]?.scrollIntoView({ block: 'nearest' });
                    return next;
                });
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < results.length) {
                    navigateToResult(results[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
        }
    };

    const handleClear = () => {
        setInputValue('');
        setDebouncedValue('');
        setSearchQuery('');
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    // Get parent path string for a result
    const getParentPath = (node: RawFileNode): string => {
        const parts: string[] = [];
        let currentId = node.parentId;
        const seen = new Set<string>();
        while (currentId && currentId !== 'root') {
            if (seen.has(currentId)) break;
            seen.add(currentId);
            const parent = nodeMap.get(currentId);
            if (parent) {
                parts.unshift(parent.name);
                currentId = parent.parentId;
            } else {
                break;
            }
        }
        return parts.length > 0 ? parts.join(' / ') : 'Root';
    };

    return (
        <div className="search-container" ref={containerRef}>
            <div className="search-input-wrapper">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder={t('searchPlaceholder')}
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (results.length > 0 && debouncedValue.trim().length >= 2) {
                            setIsOpen(true);
                        }
                    }}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls="search-results-listbox"
                    aria-activedescendant={
                        highlightedIndex >= 0 ? `search-result-${highlightedIndex}` : undefined
                    }
                    aria-label={t('searchPlaceholder')}
                />
                {inputValue && (
                    <button
                        className="search-clear"
                        onClick={handleClear}
                        aria-label="Clear search"
                        tabIndex={-1}
                    >
                        ✕
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    className="search-results"
                    id="search-results-listbox"
                    role="listbox"
                    aria-label={t('searchResultsCount').replace('{count}', String(results.length))}
                >
                    {isLoading ? (
                        <div className="search-result-empty">{t('loading')}</div>
                    ) : results.length === 0 ? (
                        <div className="search-result-empty">{t('noResults')}</div>
                    ) : (
                        <>
                            <div className="search-results-header">
                                {t('searchResultsCount').replace('{count}', String(results.length))}
                            </div>
                            {results.map((node, index) => (
                                <button
                                    key={node.id}
                                    ref={(el) => { resultRefs.current[index] = el; }}
                                    id={`search-result-${index}`}
                                    className={`search-result-item ${index === highlightedIndex ? 'search-result-item--highlighted' : ''
                                        }`}
                                    role="option"
                                    aria-selected={index === highlightedIndex}
                                    onClick={() => navigateToResult(node)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    <span className="search-result-icon">
                                        {node.type === 'directory' ? '📁' : '📄'}
                                    </span>
                                    <div className="search-result-text">
                                        <span className="search-result-name">
                                            <HighlightMatch
                                                text={node.name}
                                                query={debouncedValue.trim()}
                                            />
                                        </span>
                                        <span className="search-result-path">
                                            {getParentPath(node)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// Highlights matching substring within text
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
    if (!query) return <>{text}</>;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    if (matchIndex === -1) return <>{text}</>;

    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + query.length);
    const after = text.slice(matchIndex + query.length);

    return (
        <>
            {before}
            <mark className="search-highlight">{match}</mark>
            {after}
        </>
    );
};

export { HighlightMatch };

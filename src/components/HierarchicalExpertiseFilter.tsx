import React, { useState, useMemo } from 'react';
import { EXPERTISE_TAXONOMY, TaxonomyCategory, TaxonomyNode, findNodesByText, getChildNodes } from '../utils/expertiseTaxonomy';

interface HierarchicalExpertiseFilterProps {
  selectedExpertise: string[];
  onExpertiseChange: (expertise: string[]) => void;
  className?: string;
}

interface CategorySectionProps {
  category: TaxonomyCategory;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  searchQuery: string;
}

function CategorySection({ category, selectedIds, onSelectionChange, searchQuery }: CategorySectionProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeSelection = (nodeId: string, isSelected: boolean) => {
    if (isSelected) {
      onSelectionChange([...selectedIds, nodeId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== nodeId));
    }
  };

  const renderNode = (node: TaxonomyNode, depth: number = 1): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedIds.includes(node.id);
    const isVisible = searchQuery === '' || 
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.aliases && node.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!isVisible && !hasChildren) return null;

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center py-1 px-2 rounded-md hover:bg-gray-50 cursor-pointer ${
            depth === 1 ? 'font-medium' : depth === 2 ? 'font-normal' : 'text-sm'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {/* Expand/collapse button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(node.id)}
              className="mr-2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
          
          {/* Checkbox for leaf nodes */}
          {!hasChildren && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleNodeSelection(node.id, e.target.checked)}
              className="mr-2 w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          )}
          
          {/* Node icon and label */}
          <div className="flex items-center space-x-1 flex-1">
            {node.icon && <span className="text-sm">{node.icon}</span>}
            <span className={`${!hasChildren ? 'text-gray-700' : 'text-gray-900'} ${
              isSelected ? 'font-medium' : ''
            }`}>
              {node.label}
            </span>
            {isSelected && (
              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                ✓
              </span>
            )}
          </div>
        </div>
        
        {/* Render children if expanded */}
        {hasChildren && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Filter visible nodes based on search
  const visibleChildren = searchQuery === '' ? category.children : 
    category.children.filter(node => {
      const nodeMatches = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.aliases && node.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const hasVisibleChildren = node.children?.some(child => 
        child.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (child.aliases && child.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      
      return nodeMatches || hasVisibleChildren;
    });

  if (visibleChildren.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-3">
      <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-100">
        <span className="text-lg">{category.icon}</span>
        <h3 className="font-semibold text-gray-900">{category.label}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {selectedIds.filter(id => {
            // Count selected items in this category
            const categoryNodes = [category, ...category.children.flatMap(function flatten(node): TaxonomyNode[] {
              return [node, ...(node.children?.flatMap(flatten) || [])];
            })];
            return categoryNodes.some(node => node.id === id);
          }).length} selected
        </span>
      </div>
      
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {visibleChildren.map(node => renderNode(node, 1))}
      </div>
    </div>
  );
}

export function HierarchicalExpertiseFilter({ 
  selectedExpertise, 
  onExpertiseChange, 
  className = "" 
}: HierarchicalExpertiseFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Get currently selected count per category
  const selectionCounts = useMemo(() => {
    const counts: { [categoryId: string]: number } = {};
    
    for (const category of EXPERTISE_TAXONOMY) {
      counts[category.id] = 0;
      const categoryNodes = [category, ...category.children.flatMap(function flatten(node): TaxonomyNode[] {
        return [node, ...(node.children?.flatMap(flatten) || [])];
      })];
      
      for (const selectedId of selectedExpertise) {
        if (categoryNodes.some(node => node.id === selectedId)) {
          counts[category.id]++;
        }
      }
    }
    
    return counts;
  }, [selectedExpertise]);

  // Filter categories based on search or show priority categories
  const visibleCategories = useMemo(() => {
    if (searchQuery.trim()) {
      // Show all categories when searching
      return EXPERTISE_TAXONOMY;
    } else if (showAllCategories) {
      return EXPERTISE_TAXONOMY;
    } else {
      // Show categories with selections or top 2 most important ones
      const categoriesWithSelections = EXPERTISE_TAXONOMY.filter(cat => selectionCounts[cat.id] > 0);
      const topCategories = EXPERTISE_TAXONOMY.slice(0, 2); // Methods and Organisms
      
      return [...new Set([...categoriesWithSelections, ...topCategories])];
    }
  }, [searchQuery, showAllCategories, selectionCounts]);

  const totalSelected = selectedExpertise.length;
  const hasHiddenCategories = !showAllCategories && visibleCategories.length < EXPERTISE_TAXONOMY.length;

  const clearAllSelections = () => {
    onExpertiseChange([]);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Filter by Expertise</h3>
          <div className="flex items-center space-x-2">
            {totalSelected > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {totalSelected} selected
              </span>
            )}
            {totalSelected > 0 && (
              <button
                onClick={clearAllSelections}
                className="text-xs text-red-600 hover:text-red-800 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expertise areas..."
            className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {visibleCategories.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            selectedIds={selectedExpertise}
            onSelectionChange={onExpertiseChange}
            searchQuery={searchQuery}
          />
        ))}
        
        {hasHiddenCategories && (
          <button
            onClick={() => setShowAllCategories(true)}
            className="w-full mt-2 py-2 px-4 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
          >
            Show all categories ({EXPERTISE_TAXONOMY.length - visibleCategories.length} more)
          </button>
        )}

        {searchQuery && visibleCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>No expertise areas found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Quick selections */}
      {!searchQuery && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Popular areas:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'phylogenetics', label: '🌳 Phylogenetics' },
              { id: 'population-genetics', label: '👥 Population Genetics' },
              { id: 'blast', label: '🔍 BLAST' },
              { id: 'bayesian-inference', label: '📊 Bayesian Analysis' },
              { id: 'rnaseq', label: '🧬 RNA-seq' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => {
                  if (selectedExpertise.includes(id)) {
                    onExpertiseChange(selectedExpertise.filter(exp => exp !== id));
                  } else {
                    onExpertiseChange([...selectedExpertise, id]);
                  }
                }}
                className={`px-2 py-1 rounded-full text-xs transition-colors ${
                  selectedExpertise.includes(id)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HierarchicalExpertiseFilter;
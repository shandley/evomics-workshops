/**
 * Taxonomy Synchronization Utilities
 * 
 * Merges the workshop expertise taxonomy with faculty scientific topics
 * to create a unified classification system across the Evomics ecosystem.
 */

import { EXPERTISE_TAXONOMY, type TaxonomyCategory, type TaxonomyNode } from './expertiseTaxonomy';

// Import faculty scientific topics (we'll need to load this dynamically)
interface FacultyTopic {
  id: string;
  label: string;
  level: number;
  description?: string;
  icon?: string;
  children?: string[];
}

interface FacultyTopicsData {
  metadata: {
    version: string;
    lastUpdated: string;
    totalTopics: number;
    levels: number;
  };
  topics: { [key: string]: FacultyTopic };
}

interface UnifiedTaxonomyNode {
  id: string;
  label: string;
  level: number;
  icon?: string;
  description?: string;
  children?: UnifiedTaxonomyNode[];
  aliases?: string[];
  parentId?: string;
  sources: ('workshop' | 'faculty')[];
  workshopId?: string;
  facultyId?: string;
}

interface UnifiedTaxonomy {
  metadata: {
    version: string;
    lastUpdated: string;
    totalNodes: number;
    sources: string[];
    syncStrategy: string;
  };
  categories: UnifiedTaxonomyNode[];
  workshopMappings: { [workshopId: string]: string };
  facultyMappings: { [facultyId: string]: string };
}

/**
 * Load faculty scientific topics from JSON file
 * Browser-safe version - returns empty dataset for now
 */
async function loadFacultyTopics(): Promise<FacultyTopicsData> {
  // Browser-safe implementation - returns empty dataset
  // For actual sync, use the Node.js version in scripts/
  return {
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalTopics: 0,
      levels: 0
    },
    topics: {}
  };
}

/**
 * Convert workshop taxonomy to unified format
 */
function convertWorkshopTaxonomy(categories: TaxonomyCategory[]): UnifiedTaxonomyNode[] {
  const unified: UnifiedTaxonomyNode[] = [];
  
  for (const category of categories) {
    const categoryNode: UnifiedTaxonomyNode = {
      id: `workshop-${category.id}`,
      label: category.label,
      level: 0,
      icon: category.icon,
      description: category.description,
      sources: ['workshop'],
      workshopId: category.id,
      children: []
    };
    
    categoryNode.children = convertWorkshopNodes(category.children, categoryNode.id);
    unified.push(categoryNode);
  }
  
  return unified;
}

/**
 * Convert workshop taxonomy nodes recursively
 */
function convertWorkshopNodes(nodes: TaxonomyNode[], parentId?: string): UnifiedTaxonomyNode[] {
  return nodes.map(node => {
    const unified: UnifiedTaxonomyNode = {
      id: `workshop-${node.id}`,
      label: node.label,
      level: node.level,
      icon: node.icon,
      description: node.description,
      aliases: node.aliases,
      parentId,
      sources: ['workshop'],
      workshopId: node.id
    };
    
    if (node.children && node.children.length > 0) {
      unified.children = convertWorkshopNodes(node.children, unified.id);
    }
    
    return unified;
  });
}

/**
 * Convert faculty topics to unified format
 */
function convertFacultyTopics(facultyData: FacultyTopicsData): UnifiedTaxonomyNode[] {
  const unified: UnifiedTaxonomyNode[] = [];
  
  for (const [topicId, topic] of Object.entries(facultyData.topics)) {
    const unifiedNode: UnifiedTaxonomyNode = {
      id: `faculty-${topicId}`,
      label: topic.label,
      level: topic.level,
      icon: topic.icon,
      description: topic.description,
      sources: ['faculty'],
      facultyId: topicId,
      children: []
    };
    
    // Convert children if they exist
    if (topic.children && topic.children.length > 0) {
      unifiedNode.children = topic.children.map(childId => {
        const childTopic = facultyData.topics[childId];
        return {
          id: `faculty-${childId}`,
          label: childTopic?.label || childId,
          level: childTopic?.level || topic.level + 1,
          icon: childTopic?.icon,
          description: childTopic?.description,
          parentId: unifiedNode.id,
          sources: ['faculty' as const],
          facultyId: childId
        };
      });
    }
    
    unified.push(unifiedNode);
  }
  
  return unified;
}

/**
 * Merge similar nodes from both taxonomies
 */
function mergeNodes(workshopNodes: UnifiedTaxonomyNode[], facultyNodes: UnifiedTaxonomyNode[]): UnifiedTaxonomyNode[] {
  const merged: UnifiedTaxonomyNode[] = [];
  const processedFacultyIds = new Set<string>();
  
  // First pass: find workshop nodes that have faculty equivalents
  for (const workshopNode of workshopNodes) {
    let merged_node = { ...workshopNode };
    let foundMatch = false;
    
    // Look for matching faculty nodes
    for (const facultyNode of facultyNodes) {
      if (processedFacultyIds.has(facultyNode.id)) continue;
      
      // Check for similar labels (case-insensitive, partial matches)
      const workshopLabel = workshopNode.label.toLowerCase();
      const facultyLabel = facultyNode.label.toLowerCase();
      
      if (
        workshopLabel === facultyLabel ||
        workshopLabel.includes(facultyLabel) ||
        facultyLabel.includes(workshopLabel) ||
        (workshopNode.aliases && workshopNode.aliases.some(alias => 
          alias.toLowerCase() === facultyLabel
        ))
      ) {
        // Merge the nodes
        merged_node = {
          ...workshopNode,
          sources: ['workshop', 'faculty'],
          facultyId: facultyNode.facultyId,
          description: workshopNode.description || facultyNode.description,
          aliases: [
            ...(workshopNode.aliases || []),
            ...(facultyNode.aliases || [])
          ].filter((alias, index, arr) => arr.indexOf(alias) === index)
        };
        
        foundMatch = true;
        processedFacultyIds.add(facultyNode.id);
        break;
      }
    }
    
    merged.push(merged_node);
  }
  
  // Second pass: add faculty nodes that weren't matched
  for (const facultyNode of facultyNodes) {
    if (!processedFacultyIds.has(facultyNode.id)) {
      merged.push(facultyNode);
    }
  }
  
  return merged;
}

/**
 * Create unified taxonomy from both workshop and faculty taxonomies
 */
export async function createUnifiedTaxonomy(): Promise<UnifiedTaxonomy> {
  const facultyData = await loadFacultyTopics();
  
  // Convert both taxonomies to unified format
  const workshopNodes = convertWorkshopTaxonomy(EXPERTISE_TAXONOMY);
  const facultyNodes = convertFacultyTopics(facultyData);
  
  // Merge similar nodes
  const mergedNodes = mergeNodes(workshopNodes, facultyNodes);
  
  // Create mapping objects
  const workshopMappings: { [workshopId: string]: string } = {};
  const facultyMappings: { [facultyId: string]: string } = {};
  
  function buildMappings(nodes: UnifiedTaxonomyNode[]) {
    for (const node of nodes) {
      if (node.workshopId) {
        workshopMappings[node.workshopId] = node.id;
      }
      if (node.facultyId) {
        facultyMappings[node.facultyId] = node.id;
      }
      if (node.children) {
        buildMappings(node.children);
      }
    }
  }
  
  buildMappings(mergedNodes);
  
  return {
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalNodes: countNodes(mergedNodes),
      sources: ['workshop', 'faculty'],
      syncStrategy: 'merge-similar-preserve-unique'
    },
    categories: mergedNodes,
    workshopMappings,
    facultyMappings
  };
}

/**
 * Count total nodes in the taxonomy
 */
function countNodes(nodes: UnifiedTaxonomyNode[]): number {
  let count = nodes.length;
  for (const node of nodes) {
    if (node.children) {
      count += countNodes(node.children);
    }
  }
  return count;
}

/**
 * Find a node by ID in the unified taxonomy
 */
export function findUnifiedNode(taxonomy: UnifiedTaxonomy, nodeId: string): UnifiedTaxonomyNode | undefined {
  function search(nodes: UnifiedTaxonomyNode[]): UnifiedTaxonomyNode | undefined {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      if (node.children) {
        const found = search(node.children);
        if (found) return found;
      }
    }
    return undefined;
  }
  
  return search(taxonomy.categories);
}

/**
 * Search nodes by text in the unified taxonomy
 */
export function searchUnifiedNodes(taxonomy: UnifiedTaxonomy, searchText: string): UnifiedTaxonomyNode[] {
  const results: UnifiedTaxonomyNode[] = [];
  const searchLower = searchText.toLowerCase();
  
  function search(nodes: UnifiedTaxonomyNode[]) {
    for (const node of nodes) {
      // Search in label
      if (node.label.toLowerCase().includes(searchLower)) {
        results.push(node);
      }
      
      // Search in aliases
      if (node.aliases?.some(alias => alias.toLowerCase().includes(searchLower))) {
        results.push(node);
      }
      
      // Search in description
      if (node.description?.toLowerCase().includes(searchLower)) {
        results.push(node);
      }
      
      if (node.children) {
        search(node.children);
      }
    }
  }
  
  search(taxonomy.categories);
  return results;
}

/**
 * Get mapping from workshop taxonomy ID to unified ID
 */
export function mapWorkshopToUnified(taxonomy: UnifiedTaxonomy, workshopId: string): string | undefined {
  return taxonomy.workshopMappings[workshopId];
}

/**
 * Get mapping from faculty taxonomy ID to unified ID
 */
export function mapFacultyToUnified(taxonomy: UnifiedTaxonomy, facultyId: string): string | undefined {
  return taxonomy.facultyMappings[facultyId];
}

export default {
  createUnifiedTaxonomy,
  findUnifiedNode,
  searchUnifiedNodes,
  mapWorkshopToUnified,
  mapFacultyToUnified
};
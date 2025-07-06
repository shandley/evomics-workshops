// Hierarchical taxonomy for workshop expertise areas
export interface TaxonomyNode {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  children?: TaxonomyNode[];
  aliases?: string[]; // For search matching
  level: number;
  parentId?: string;
}

export interface TaxonomyCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  children: TaxonomyNode[];
}

// Main taxonomy structure for workshop expertise
export const EXPERTISE_TAXONOMY: TaxonomyCategory[] = [
  {
    id: 'methods',
    label: 'Methods & Approaches',
    icon: '📊',
    color: '#3b82f6', // Blue
    description: 'Computational and statistical methods used in genomics',
    children: [
      {
        id: 'phylogenetics',
        label: 'Phylogenetic Analysis',
        icon: '🌳',
        level: 1,
        parentId: 'methods',
        children: [
          {
            id: 'tree-building',
            label: 'Tree Construction',
            level: 2,
            parentId: 'phylogenetics',
            aliases: ['phylogeny', 'tree building', 'phylogenetic reconstruction'],
            children: [
              { id: 'maximum-likelihood', label: 'Maximum Likelihood', level: 3, parentId: 'tree-building', aliases: ['ML', 'max likelihood'] },
              { id: 'bayesian-inference', label: 'Bayesian Inference', level: 3, parentId: 'tree-building', aliases: ['bayesian', 'mcmc'] },
              { id: 'distance-methods', label: 'Distance Methods', level: 3, parentId: 'tree-building', aliases: ['neighbor joining', 'UPGMA'] },
              { id: 'parsimony', label: 'Maximum Parsimony', level: 3, parentId: 'tree-building', aliases: ['parsimony'] }
            ]
          },
          {
            id: 'phylo-software',
            label: 'Phylogenetic Software',
            level: 2,
            parentId: 'phylogenetics',
            children: [
              { id: 'beast', label: 'BEAST', level: 3, parentId: 'phylo-software', aliases: ['BEAST 2', 'BEAUti'] },
              { id: 'mrbayes', label: 'MrBayes', level: 3, parentId: 'phylo-software' },
              { id: 'raxml', label: 'RAxML', level: 3, parentId: 'phylo-software' },
              { id: 'iqtree', label: 'IQ-TREE', level: 3, parentId: 'phylo-software' },
              { id: 'paup', label: 'PAUP*', level: 3, parentId: 'phylo-software' }
            ]
          },
          {
            id: 'tree-evaluation',
            label: 'Tree Support & Validation',
            level: 2,
            parentId: 'phylogenetics',
            children: [
              { id: 'bootstrap', label: 'Bootstrap Analysis', level: 3, parentId: 'tree-evaluation', aliases: ['bootstrap'] },
              { id: 'posterior-prob', label: 'Posterior Probabilities', level: 3, parentId: 'tree-evaluation' },
              { id: 'tree-comparison', label: 'Tree Comparison', level: 3, parentId: 'tree-evaluation', aliases: ['tree distances'] }
            ]
          }
        ]
      },
      {
        id: 'population-genetics',
        label: 'Population Genetics',
        icon: '👥',
        level: 1,
        parentId: 'methods',
        children: [
          {
            id: 'population-structure',
            label: 'Population Structure',
            level: 2,
            parentId: 'population-genetics',
            children: [
              { id: 'admixture', label: 'ADMIXTURE Analysis', level: 3, parentId: 'population-structure', aliases: ['admixture', 'structure'] },
              { id: 'pca', label: 'Principal Component Analysis', level: 3, parentId: 'population-structure', aliases: ['PCA', 'principal components'] },
              { id: 'fst', label: 'Population Differentiation', level: 3, parentId: 'population-structure', aliases: ['FST', 'population differentiation'] }
            ]
          },
          {
            id: 'demographic-inference',
            label: 'Demographic Inference',
            level: 2,
            parentId: 'population-genetics',
            children: [
              { id: 'coalescent', label: 'Coalescent Theory', level: 3, parentId: 'demographic-inference', aliases: ['coalescent'] },
              { id: 'abc', label: 'Approximate Bayesian Computation', level: 3, parentId: 'demographic-inference', aliases: ['ABC'] },
              { id: 'migration', label: 'Migration Analysis', level: 3, parentId: 'demographic-inference', aliases: ['gene flow'] }
            ]
          },
          {
            id: 'selection-analysis',
            label: 'Selection Detection',
            level: 2,
            parentId: 'population-genetics',
            children: [
              { id: 'tajimas-d', label: "Tajima's D", level: 3, parentId: 'selection-analysis', aliases: ['tajimas d', 'neutrality tests'] },
              { id: 'gwas', label: 'Genome-Wide Association', level: 3, parentId: 'selection-analysis', aliases: ['GWAS', 'association studies'] },
              { id: 'selection-scans', label: 'Selection Scans', level: 3, parentId: 'selection-analysis', aliases: ['selective sweeps'] }
            ]
          }
        ]
      },
      {
        id: 'genomic-analysis',
        label: 'Genomic Analysis',
        icon: '🧬',
        level: 1,
        parentId: 'methods',
        children: [
          {
            id: 'sequence-analysis',
            label: 'Sequence Analysis',
            level: 2,
            parentId: 'genomic-analysis',
            children: [
              { id: 'alignment', label: 'Sequence Alignment', level: 3, parentId: 'sequence-analysis', aliases: ['multiple alignment', 'pairwise alignment'] },
              { id: 'blast', label: 'BLAST Search', level: 3, parentId: 'sequence-analysis', aliases: ['BLAST', 'sequence similarity'] },
              { id: 'motif-finding', label: 'Motif Discovery', level: 3, parentId: 'sequence-analysis', aliases: ['motifs', 'pattern recognition'] }
            ]
          },
          {
            id: 'genome-assembly',
            label: 'Genome Assembly & Annotation',
            level: 2,
            parentId: 'genomic-analysis',
            children: [
              { id: 'assembly', label: 'Genome Assembly', level: 3, parentId: 'genome-assembly', aliases: ['de novo assembly', 'genome assembly'] },
              { id: 'annotation', label: 'Genome Annotation', level: 3, parentId: 'genome-assembly', aliases: ['gene annotation', 'functional annotation'] },
              { id: 'quality-control', label: 'Quality Assessment', level: 3, parentId: 'genome-assembly', aliases: ['QC', 'quality control'] }
            ]
          },
          {
            id: 'variant-analysis',
            label: 'Variant Analysis',
            level: 2,
            parentId: 'genomic-analysis',
            children: [
              { id: 'snp-calling', label: 'SNP Calling', level: 3, parentId: 'variant-analysis', aliases: ['variant calling', 'SNP detection'] },
              { id: 'structural-variants', label: 'Structural Variants', level: 3, parentId: 'variant-analysis', aliases: ['CNVs', 'indels', 'SVs'] },
              { id: 'variant-annotation', label: 'Variant Annotation', level: 3, parentId: 'variant-analysis', aliases: ['functional annotation'] }
            ]
          }
        ]
      },
      {
        id: 'statistical-methods',
        label: 'Statistical Methods',
        icon: '📈',
        level: 1,
        parentId: 'methods',
        children: [
          {
            id: 'bayesian-methods',
            label: 'Bayesian Statistics',
            level: 2,
            parentId: 'statistical-methods',
            children: [
              { id: 'mcmc', label: 'MCMC Methods', level: 3, parentId: 'bayesian-methods', aliases: ['MCMC', 'Markov chain Monte Carlo'] },
              { id: 'model-selection', label: 'Model Selection', level: 3, parentId: 'bayesian-methods', aliases: ['bayes factors', 'model comparison'] },
              { id: 'hierarchical-models', label: 'Hierarchical Models', level: 3, parentId: 'bayesian-methods' }
            ]
          },
          {
            id: 'machine-learning',
            label: 'Machine Learning',
            level: 2,
            parentId: 'statistical-methods',
            children: [
              { id: 'classification', label: 'Classification Methods', level: 3, parentId: 'machine-learning', aliases: ['SVM', 'random forest'] },
              { id: 'clustering', label: 'Clustering Analysis', level: 3, parentId: 'machine-learning', aliases: ['k-means', 'hierarchical clustering'] },
              { id: 'deep-learning', label: 'Deep Learning', level: 3, parentId: 'machine-learning', aliases: ['neural networks', 'CNN'] }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'organisms',
    label: 'Organisms & Systems',
    icon: '🦠',
    color: '#10b981', // Green
    description: 'Biological systems and model organisms',
    children: [
      {
        id: 'model-organisms',
        label: 'Model Organisms',
        icon: '🧪',
        level: 1,
        parentId: 'organisms',
        children: [
          { id: 'human', label: 'Human', level: 2, parentId: 'model-organisms', aliases: ['homo sapiens', 'human genetics'] },
          { id: 'mouse', label: 'Mouse', level: 2, parentId: 'model-organisms', aliases: ['mus musculus', 'rodent'] },
          { id: 'drosophila', label: 'Drosophila', level: 2, parentId: 'model-organisms', aliases: ['fruit fly', 'drosophila melanogaster'] },
          { id: 'arabidopsis', label: 'Arabidopsis', level: 2, parentId: 'model-organisms', aliases: ['arabidopsis thaliana', 'plant model'] },
          { id: 'zebrafish', label: 'Zebrafish', level: 2, parentId: 'model-organisms', aliases: ['danio rerio'] },
          { id: 'yeast', label: 'Yeast', level: 2, parentId: 'model-organisms', aliases: ['saccharomyces cerevisiae'] }
        ]
      },
      {
        id: 'microbial-systems',
        label: 'Microbial Systems',
        icon: '🦠',
        level: 1,
        parentId: 'organisms',
        children: [
          { id: 'bacteria', label: 'Bacterial Genomes', level: 2, parentId: 'microbial-systems', aliases: ['prokaryotes', 'bacterial genomics'] },
          { id: 'viruses', label: 'Viral Genomes', level: 2, parentId: 'microbial-systems', aliases: ['virus', 'viral evolution'] },
          { id: 'microbiome', label: 'Microbiome Analysis', level: 2, parentId: 'microbial-systems', aliases: ['metagenomics', 'microbial communities'] },
          { id: 'archaea', label: 'Archaeal Genomes', level: 2, parentId: 'microbial-systems', aliases: ['archaea'] }
        ]
      },
      {
        id: 'eukaryotic-systems',
        label: 'Eukaryotic Systems',
        icon: '🌿',
        level: 1,
        parentId: 'organisms',
        children: [
          { id: 'plants', label: 'Plant Genomics', level: 2, parentId: 'eukaryotic-systems', aliases: ['plant genetics', 'crop genomics'] },
          { id: 'animals', label: 'Animal Genomics', level: 2, parentId: 'eukaryotic-systems', aliases: ['vertebrate genomics', 'mammalian genetics'] },
          { id: 'fungi', label: 'Fungal Genomics', level: 2, parentId: 'eukaryotic-systems', aliases: ['mycology', 'fungal genetics'] },
          { id: 'protists', label: 'Protist Genomics', level: 2, parentId: 'eukaryotic-systems', aliases: ['protozoans'] }
        ]
      }
    ]
  },
  {
    id: 'technology',
    label: 'Data & Technology',
    icon: '💻',
    color: '#8b5cf6', // Purple
    description: 'Sequencing technologies and computational platforms',
    children: [
      {
        id: 'data-types',
        label: 'Data Types',
        icon: '📊',
        level: 1,
        parentId: 'technology',
        children: [
          { id: 'wgs', label: 'Whole Genome Sequencing', level: 2, parentId: 'data-types', aliases: ['WGS', 'genome sequencing'] },
          { id: 'wes', label: 'Whole Exome Sequencing', level: 2, parentId: 'data-types', aliases: ['WES', 'exome sequencing'] },
          { id: 'rnaseq', label: 'RNA Sequencing', level: 2, parentId: 'data-types', aliases: ['RNA-seq', 'transcriptomics'] },
          { id: 'chipseq', label: 'ChIP Sequencing', level: 2, parentId: 'data-types', aliases: ['ChIP-seq', 'chromatin immunoprecipitation'] },
          { id: 'atacseq', label: 'ATAC Sequencing', level: 2, parentId: 'data-types', aliases: ['ATAC-seq', 'chromatin accessibility'] }
        ]
      },
      {
        id: 'platforms',
        label: 'Sequencing Platforms',
        icon: '🧬',
        level: 1,
        parentId: 'technology',
        children: [
          { id: 'illumina', label: 'Illumina Sequencing', level: 2, parentId: 'platforms', aliases: ['short read sequencing'] },
          { id: 'pacbio', label: 'PacBio Sequencing', level: 2, parentId: 'platforms', aliases: ['long read sequencing', 'SMRT'] },
          { id: 'nanopore', label: 'Oxford Nanopore', level: 2, parentId: 'platforms', aliases: ['nanopore sequencing', 'ONT'] },
          { id: 'sanger', label: 'Sanger Sequencing', level: 2, parentId: 'platforms', aliases: ['capillary sequencing'] }
        ]
      },
      {
        id: 'computational',
        label: 'Computational Infrastructure',
        icon: '💻',
        level: 1,
        parentId: 'technology',
        children: [
          { id: 'hpc', label: 'High Performance Computing', level: 2, parentId: 'computational', aliases: ['HPC', 'cluster computing'] },
          { id: 'cloud', label: 'Cloud Computing', level: 2, parentId: 'computational', aliases: ['AWS', 'cloud platforms'] },
          { id: 'workflows', label: 'Workflow Management', level: 2, parentId: 'computational', aliases: ['nextflow', 'snakemake', 'WDL'] },
          { id: 'containers', label: 'Containerization', level: 2, parentId: 'computational', aliases: ['docker', 'singularity'] }
        ]
      }
    ]
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: '🎯',
    color: '#f59e0b', // Orange
    description: 'Applied genomics in various domains',
    children: [
      {
        id: 'medical',
        label: 'Medical Genomics',
        icon: '🏥',
        level: 1,
        parentId: 'applications',
        children: [
          { id: 'cancer', label: 'Cancer Genomics', level: 2, parentId: 'medical', aliases: ['oncogenomics', 'tumor genomics'] },
          { id: 'clinical', label: 'Clinical Genomics', level: 2, parentId: 'medical', aliases: ['diagnostic genomics', 'precision medicine'] },
          { id: 'pharmacogenomics', label: 'Pharmacogenomics', level: 2, parentId: 'medical', aliases: ['drug response', 'pharmacogenetics'] },
          { id: 'rare-disease', label: 'Rare Disease Genomics', level: 2, parentId: 'medical', aliases: ['mendelian disorders'] }
        ]
      },
      {
        id: 'agricultural',
        label: 'Agricultural Genomics',
        icon: '🌾',
        level: 1,
        parentId: 'applications',
        children: [
          { id: 'crop-improvement', label: 'Crop Improvement', level: 2, parentId: 'agricultural', aliases: ['plant breeding', 'crop genomics'] },
          { id: 'qtl-mapping', label: 'QTL Mapping', level: 2, parentId: 'agricultural', aliases: ['quantitative trait loci', 'trait mapping'] },
          { id: 'disease-resistance', label: 'Disease Resistance', level: 2, parentId: 'agricultural', aliases: ['pathogen resistance'] }
        ]
      },
      {
        id: 'conservation',
        label: 'Conservation Genomics',
        icon: '🌍',
        level: 1,
        parentId: 'applications',
        children: [
          { id: 'population-monitoring', label: 'Population Monitoring', level: 2, parentId: 'conservation', aliases: ['wildlife monitoring'] },
          { id: 'species-management', label: 'Species Management', level: 2, parentId: 'conservation', aliases: ['breeding programs'] },
          { id: 'biodiversity', label: 'Biodiversity Assessment', level: 2, parentId: 'conservation', aliases: ['ecosystem genomics'] }
        ]
      },
      {
        id: 'evolutionary',
        label: 'Evolutionary Genomics',
        icon: '🌳',
        level: 1,
        parentId: 'applications',
        children: [
          { id: 'comparative-genomics', label: 'Comparative Genomics', level: 2, parentId: 'evolutionary', aliases: ['genome comparison', 'synteny'] },
          { id: 'molecular-evolution', label: 'Molecular Evolution', level: 2, parentId: 'evolutionary', aliases: ['sequence evolution'] },
          { id: 'speciation', label: 'Speciation Genomics', level: 2, parentId: 'evolutionary', aliases: ['reproductive isolation'] }
        ]
      }
    ]
  }
];

// Utility functions for working with the taxonomy
export function flattenTaxonomy(categories: TaxonomyCategory[]): TaxonomyNode[] {
  const flattened: TaxonomyNode[] = [];
  
  function traverse(nodes: TaxonomyNode[]) {
    for (const node of nodes) {
      flattened.push(node);
      if (node.children) {
        traverse(node.children);
      }
    }
  }
  
  for (const category of categories) {
    // Add category as a node
    flattened.push({
      id: category.id,
      label: category.label,
      icon: category.icon,
      description: category.description,
      level: 0,
      children: category.children
    });
    traverse(category.children);
  }
  
  return flattened;
}

export function findNodeById(categories: TaxonomyCategory[], id: string): TaxonomyNode | undefined {
  const flattened = flattenTaxonomy(categories);
  return flattened.find(node => node.id === id);
}

export function findNodesByText(categories: TaxonomyCategory[], searchText: string): TaxonomyNode[] {
  const flattened = flattenTaxonomy(categories);
  const searchLower = searchText.toLowerCase();
  
  return flattened.filter(node => {
    // Search in label
    if (node.label.toLowerCase().includes(searchLower)) return true;
    
    // Search in aliases
    if (node.aliases?.some(alias => alias.toLowerCase().includes(searchLower))) return true;
    
    // Search in description
    if (node.description?.toLowerCase().includes(searchLower)) return true;
    
    return false;
  });
}

export function getChildNodes(categories: TaxonomyCategory[], parentId: string): TaxonomyNode[] {
  const parent = findNodeById(categories, parentId);
  return parent?.children || [];
}

export function getNodePath(categories: TaxonomyCategory[], nodeId: string): TaxonomyNode[] {
  const path: TaxonomyNode[] = [];
  const flattened = flattenTaxonomy(categories);
  
  let currentNode = flattened.find(node => node.id === nodeId);
  
  while (currentNode) {
    path.unshift(currentNode);
    currentNode = flattened.find(node => node.id === currentNode?.parentId);
  }
  
  return path;
}

// Map existing expertise terms to taxonomy nodes
export function mapExpertiseToTaxonomy(expertise: string[]): string[] {
  const flattened = flattenTaxonomy(EXPERTISE_TAXONOMY);
  const mappedIds: string[] = [];
  
  for (const term of expertise) {
    const termLower = term.toLowerCase();
    
    // Find matching nodes
    const matches = flattened.filter(node => {
      // Direct label match
      if (node.label.toLowerCase() === termLower) return true;
      
      // Alias match
      if (node.aliases?.some(alias => alias.toLowerCase() === termLower)) return true;
      
      // Partial match in label
      if (node.label.toLowerCase().includes(termLower) && termLower.length > 3) return true;
      
      return false;
    });
    
    // Add the most specific match (highest level number)
    if (matches.length > 0) {
      const bestMatch = matches.reduce((best, current) => 
        current.level > best.level ? current : best
      );
      mappedIds.push(bestMatch.id);
    }
  }
  
  return [...new Set(mappedIds)]; // Remove duplicates
}
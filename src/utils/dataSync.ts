/**
 * Data Synchronization Utilities for Evomics Ecosystem
 * 
 * This module provides functions to synchronize data between the faculty site
 * and workshop site, ensuring consistency across the ecosystem.
 */

export interface SyncConfig {
  facultySiteDataPath: string;
  workshopSiteDataPath: string;
  backupBeforeSync: boolean;
}

export interface SyncResult {
  success: boolean;
  message: string;
  changes: string[];
  timestamp: string;
}

// Default configuration for data sync
export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  facultySiteDataPath: '/Users/scotthandley/Code/evomics-faculty/faculty-app/src/data',
  workshopSiteDataPath: '/Users/scotthandley/Code/evomics-faculty/evomics-workshops/src/data',
  backupBeforeSync: true
};

/**
 * Synchronize faculty profile data between sites
 */
export async function syncFacultyProfiles(config: SyncConfig = DEFAULT_SYNC_CONFIG): Promise<SyncResult> {
  const timestamp = new Date().toISOString();
  const changes: string[] = [];

  try {
    // Load data from both sites
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Load faculty data from faculty site
    const facultyDataPath = path.join(config.facultySiteDataPath, 'facultyEnriched.json');
    const facultyData = JSON.parse(await fs.readFile(facultyDataPath, 'utf-8'));
    
    // Load workshop data to extract teaching history
    const { processPresenterProfiles } = await import('./presenterProcessor');
    const workshopDataPath = path.join(config.workshopSiteDataPath, 'workshops');
    
    // Load all workshop schedule files
    const workshopFiles = await fs.readdir(workshopDataPath);
    const allWorkshopData: { [key: string]: any[] } = {};
    
    for (const file of workshopFiles) {
      if (file.endsWith('.json')) {
        const workshopId = file.replace('.json', '');
        const filePath = path.join(workshopDataPath, file);
        allWorkshopData[workshopId] = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      }
    }
    
    // Process presenter profiles to get teaching statistics
    const presenterProfiles = processPresenterProfiles(allWorkshopData);
    
    // Merge teaching data with faculty profiles
    let updatedProfiles = 0;
    for (const [facultyId, facultyProfile] of Object.entries(facultyData)) {
      const faculty = facultyProfile as any;
      const presenterProfile = Object.values(presenterProfiles).find(
        (p: any) => p.name.toLowerCase() === faculty.name.toLowerCase()
      );
      
      if (presenterProfile) {
        // Update teaching statistics
        faculty.teaching = (presenterProfile as any).teaching;
        faculty.lastTeachingSync = timestamp;
        updatedProfiles++;
      }
    }
    
    // Write updated faculty data back
    await fs.writeFile(facultyDataPath, JSON.stringify(facultyData, null, 2));
    changes.push(`Updated teaching history for ${updatedProfiles} faculty profiles`);
    
    // Copy synchronized data to workshop site for presenter enrichment
    const workshopFacultyPath = path.join(config.workshopSiteDataPath, 'facultyEnriched.json');
    await fs.writeFile(workshopFacultyPath, JSON.stringify(facultyData, null, 2));
    changes.push('Synchronized faculty data to workshop site');

    return {
      success: true,
      message: 'Faculty profiles synchronized successfully',
      changes,
      timestamp
    };
  } catch (error) {
    return {
      success: false,
      message: `Sync failed: ${error}`,
      changes,
      timestamp
    };
  }
}

/**
 * Synchronize workshop participation data
 */
export async function syncWorkshopParticipation(config: SyncConfig = DEFAULT_SYNC_CONFIG): Promise<SyncResult> {
  const timestamp = new Date().toISOString();
  const changes: string[] = [];

  try {
    // Load workshop participation data from workshop site
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const workshopDataPath = path.join(config.workshopSiteDataPath, 'workshops');
    const workshopFiles = await fs.readdir(workshopDataPath);
    
    // Build comprehensive participation record
    const participationData: { [facultyName: string]: {
      workshops: string[];
      sessions: number;
      years: number[];
      topics: string[];
      lastUpdated: string;
    }} = {};
    
    for (const file of workshopFiles) {
      if (file.endsWith('.json')) {
        const workshopId = file.replace('.json', '');
        const filePath = path.join(workshopDataPath, file);
        const schedules = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        
        for (const schedule of schedules) {
          for (const week of schedule.weeks) {
            for (const session of week.sessions) {
              const allPresenters = [
                ...session.presenters,
                ...(session.coPresenters || [])
              ];
              
              for (const presenter of allPresenters) {
                if (!participationData[presenter]) {
                  participationData[presenter] = {
                    workshops: [],
                    sessions: 0,
                    years: [],
                    topics: [],
                    lastUpdated: timestamp
                  };
                }
                
                const data = participationData[presenter];
                if (!data.workshops.includes(workshopId)) {
                  data.workshops.push(workshopId);
                }
                data.sessions++;
                if (!data.years.includes(schedule.year)) {
                  data.years.push(schedule.year);
                }
                if (session.topic && !data.topics.includes(session.topic)) {
                  data.topics.push(session.topic);
                }
              }
            }
          }
        }
      }
    }
    
    // Write participation summary
    const participationPath = path.join(config.workshopSiteDataPath, 'participationSummary.json');
    await fs.writeFile(participationPath, JSON.stringify(participationData, null, 2));
    changes.push(`Generated participation summary for ${Object.keys(participationData).length} presenters`);
    
    // Update faculty site with participation data
    const facultyDataPath = path.join(config.facultySiteDataPath, 'facultyEnriched.json');
    const facultyData = JSON.parse(await fs.readFile(facultyDataPath, 'utf-8'));
    
    let updatedFaculty = 0;
    for (const [facultyId, facultyProfile] of Object.entries(facultyData)) {
      const faculty = facultyProfile as any;
      const participation = participationData[faculty.name];
      
      if (participation) {
        faculty.workshopParticipation = participation;
        updatedFaculty++;
      }
    }
    
    await fs.writeFile(facultyDataPath, JSON.stringify(facultyData, null, 2));
    changes.push(`Updated workshop participation for ${updatedFaculty} faculty members`);

    return {
      success: true,
      message: 'Workshop participation synchronized successfully',
      changes,
      timestamp
    };
  } catch (error) {
    return {
      success: false,
      message: `Sync failed: ${error}`,
      changes,
      timestamp
    };
  }
}

/**
 * Synchronize expertise taxonomies
 */
export async function syncExpertiseTaxonomies(config: SyncConfig = DEFAULT_SYNC_CONFIG): Promise<SyncResult> {
  const timestamp = new Date().toISOString();
  const changes: string[] = [];

  try {
    // Load both taxonomy systems
    const { createUnifiedTaxonomy } = await import('./taxonomySync');
    const unifiedTaxonomy = createUnifiedTaxonomy();
    
    // Write unified taxonomy to both sites
    const fs = await import('fs/promises');
    
    // Save to workshop site
    const workshopTaxonomyPath = `${config.workshopSiteDataPath}/unifiedTaxonomy.json`;
    await fs.writeFile(workshopTaxonomyPath, JSON.stringify(unifiedTaxonomy, null, 2));
    changes.push('Updated workshop site taxonomy with unified structure');
    
    // Save to faculty site
    const facultyTaxonomyPath = `${config.facultySiteDataPath}/taxonomy/unifiedTaxonomy.json`;
    await fs.writeFile(facultyTaxonomyPath, JSON.stringify(unifiedTaxonomy, null, 2));
    changes.push('Updated faculty site taxonomy with unified structure');
    
    // Generate mapping file for backwards compatibility
    const mappingData = {
      workshopToUnified: unifiedTaxonomy.workshopMappings,
      facultyToUnified: unifiedTaxonomy.facultyMappings,
      lastSync: timestamp
    };
    
    const mappingPath = `${config.workshopSiteDataPath}/taxonomyMappings.json`;
    await fs.writeFile(mappingPath, JSON.stringify(mappingData, null, 2));
    changes.push('Generated taxonomy mapping file for cross-site compatibility');

    return {
      success: true,
      message: 'Expertise taxonomies synchronized successfully',
      changes,
      timestamp
    };
  } catch (error) {
    return {
      success: false,
      message: `Sync failed: ${error}`,
      changes,
      timestamp
    };
  }
}

/**
 * Run complete data synchronization across all systems
 */
export async function runCompleteSync(config: SyncConfig = DEFAULT_SYNC_CONFIG): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  // Run all sync operations
  results.push(await syncFacultyProfiles(config));
  results.push(await syncWorkshopParticipation(config));
  results.push(await syncExpertiseTaxonomies(config));

  return results;
}

/**
 * Cross-site search functionality
 */
export interface UniversalSearchResult {
  site: 'faculty' | 'workshops' | 'students';
  type: 'faculty' | 'session' | 'student' | 'expertise';
  title: string;
  description: string;
  url: string;
  relevance: number;
}

/**
 * Perform universal search across all Evomics sites
 */
export async function performUniversalSearch(query: string): Promise<UniversalSearchResult[]> {
  const results: UniversalSearchResult[] = [];
  const queryLower = query.toLowerCase();

  try {
    // Load synchronized data for enhanced search
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Search faculty profiles
    try {
      const facultyDataPath = path.join(__dirname, '../data/facultyEnriched.json');
      const facultyData = JSON.parse(await fs.readFile(facultyDataPath, 'utf-8'));
      
      const matchingFaculty = Object.values(facultyData).filter((faculty: any) => {
        return faculty.name.toLowerCase().includes(queryLower) ||
               faculty.enrichment?.academic?.researchAreas?.raw?.some((area: string) => 
                 area.toLowerCase().includes(queryLower)
               ) ||
               faculty.enrichment?.professional?.affiliation?.toLowerCase().includes(queryLower);
      });
      
      if (matchingFaculty.length > 0) {
        results.push({
          site: 'faculty',
          type: 'faculty',
          title: `${matchingFaculty.length} faculty member${matchingFaculty.length === 1 ? '' : 's'} matching "${query}"`,
          description: `Found matches in names, research areas, and affiliations`,
          url: `https://shandley.github.io/evomics-faculty/?search=${encodeURIComponent(query)}`,
          relevance: 0.9
        });
      }
    } catch (error) {
      // Fallback to basic faculty search
      results.push({
        site: 'faculty',
        type: 'faculty',
        title: `Faculty matching "${query}"`,
        description: 'Faculty profiles and teaching histories',
        url: `https://shandley.github.io/evomics-faculty/?search=${encodeURIComponent(query)}`,
        relevance: 0.9
      });
    }

    // Search workshop sessions and topics
    try {
      const workshopDataPath = path.join(__dirname, '../data/workshops');
      const workshopFiles = await fs.readdir(workshopDataPath);
      let sessionMatches = 0;
      let topicMatches = 0;
      
      for (const file of workshopFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(workshopDataPath, file);
          const schedules = JSON.parse(await fs.readFile(filePath, 'utf-8'));
          
          for (const schedule of schedules) {
            for (const week of schedule.weeks) {
              for (const session of week.sessions) {
                if (session.title.toLowerCase().includes(queryLower) ||
                    session.topic?.toLowerCase().includes(queryLower) ||
                    session.presenters.some((p: string) => p.toLowerCase().includes(queryLower))) {
                  sessionMatches++;
                }
                if (session.topic?.toLowerCase().includes(queryLower)) {
                  topicMatches++;
                }
              }
            }
          }
        }
      }
      
      if (sessionMatches > 0) {
        results.push({
          site: 'workshops',
          type: 'session',
          title: `${sessionMatches} workshop session${sessionMatches === 1 ? '' : 's'} on "${query}"`,
          description: `Found matches in session titles, topics, and presenters`,
          url: `https://shandley.github.io/evomics-workshops/search?q=${encodeURIComponent(query)}`,
          relevance: 0.8
        });
      }
      
      if (topicMatches > 0) {
        results.push({
          site: 'workshops',
          type: 'expertise',
          title: `${topicMatches} topic${topicMatches === 1 ? '' : 's'} related to "${query}"`,
          description: `Browse sessions by topic and expertise area`,
          url: `https://shandley.github.io/evomics-workshops/topics?filter=${encodeURIComponent(query)}`,
          relevance: 0.7
        });
      }
    } catch (error) {
      // Fallback to basic workshop search
      results.push({
        site: 'workshops',
        type: 'session',
        title: `Workshop sessions on "${query}"`,
        description: 'Teaching sessions and workshop content',
        url: `https://shandley.github.io/evomics-workshops/search?q=${encodeURIComponent(query)}`,
        relevance: 0.8
      });
    }

    // Search unified taxonomy
    try {
      const { createUnifiedTaxonomy, searchUnifiedNodes } = await import('./taxonomySync');
      const taxonomy = await createUnifiedTaxonomy();
      const taxonomyMatches = searchUnifiedNodes(taxonomy, query);
      
      if (taxonomyMatches.length > 0) {
        results.push({
          site: 'workshops',
          type: 'expertise',
          title: `${taxonomyMatches.length} expertise area${taxonomyMatches.length === 1 ? '' : 's'} matching "${query}"`,
          description: `Browse content by research area and methodology`,
          url: `https://shandley.github.io/evomics-workshops/expertise?area=${encodeURIComponent(query)}`,
          relevance: 0.6
        });
      }
    } catch (error) {
      // Taxonomy search failed, continue without it
    }

    // Search student site
    results.push({
      site: 'students',
      type: 'student',
      title: `Student resources for "${query}"`,
      description: 'Student programs and educational content',
      url: `https://shandley.github.io/evomics-students/?search=${encodeURIComponent(query)}`,
      relevance: 0.5
    });

  } catch (error) {
    console.error('Universal search error:', error);
    // Return basic search results as fallback
    results.push(
      {
        site: 'faculty',
        type: 'faculty',
        title: `Faculty matching "${query}"`,
        description: 'Faculty profiles and teaching histories',
        url: `https://shandley.github.io/evomics-faculty/?search=${encodeURIComponent(query)}`,
        relevance: 0.9
      },
      {
        site: 'workshops',
        type: 'session',
        title: `Workshop sessions on "${query}"`,
        description: 'Teaching sessions and workshop content',
        url: `https://shandley.github.io/evomics-workshops/search?q=${encodeURIComponent(query)}`,
        relevance: 0.8
      }
    );
  }

  return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Cross-site navigation utilities
 */
export interface NavigationContext {
  currentSite: 'faculty' | 'workshops' | 'students';
  currentPath: string;
  searchQuery?: string;
  facultyId?: string;
  sessionId?: string;
}

/**
 * Generate contextual navigation URLs between sites
 */
export function generateCrossNavigationUrl(
  targetSite: 'faculty' | 'workshops' | 'students',
  context: NavigationContext
): string {
  const baseUrls = {
    faculty: 'https://shandley.github.io/evomics-faculty/',
    workshops: 'https://shandley.github.io/evomics-workshops/',
    students: 'https://shandley.github.io/evomics-students/'
  };

  let url = baseUrls[targetSite];

  // Add contextual parameters
  const params = new URLSearchParams();
  
  if (context.searchQuery) {
    params.set('search', context.searchQuery);
  }

  if (context.facultyId && targetSite === 'faculty') {
    // Navigate to specific faculty profile
    params.set('faculty', context.facultyId);
  }

  if (context.sessionId && targetSite === 'workshops') {
    // Navigate to specific session
    url += `sessions/${context.sessionId}`;
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  return url;
}

export default {
  syncFacultyProfiles,
  syncWorkshopParticipation,
  syncExpertiseTaxonomies,
  runCompleteSync,
  performUniversalSearch,
  generateCrossNavigationUrl
};
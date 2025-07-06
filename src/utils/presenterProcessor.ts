import type { 
  PresenterProfile, 
  PresenterDirectory, 
  WorkshopSchedule, 
  PresenterTeachingStats,
  PresenterEnrichment,
  StandardizedTopic
} from '../types';
import facultyData from '../data/facultyEnriched.json';

// Helper function to normalize presenter names for matching
function normalizePresenterName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Create presenter ID from name
function createPresenterId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}

// Find faculty match for presenter
function findFacultyMatch(presenterName: string): any | null {
  const normalizedPresenter = normalizePresenterName(presenterName);
  
  // Try exact name match first
  for (const [facultyId, faculty] of Object.entries(facultyData)) {
    const facultyName = (faculty as any).name;
    if (normalizePresenterName(facultyName) === normalizedPresenter) {
      return { id: facultyId, ...faculty };
    }
  }
  
  // Try partial matches (first name + last name)
  const presenterParts = normalizedPresenter.split(' ');
  if (presenterParts.length >= 2) {
    const firstName = presenterParts[0];
    const lastName = presenterParts[presenterParts.length - 1];
    
    for (const [facultyId, faculty] of Object.entries(facultyData)) {
      const facultyName = normalizePresenterName((faculty as any).name);
      const facultyParts = facultyName.split(' ');
      
      if (facultyParts.length >= 2) {
        const facultyFirst = facultyParts[0];
        const facultyLast = facultyParts[facultyParts.length - 1];
        
        if (firstName === facultyFirst && lastName === facultyLast) {
          return { id: facultyId, ...faculty };
        }
      }
    }
  }
  
  return null;
}

// Calculate teaching statistics from workshop data
function calculateTeachingStats(
  presenterName: string, 
  allWorkshopData: { [key: string]: WorkshopSchedule[] }
): PresenterTeachingStats {
  const normalizedPresenter = normalizePresenterName(presenterName);
  let totalSessions = 0;
  const workshopsParticipated: string[] = [];
  const yearsActive: number[] = [];
  const sessionsByWorkshop: { [workshopId: string]: number } = {};
  const sessionsByYear: { [year: string]: number } = {};
  const topics: string[] = [];

  // Iterate through all workshop data
  for (const [workshopId, schedules] of Object.entries(allWorkshopData)) {
    let workshopSessionCount = 0;
    
    for (const schedule of schedules) {
      const year = schedule.year;
      let yearSessionCount = 0;
      
      for (const week of schedule.weeks) {
        for (const session of week.sessions) {
          // Check if presenter is in this session
          const sessionPresenters = session.presenters.map(p => normalizePresenterName(p));
          const coPresentersList = session.coPresenters || [];
          const allSessionPresenters = [
            ...sessionPresenters,
            ...coPresentersList.map(p => normalizePresenterName(p))
          ];
          
          if (allSessionPresenters.includes(normalizedPresenter)) {
            totalSessions++;
            workshopSessionCount++;
            yearSessionCount++;
            
            // Track topics
            if (session.topic && !topics.includes(session.topic)) {
              topics.push(session.topic);
            }
          }
        }
      }
      
      if (yearSessionCount > 0) {
        yearsActive.push(year);
        sessionsByYear[year.toString()] = (sessionsByYear[year.toString()] || 0) + yearSessionCount;
      }
    }
    
    if (workshopSessionCount > 0) {
      workshopsParticipated.push(workshopId);
      sessionsByWorkshop[workshopId] = workshopSessionCount;
    }
  }

  const uniqueYears = [...new Set(yearsActive)].sort();
  const currentYear = new Date().getFullYear();
  const recentActivity = uniqueYears.some(year => currentYear - year <= 3);

  return {
    totalSessions,
    workshopsParticipated,
    yearsActive: uniqueYears,
    recentActivity,
    sessionsByWorkshop,
    sessionsByYear,
    firstTaught: uniqueYears.length > 0 ? Math.min(...uniqueYears) : 0,
    lastTaught: uniqueYears.length > 0 ? Math.max(...uniqueYears) : 0,
    primaryTopics: topics.slice(0, 10) // Top 10 most common topics
  };
}

// Extract expertise from faculty enrichment data
function extractExpertise(facultyMatch: any): {
  primaryAreas: string[];
  techniques: string[];
  workshopSpecializations: string[];
} {
  const primaryAreas: string[] = [];
  const techniques: string[] = [];
  const workshopSpecializations: string[] = [];

  if (facultyMatch?.enrichment?.academic?.researchAreas) {
    const researchAreas = facultyMatch.enrichment.academic.researchAreas;
    
    // Extract primary research areas
    if (researchAreas.raw) {
      primaryAreas.push(...researchAreas.raw.slice(0, 5));
    }
    
    // Extract standardized topics
    if (researchAreas.standardized?.primary) {
      const standardizedAreas = researchAreas.standardized.primary
        .map((topic: StandardizedTopic) => topic.label)
        .slice(0, 3);
      primaryAreas.push(...standardizedAreas);
    }
    
    // Extract techniques from raw research areas
    const technicalTerms = researchAreas.raw?.filter((term: string) => 
      term.toLowerCase().includes('seq') ||
      term.toLowerCase().includes('analysis') ||
      term.toLowerCase().includes('assembly') ||
      term.toLowerCase().includes('alignment') ||
      term.toLowerCase().includes('tree') ||
      term.toLowerCase().includes('blast') ||
      term.toLowerCase().includes('pipeline')
    ) || [];
    
    techniques.push(...technicalTerms.slice(0, 5));
  }

  return {
    primaryAreas: [...new Set(primaryAreas)],
    techniques: [...new Set(techniques)],
    workshopSpecializations // Will be filled from session topics
  };
}

// Process all workshop data to create presenter directory
export function processPresenterProfiles(
  allWorkshopData: { [key: string]: WorkshopSchedule[] }
): PresenterDirectory {
  const presenterMap = new Map<string, PresenterProfile>();
  
  // Collect all unique presenters
  const allPresenters = new Set<string>();
  
  for (const schedules of Object.values(allWorkshopData)) {
    for (const schedule of schedules) {
      for (const week of schedule.weeks) {
        for (const session of week.sessions) {
          session.presenters.forEach(presenter => allPresenters.add(presenter));
          if (session.coPresenters) {
            session.coPresenters.forEach(presenter => allPresenters.add(presenter));
          }
        }
      }
    }
  }

  // Process each presenter
  for (const presenterName of allPresenters) {
    const presenterId = createPresenterId(presenterName);
    const facultyMatch = findFacultyMatch(presenterName);
    const teachingStats = calculateTeachingStats(presenterName, allWorkshopData);
    const expertise = extractExpertise(facultyMatch);
    
    // Add workshop specializations based on session topics
    expertise.workshopSpecializations = teachingStats.primaryTopics.slice(0, 5);

    const profile: PresenterProfile = {
      id: presenterId,
      name: presenterName,
      displayName: presenterName,
      enrichment: facultyMatch?.enrichment as PresenterEnrichment,
      teaching: teachingStats,
      expertise
    };

    presenterMap.set(presenterId, profile);
  }

  return Object.fromEntries(presenterMap);
}

// Get presenter profile by name
export function getPresenterProfile(
  presenterName: string, 
  presenterDirectory: PresenterDirectory
): PresenterProfile | null {
  const presenterId = createPresenterId(presenterName);
  return presenterDirectory[presenterId] || null;
}

// Search presenters by expertise area
export function searchPresentersByExpertise(
  expertiseArea: string,
  presenterDirectory: PresenterDirectory
): PresenterProfile[] {
  const searchTerm = expertiseArea.toLowerCase();
  
  return Object.values(presenterDirectory).filter(presenter => {
    const allAreas = [
      ...presenter.expertise.primaryAreas,
      ...presenter.expertise.techniques,
      ...presenter.expertise.workshopSpecializations
    ].map(area => area.toLowerCase());
    
    return allAreas.some(area => area.includes(searchTerm));
  });
}

// Get related presenters (similar expertise)
export function getRelatedPresenters(
  presenter: PresenterProfile,
  presenterDirectory: PresenterDirectory,
  limit: number = 5
): PresenterProfile[] {
  const currentExpertise = [
    ...presenter.expertise.primaryAreas,
    ...presenter.expertise.techniques
  ].map(area => area.toLowerCase());

  const related = Object.values(presenterDirectory)
    .filter(p => p.id !== presenter.id)
    .map(p => {
      const otherExpertise = [
        ...p.expertise.primaryAreas,
        ...p.expertise.techniques
      ].map(area => area.toLowerCase());
      
      const overlap = currentExpertise.filter(area => 
        otherExpertise.some(other => other.includes(area) || area.includes(other))
      ).length;
      
      return { presenter: p, score: overlap };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.presenter);

  return related;
}
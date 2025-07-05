// Workshop ID mapping utility to handle case inconsistencies

export const WORKSHOP_ID_MAP = {
  // Uppercase to lowercase mapping (teaching data -> workshop definitions)
  'WoG': 'wog',
  'WPSG': 'wpsg', 
  'WPhylo': 'wphylo',
  'WMolEvo': 'wmolevo',
  'HTranscript': 'htranscriptomics',
  'HMicrobial': 'hmicrobial'
};

export const REVERSE_WORKSHOP_ID_MAP = {
  // Lowercase to uppercase mapping (workshop definitions -> teaching data)
  'wog': 'WoG',
  'wpsg': 'WPSG',
  'wphylo': 'WPhylo', 
  'wmolevo': 'WMolEvo',
  'htranscriptomics': 'HTranscript',
  'hmicrobial': 'HMicrobial'
};

export function normalizeWorkshopId(id) {
  // Convert to lowercase standard
  return WORKSHOP_ID_MAP[id] || id.toLowerCase();
}

export function getTeachingWorkshopId(id) {
  // Convert to teaching data format (uppercase)
  return REVERSE_WORKSHOP_ID_MAP[id] || id;
}
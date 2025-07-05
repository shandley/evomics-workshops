// Faculty ID to name conversion utility

export function convertFacultyIdToName(facultyId) {
  // Convert "paris-josephine" to "Josephine Paris"
  if (!facultyId || typeof facultyId !== 'string') {
    return facultyId;
  }
  
  // Split by hyphen and reverse, then capitalize first letter of each part
  const parts = facultyId.split('-');
  if (parts.length >= 2) {
    const lastName = parts[0];
    const firstName = parts[1];
    
    // Capitalize first letter of each name part
    const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    
    return `${capitalizeFirst(firstName)} ${capitalizeFirst(lastName)}`;
  }
  
  // If not in expected format, return as-is but capitalized
  return facultyId.charAt(0).toUpperCase() + facultyId.slice(1).toLowerCase();
}

export function getFacultyProfileUrl(facultyId) {
  const searchName = convertFacultyIdToName(facultyId);
  return `https://shandley.github.io/evomics-faculty/?search=${encodeURIComponent(searchName)}`;
}
import React from 'react';
import type { PresenterProfile } from '../types';

interface PresenterModalProps {
  presenter: PresenterProfile | null;
  isOpen: boolean;
  onClose: () => void;
  relatedPresenters?: PresenterProfile[];
  onViewRelated?: (presenter: PresenterProfile) => void;
}

export function PresenterModal({ 
  presenter, 
  isOpen, 
  onClose, 
  relatedPresenters = [],
  onViewRelated 
}: PresenterModalProps) {
  if (!isOpen || !presenter) return null;

  const hasEnrichment = !!presenter.enrichment;
  const professional = presenter.enrichment?.professional;
  const academic = presenter.enrichment?.academic;
  const orcid = academic?.orcid;
  
  const workshopNames: { [key: string]: string } = {
    'wog': 'Workshop on Genomics',
    'wpsg': 'Workshop on Population and Speciation Genomics',
    'wphylo': 'Workshop on Phylogenomics',
    'wmolevo': 'Workshop on Molecular Evolution',
    'htranscriptomics': 'Harvard Workshop on Transcriptomics',
    'hmicrobial': 'Harvard Workshop on Microbial Genomics'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{presenter.displayName}</h2>
              
              {hasEnrichment && professional?.title && (
                <p className="text-primary-100 text-lg mb-1">{professional.title}</p>
              )}
              
              {hasEnrichment && professional?.affiliation && (
                <div className="text-primary-200">
                  <p className="font-medium">{professional.affiliation}</p>
                  {professional.department && (
                    <p className="text-sm text-primary-300">{professional.department}</p>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="text-primary-200 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-primary-500 bg-opacity-50 rounded-lg p-3">
              <div className="text-2xl font-bold">{presenter.teaching.totalSessions}</div>
              <div className="text-sm text-primary-200">Total Sessions</div>
            </div>
            <div className="bg-primary-500 bg-opacity-50 rounded-lg p-3">
              <div className="text-2xl font-bold">{presenter.teaching.workshopsParticipated.length}</div>
              <div className="text-sm text-primary-200">Workshops</div>
            </div>
            <div className="bg-primary-500 bg-opacity-50 rounded-lg p-3">
              <div className="text-2xl font-bold">
                {presenter.teaching.lastTaught - presenter.teaching.firstTaught + 1}
              </div>
              <div className="text-sm text-primary-200">Years Active</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Research Areas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Research Expertise</h3>
                
                {presenter.expertise.primaryAreas.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {presenter.expertise.primaryAreas.map((area, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {presenter.expertise.techniques.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Techniques & Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {presenter.expertise.techniques.map((technique, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          {technique}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {presenter.expertise.workshopSpecializations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Workshop Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {presenter.expertise.workshopSpecializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* External Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">External Profiles</h3>
                <div className="space-y-2">
                  {orcid && (
                    <a
                      href={`https://orcid.org/${orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.946-.422-.946-.947 0-.525.421-.947.946-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.844-1.422 3.844-3.722 0-2.016-1.422-3.722-3.844-3.722h-2.297z"/>
                      </svg>
                      <span>ORCID Profile</span>
                    </a>
                  )}
                  
                  {hasEnrichment && (
                    <a
                      href={`https://shandley.github.io/evomics-faculty/?search=${encodeURIComponent(presenter.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Faculty Directory Profile</span>
                    </a>
                  )}

                  {professional?.labWebsite && (
                    <a
                      href={professional.labWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>Lab Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Teaching History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Teaching History</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Active Period:</span>
                      <div className="font-medium text-gray-900">
                        {presenter.teaching.firstTaught} - {presenter.teaching.lastTaught}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Status:</span>
                      <div className={`font-medium ${presenter.teaching.recentActivity ? 'text-green-600' : 'text-gray-500'}`}>
                        {presenter.teaching.recentActivity ? 'Recently Active' : 'Historical'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workshop breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Sessions by Workshop</h4>
                  {Object.entries(presenter.teaching.sessionsByWorkshop).map(([workshopId, count]) => (
                    <div key={workshopId} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-900">
                        {workshopNames[workshopId] || workshopId.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-600">{count} sessions</span>
                    </div>
                  ))}
                </div>

                {/* Years breakdown */}
                {Object.keys(presenter.teaching.sessionsByYear).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(presenter.teaching.sessionsByYear)
                        .sort(([a], [b]) => parseInt(b) - parseInt(a))
                        .slice(0, 6)
                        .map(([year, count]) => (
                          <div key={year} className="text-center py-1 bg-gray-100 rounded text-xs">
                            <div className="font-medium">{year}</div>
                            <div className="text-gray-600">{count} sessions</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Related Presenters */}
              {relatedPresenters.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Presenters</h3>
                  <div className="space-y-2">
                    {relatedPresenters.slice(0, 5).map((related) => (
                      <div
                        key={related.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {related.displayName}
                          </div>
                          {related.enrichment?.professional?.affiliation && (
                            <div className="text-sm text-gray-500 truncate">
                              {related.enrichment.professional.affiliation}
                            </div>
                          )}
                          <div className="text-xs text-blue-600">
                            {related.expertise.primaryAreas.slice(0, 2).join(', ')}
                          </div>
                        </div>
                        
                        {onViewRelated && (
                          <button
                            onClick={() => onViewRelated(related)}
                            className="ml-2 text-primary-600 hover:text-primary-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {hasEnrichment && presenter.enrichment?.lastUpdated && (
                <span>
                  Profile updated: {new Date(presenter.enrichment.lastUpdated).toLocaleDateString()}
                </span>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
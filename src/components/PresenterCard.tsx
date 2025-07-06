import React from 'react';
import type { PresenterProfile } from '../types';

interface PresenterCardProps {
  presenter: PresenterProfile;
  showTeachingStats?: boolean;
  onViewProfile?: (presenter: PresenterProfile) => void;
  compact?: boolean;
}

export function PresenterCard({ 
  presenter, 
  showTeachingStats = false, 
  onViewProfile,
  compact = false 
}: PresenterCardProps) {
  const hasEnrichment = !!presenter.enrichment;
  const affiliation = presenter.enrichment?.professional?.affiliation;
  const department = presenter.enrichment?.professional?.department;
  const title = presenter.enrichment?.professional?.title;
  const orcid = presenter.enrichment?.academic?.orcid;
  
  const primaryAreas = presenter.expertise.primaryAreas.slice(0, 3);
  const isRecent = presenter.teaching.recentActivity;

  return (
    <div className={`
      bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden
      hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1
      ${compact ? 'p-3' : 'p-4'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {presenter.displayName}
          </h3>
          
          {hasEnrichment && title && (
            <p className={`text-gray-600 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
              {title}
            </p>
          )}
          
          {hasEnrichment && affiliation && (
            <p className={`text-gray-500 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
              {affiliation}
              {department && !compact && (
                <span className="block text-xs text-gray-400 truncate">
                  {department}
                </span>
              )}
            </p>
          )}
        </div>
        
        {/* Activity indicator */}
        <div className="flex items-center space-x-2 ml-2">
          {isRecent && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          )}
          
          {orcid && (
            <a
              href={`https://orcid.org/${orcid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 transition-colors"
              title="ORCID Profile"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.946-.422-.946-.947 0-.525.421-.947.946-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.844-1.422 3.844-3.722 0-2.016-1.422-3.722-3.844-3.722h-2.297z"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Expertise tags */}
      {primaryAreas.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {primaryAreas.map((area, index) => (
              <span
                key={index}
                className={`
                  inline-flex items-center rounded-full bg-blue-50 text-blue-700 font-medium
                  ${compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'}
                `}
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Teaching statistics */}
      {showTeachingStats && !compact && (
        <div className="border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Sessions:</span>
              <span className="ml-1 font-medium text-gray-900">
                {presenter.teaching.totalSessions}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Workshops:</span>
              <span className="ml-1 font-medium text-gray-900">
                {presenter.teaching.workshopsParticipated.length}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Active:</span>
              <span className="ml-1 font-medium text-gray-900">
                {presenter.teaching.firstTaught}-{presenter.teaching.lastTaught}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Compact teaching info */}
      {compact && (
        <div className="text-xs text-gray-500">
          {presenter.teaching.totalSessions} sessions • {presenter.teaching.workshopsParticipated.length} workshops
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex space-x-2">
        {onViewProfile && (
          <button
            onClick={() => onViewProfile(presenter)}
            className={`
              flex-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 
              transition-colors font-medium
              ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            `}
          >
            View Profile
          </button>
        )}
        
        {hasEnrichment && affiliation && (
          <a
            href={`https://shandley.github.io/evomics-faculty/?search=${encodeURIComponent(presenter.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 
              transition-colors font-medium text-center
              ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            `}
          >
            Faculty Profile
          </a>
        )}
      </div>
    </div>
  );
}

interface PresenterListProps {
  presenters: PresenterProfile[];
  onViewProfile?: (presenter: PresenterProfile) => void;
  showTeachingStats?: boolean;
  compact?: boolean;
  emptyMessage?: string;
}

export function PresenterList({ 
  presenters, 
  onViewProfile, 
  showTeachingStats = false,
  compact = false,
  emptyMessage = "No presenters found"
}: PresenterListProps) {
  if (presenters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
      {presenters.map((presenter) => (
        <PresenterCard
          key={presenter.id}
          presenter={presenter}
          onViewProfile={onViewProfile}
          showTeachingStats={showTeachingStats}
          compact={compact}
        />
      ))}
    </div>
  );
}

interface PresenterBadgeProps {
  presenter: PresenterProfile;
  onViewProfile?: (presenter: PresenterProfile) => void;
  showExpertise?: boolean;
}

export function PresenterBadge({ presenter, onViewProfile, showExpertise = true }: PresenterBadgeProps) {
  const hasEnrichment = !!presenter.enrichment;
  const affiliation = presenter.enrichment?.professional?.affiliation;
  const primaryArea = presenter.expertise.primaryAreas[0];

  return (
    <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900 truncate">
            {presenter.displayName}
          </span>
          
          {hasEnrichment && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              ✓
            </span>
          )}
        </div>
        
        {affiliation && (
          <div className="text-xs text-gray-500 truncate">
            {affiliation}
          </div>
        )}
        
        {showExpertise && primaryArea && (
          <div className="text-xs text-blue-600 truncate">
            {primaryArea}
          </div>
        )}
      </div>

      {onViewProfile && (
        <button
          onClick={() => onViewProfile(presenter)}
          className="text-primary-600 hover:text-primary-700 transition-colors"
          title="View full profile"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}
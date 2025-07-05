import React, { useMemo } from 'react';
import { generateTimelineData, getWorkshops } from '../utils/dataProcessor';

const Timeline: React.FC = () => {
  const timelineData = useMemo(() => generateTimelineData(), []);
  const workshops = useMemo(() => getWorkshops(), []);

  const getWorkshopColor = (workshopId: string) => {
    const colors = {
      'wog': 'bg-blue-500',
      'wpsg': 'bg-green-500',
      'wphylo': 'bg-purple-500',
      'wmolevo': 'bg-orange-500',
      'htranscriptomics': 'bg-pink-500',
      'hmicrobial': 'bg-indigo-500',
    };
    return colors[workshopId as keyof typeof colors] || 'bg-gray-500';
  };

  const getWorkshopLightColor = (workshopId: string) => {
    const colors = {
      'wog': 'bg-blue-100 border-blue-300',
      'wpsg': 'bg-green-100 border-green-300',
      'wphylo': 'bg-purple-100 border-purple-300',
      'wmolevo': 'bg-orange-100 border-orange-300',
      'htranscriptomics': 'bg-pink-100 border-pink-300',
      'hmicrobial': 'bg-indigo-100 border-indigo-300',
    };
    return colors[workshopId as keyof typeof colors] || 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Workshop Timeline</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore the evolution of workshop curricula across {timelineData.length} years of genomics education.
        </p>
      </div>

      {/* Workshop Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Workshop Series</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(workshops).map(([id, workshop]) => (
            <div key={id} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${getWorkshopColor(id)}`}></div>
              <div>
                <span className="font-medium text-gray-900">{workshop.shortName}</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  workshop.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {workshop.active ? 'Active' : 'Historical'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {/* Timeline Events */}
        <div className="space-y-8">
          {timelineData.map((event, index) => (
            <div key={event.year} className="relative flex items-start">
              {/* Year Marker */}
              <div className="flex-shrink-0 w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="text-sm font-bold text-gray-700">{event.year}</span>
              </div>

              {/* Event Content */}
              <div className="ml-6 flex-1">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {event.year} Workshop Activities
                  </h3>

                  {/* Workshop Activities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(event.workshops).map(([workshopId, activity]) => (
                      <div 
                        key={workshopId} 
                        className={`border-2 rounded-lg p-4 ${getWorkshopLightColor(workshopId)}`}
                      >
                        <div className="flex items-center mb-3">
                          <div className={`w-3 h-3 rounded-full ${getWorkshopColor(workshopId)} mr-2`}></div>
                          <h4 className="font-semibold text-gray-900">
                            {workshops[workshopId]?.shortName || workshopId}
                          </h4>
                        </div>

                        <div className="space-y-2 text-sm text-gray-700">
                          <div className="flex justify-between">
                            <span>Sessions:</span>
                            <span className="font-medium">{activity.sessions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Presenters:</span>
                            <span className="font-medium">{activity.presenters.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Topics:</span>
                            <span className="font-medium">{activity.topics.length}</span>
                          </div>
                        </div>

                        {/* Top Topics */}
                        {activity.topics.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-xs font-medium text-gray-600 mb-1">Key Topics:</h5>
                            <div className="space-y-1">
                              {activity.topics.slice(0, 3).map((topic, i) => (
                                <div key={i} className="text-xs text-gray-600 truncate">
                                  • {topic}
                                </div>
                              ))}
                              {activity.topics.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{activity.topics.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Year Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {Object.values(event.workshops).reduce((sum, w) => sum + w.sessions, 0)}
                        </div>
                        <div className="text-gray-600">Total Sessions</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {Object.keys(event.workshops).length}
                        </div>
                        <div className="text-gray-600">Active Workshops</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {new Set(Object.values(event.workshops).flatMap(w => w.presenters)).size}
                        </div>
                        <div className="text-gray-600">Unique Presenters</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {new Set(Object.values(event.workshops).flatMap(w => w.topics)).size}
                        </div>
                        <div className="text-gray-600">Topics Covered</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{timelineData.length}</div>
            <div className="text-gray-600 font-medium">Years of Data</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {timelineData.reduce((sum, event) => sum + Object.values(event.workshops).reduce((s, w) => s + w.sessions, 0), 0)}
            </div>
            <div className="text-gray-600 font-medium">Total Sessions</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {new Set(timelineData.flatMap(event => 
                Object.values(event.workshops).flatMap(w => w.presenters)
              )).size}
            </div>
            <div className="text-gray-600 font-medium">Faculty Contributors</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {Object.keys(workshops).length}
            </div>
            <div className="text-gray-600 font-medium">Workshop Series</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
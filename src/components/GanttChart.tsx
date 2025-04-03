
import React, { useMemo } from "react";
import { GanttEvent, QueueEvent } from "@/types/scheduler";
import { cn } from "@/lib/utils";

interface GanttChartProps {
  ganttData: GanttEvent[];
  queueEvents: QueueEvent[];
  maxTime: number;
  cpuNames: string[];
  quantumTime: number;
}

const COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#f97316", // orange-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f59e0b", // amber-500
  "#6366f1", // indigo-500
  "#84cc16", // lime-500
];

const GanttChart: React.FC<GanttChartProps> = ({ 
  ganttData, 
  queueEvents, 
  maxTime, 
  cpuNames,
  quantumTime
}) => {
  // Create a mapping for job colors
  const jobColors = useMemo(() => {
    const uniqueJobs = [...new Set(ganttData.map(item => item.jobId))];
    return uniqueJobs.reduce((acc, jobId, index) => {
      acc[jobId] = COLORS[index % COLORS.length];
      return acc;
    }, {} as Record<string, string>);
  }, [ganttData]);
  
  // Calculate time markers
  const timeMarkers = useMemo(() => {
    const numMarkers = Math.ceil(maxTime) + 1;
    return Array.from({ length: numMarkers }, (_, i) => i);
  }, [maxTime]);

  // Calculate quantum time markers
  const quantumMarkers = useMemo(() => {
    const numMarkers = Math.ceil(maxTime / quantumTime) + 1;
    return Array.from({ length: numMarkers }, (_, i) => i * quantumTime);
  }, [maxTime, quantumTime]);

  return (
    <div className="mt-4">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 justify-center">
        {Object.entries(jobColors).map(([jobId, color]) => (
          <div key={jobId} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm font-medium">{jobId}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400"></div>
          <span className="text-sm font-medium">Quantum Time ({quantumTime})</span>
        </div>
      </div>
      
      {/* Gantt Chart */}
      <div className="relative overflow-x-auto border border-gray-200 rounded-md">
        {/* Timeline */}
        <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <div className="w-16 shrink-0 p-2 font-medium text-sm border-r border-gray-200">
            CPU
          </div>
          <div className="flex-1 relative">
            {timeMarkers.map(time => (
              <div 
                key={`marker-${time}`} 
                className="absolute top-0 bottom-0 border-l border-gray-200 flex flex-col items-center"
                style={{ left: `${(time / (maxTime + 1)) * 100}%` }}
              >
                <span className="px-1 text-xs text-gray-500">{time}</span>
              </div>
            ))}
            {/* Quantum time markers */}
            {quantumMarkers.map(time => (
              <div 
                key={`quantum-${time}`} 
                className="absolute top-0 bottom-0 border-l border-red-400 flex flex-col items-center"
                style={{ 
                  left: `${(time / (maxTime + 1)) * 100}%`,
                  borderLeftWidth: '2px',
                  zIndex: 5
                }}
              >
                <span className="px-1 text-xs text-red-500 font-medium">{time}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* CPU Rows */}
        {cpuNames.map(cpu => (
          <div key={cpu} className="flex border-b border-gray-200 h-12">
            <div className="w-16 shrink-0 p-2 font-medium text-sm border-r border-gray-200 flex items-center">
              {cpu}
            </div>
            <div className="flex-1 relative">
              {/* Quantum time markers on each row */}
              {quantumMarkers.map(time => (
                <div 
                  key={`row-quantum-${cpu}-${time}`} 
                  className="absolute top-0 bottom-0 border-l border-red-400 opacity-30"
                  style={{ 
                    left: `${(time / (maxTime + 1)) * 100}%`,
                    borderLeftWidth: '2px',
                    zIndex: 1
                  }}
                ></div>
              ))}
              
              {ganttData
                .filter(event => event.cpu === cpu)
                .map((event, index) => {
                  const leftPos = (event.startTime / (maxTime + 1)) * 100;
                  const width = (event.duration / (maxTime + 1)) * 100;
                  
                  return (
                    <div
                      key={`${event.cpu}-${event.startTime}-${index}`}
                      className="absolute h-8 top-2 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        left: `${leftPos}%`,
                        width: `${width}%`,
                        backgroundColor: jobColors[event.jobId],
                        minWidth: '20px',
                        zIndex: 2
                      }}
                      title={`${event.jobId}: Start ${event.startTime}, Duration ${event.duration}`}
                    >
                      {event.jobId}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Queue Visualization */}
      <div className="mt-8 mb-4">
        <h3 className="text-lg font-semibold mb-2">Queue Timeline</h3>
        <div className="relative overflow-x-auto border border-gray-200 rounded-md">
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-16 shrink-0 p-2 font-medium text-sm border-r border-gray-200">
              Time
            </div>
            <div className="flex-1 p-2 font-medium text-sm">
              Jobs in Queue (ID = Remaining Time)
            </div>
          </div>
          
          {queueEvents.map((event, index) => (
            <div key={`queue-${index}`} className="flex border-b border-gray-200">
              <div className="w-16 shrink-0 p-2 text-sm border-r border-gray-200">
                {event.time.toFixed(1)}
              </div>
              <div className="flex-1 p-2 flex flex-wrap gap-2">
                {event.jobs.map((job, jobIdx) => (
                  <div 
                    key={`${event.time}-${job.jobId}-${jobIdx}`}
                    className="px-2 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: jobColors[job.jobId] }}
                  >
                    {job.jobId}={job.remainingTime}
                  </div>
                ))}
                {event.jobs.length === 0 && (
                  <span className="text-xs text-gray-400">Empty</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;

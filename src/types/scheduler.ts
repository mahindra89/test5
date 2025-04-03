
export interface Job {
  id: string;
  arrivalTime: number;
  burstTime: number;
  startTime?: number;
  endTime?: number;
  turnaroundTime?: number;
}

export interface JobChunk {
  jobId: string;
  size: number;
}

export interface SchedulerConfig {
  numJobs: number;
  numCPUs: number;
  chunkUnit: number;
  quantumTime: number;
}

export interface GanttEvent {
  startTime: number;
  cpu: string;
  jobId: string;
  duration: number;
}

export interface QueueEvent {
  time: number;
  jobs: Array<{
    jobId: string;
    remainingTime: number;
  }>;
}

export interface SchedulerResults {
  jobs: Job[];
  ganttData: GanttEvent[];
  queueEvents: QueueEvent[];
  averageTurnaround: number;
}

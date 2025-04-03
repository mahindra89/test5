
import { Job, GanttEvent, QueueEvent, SchedulerResults } from "@/types/scheduler";

export const runSTRFScheduler = (
  jobs: Job[], 
  numCPUs: number, 
  chunkUnit: number,
  quantumTime: number
): SchedulerResults => {
  // Setup state
  const arrivalTime: Record<string, number> = {};
  const burstTime: Record<string, number> = {};
  const remainingTime: Record<string, number> = {};
  const startTime: Record<string, number> = {};
  const endTime: Record<string, number> = {};
  const jobChunks: Record<string, number[]> = {};

  // Initialize data from input jobs
  for (const job of jobs) {
    arrivalTime[job.id] = job.arrivalTime;
    burstTime[job.id] = job.burstTime;
    remainingTime[job.id] = job.burstTime;
  }

  // Break jobs into user-defined chunks
  for (const [jobId, totalTime] of Object.entries(burstTime)) {
    const chunks: number[] = [];
    let remaining = totalTime;
    while (remaining > 0) {
      const chunk = Math.min(chunkUnit, remaining);
      chunks.push(chunk);
      remaining -= chunk;
    }
    jobChunks[jobId] = chunks;
  }

  // CPU setup
  const cpuNames = Array.from({ length: numCPUs }, (_, i) => `CPU${i+1}`);
  const busyUntil: Record<string, number> = {};
  const currentJobs: Record<string, string | null> = {};
  cpuNames.forEach(cpu => {
    busyUntil[cpu] = 0;
    currentJobs[cpu] = null;
  });
  const busyJobs = new Set<string>();

  // Simulation state
  const ganttData: GanttEvent[] = [];
  const queueEvents: QueueEvent[] = [];
  let currentTime = 0;
  let jobsCompleted = 0;
  let nextSchedulingTime = 0; // Track when the next scheduling decision can be made

  // Capture queue state at each scheduling point
  const captureQueueState = (time: number, availableJobs: string[]) => {
    const activeJobs = availableJobs.filter(jobId => remainingTime[jobId] > 0);
    activeJobs.sort((a, b) => {
      if (remainingTime[a] !== remainingTime[b]) {
        return remainingTime[a] - remainingTime[b];
      }
      return arrivalTime[a] - arrivalTime[b];
    });
    
    const jobInfo = activeJobs.map(job => ({
      jobId: job,
      remainingTime: parseFloat(remainingTime[job].toFixed(1))
    }));
    
    if (jobInfo.length > 0) {
      queueEvents.push({ time, jobs: jobInfo });
    }
  };

  // Initial queue
  const initialAvailableJobs = jobs
    .filter(job => job.arrivalTime <= currentTime)
    .map(job => job.id);
  captureQueueState(currentTime, initialAvailableJobs);

  // Simulation loop
  while (jobsCompleted < jobs.length) {
    // Process CPUs that finish at current time
    for (const cpu of cpuNames) {
      if (busyUntil[cpu] === currentTime && currentJobs[cpu] !== null) {
        const jobId = currentJobs[cpu]!;
        if (busyJobs.has(jobId)) {
          busyJobs.delete(jobId);
        }
        currentJobs[cpu] = null;
      }
    }

    // Find available CPUs and jobs at current time
    const availableCPUs = cpuNames.filter(cpu => 
      busyUntil[cpu] <= currentTime && currentJobs[cpu] === null
    );
    
    const availableJobs = Object.keys(remainingTime).filter(jobId => 
      remainingTime[jobId] > 0 && 
      arrivalTime[jobId] <= currentTime && 
      !busyJobs.has(jobId)
    );

    // Determine if we can schedule jobs now
    const canSchedule = currentTime >= nextSchedulingTime;

    // Capture queue state if we have CPUs and jobs available and can schedule
    if (canSchedule && availableCPUs.length > 0 && availableJobs.length > 0) {
      captureQueueState(currentTime, availableJobs);
    }

    // If no available jobs or CPUs or can't schedule, advance time to next event
    if (!canSchedule || availableJobs.length === 0 || availableCPUs.length === 0) {
      const futureCPUTimes = Object.entries(busyUntil)
        .filter(([_, time]) => time > currentTime)
        .map(([_, time]) => time);
        
      const futureArrivalTimes = Object.entries(arrivalTime)
        .filter(([jobId, time]) => 
          time > currentTime && remainingTime[jobId] > 0
        )
        .map(([_, time]) => time);
      
      // Include next scheduling time
      const futureTimes = [...futureCPUTimes, ...futureArrivalTimes];
      if (nextSchedulingTime > currentTime) {
        futureTimes.push(nextSchedulingTime);
      }
      
      if (futureTimes.length > 0) {
        currentTime = Math.min(...futureTimes);
      } else {
        // Safety measure to prevent infinite loop
        currentTime += 0.1;
      }
      continue;
    }

    // Sort available jobs by STRF policy (shortest remaining time first)
    availableJobs.sort((a, b) => {
      if (remainingTime[a] !== remainingTime[b]) {
        return remainingTime[a] - remainingTime[b];
      }
      return arrivalTime[a] - arrivalTime[b];
    });

    // Assign jobs to available CPUs
    for (const cpu of availableCPUs) {
      if (availableJobs.length === 0) break;

      const selectedJob = availableJobs.shift()!;
      
      // Record start time if this is the first time job is processed
      if (!(selectedJob in startTime)) {
        startTime[selectedJob] = currentTime;
      }

      // Get next chunk size for this job
      const chunkSize = jobChunks[selectedJob].shift()!;
      
      // Mark job as busy and assign to CPU
      busyJobs.add(selectedJob);
      currentJobs[cpu] = selectedJob;

      // Update job's remaining time and CPU's busy status
      remainingTime[selectedJob] -= chunkSize;
      busyUntil[cpu] = currentTime + chunkSize;
      
      // Add to Gantt chart data
      ganttData.push({
        startTime: currentTime,
        cpu,
        jobId: selectedJob,
        duration: chunkSize
      });

      // Check if job is completed
      if (Math.abs(remainingTime[selectedJob]) < 0.001) {
        endTime[selectedJob] = currentTime + chunkSize;
        jobsCompleted++;
      }
    }

    // Set the next scheduling time
    nextSchedulingTime = currentTime + quantumTime;

    // Move to next event time
    const nextCPUTimes = Object.entries(busyUntil)
      .filter(([_, time]) => time > currentTime)
      .map(([_, time]) => time);
      
    const nextArrivalTimes = Object.entries(arrivalTime)
      .filter(([jobId, time]) => 
        time > currentTime && remainingTime[jobId] > 0
      )
      .map(([_, time]) => time);
    
    const nextTimes = [...nextCPUTimes, ...nextArrivalTimes];
    if (nextSchedulingTime > currentTime) {
      nextTimes.push(nextSchedulingTime);
    }
    
    if (nextTimes.length > 0) {
      currentTime = Math.min(...nextTimes);
    } else {
      // Safety measure to prevent infinite loop
      currentTime += 0.1;
    }
  }

  // Calculate turnaround time for each job
  const updatedJobs = jobs.map(job => {
    const jobStartTime = startTime[job.id];
    const jobEndTime = endTime[job.id];
    const turnaroundTime = jobEndTime - job.arrivalTime;
    
    return {
      ...job,
      startTime: jobStartTime,
      endTime: jobEndTime,
      turnaroundTime: turnaroundTime
    };
  });

  // Calculate average turnaround time
  const totalTurnaround = updatedJobs.reduce((sum, job) => sum + job.turnaroundTime!, 0);
  const averageTurnaround = totalTurnaround / updatedJobs.length;

  return {
    jobs: updatedJobs,
    ganttData,
    queueEvents,
    averageTurnaround
  };
};

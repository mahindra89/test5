
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Job } from "@/types/scheduler";
import { toast } from "sonner";

interface JobFormProps {
  onSubmit: (jobs: Job[], numCPUs: number, chunkUnit: number, quantumTime: number) => void;
}

const JobForm: React.FC<JobFormProps> = ({ onSubmit }) => {
  const [numJobs, setNumJobs] = useState<number>(3);
  const [numCPUs, setNumCPUs] = useState<number>(2);
  const [chunkUnit, setChunkUnit] = useState<number>(1);
  const [quantumTime, setQuantumTime] = useState<number>(1);
  const [jobDetails, setJobDetails] = useState<Job[]>([]);
  const [step, setStep] = useState<"config" | "jobs">("config");

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (numJobs <= 0 || numCPUs <= 0 || chunkUnit <= 0 || quantumTime <= 0) {
      toast.error("All values must be positive numbers");
      return;
    }

    // Initialize job details array
    const initialJobs: Job[] = Array.from({ length: numJobs }, (_, i) => ({
      id: `J${i + 1}`,
      arrivalTime: 0,
      burstTime: 1
    }));
    
    setJobDetails(initialJobs);
    setStep("jobs");
  };

  const handleJobsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate job details
    const invalidJobs = jobDetails.filter(
      job => job.arrivalTime < 0 || job.burstTime <= 0
    );
    
    if (invalidJobs.length > 0) {
      toast.error("All arrival times must be non-negative and burst times must be positive");
      return;
    }

    onSubmit(jobDetails, numCPUs, chunkUnit, quantumTime);
  };

  const updateJobDetail = (
    index: number,
    field: keyof Job,
    value: string
  ) => {
    const newDetails = [...jobDetails];
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      newDetails[index] = { 
        ...newDetails[index], 
        [field]: numValue 
      };
      setJobDetails(newDetails);
    }
  };

  // Generate random values for job details
  const randomizeJobDetails = () => {
    const randomizedJobs = jobDetails.map(job => {
      // Random arrival time between 0-10 as either whole number or .5
      const randomArrival = Math.floor(Math.random() * 21) / 2;
      
      // Random burst time between 1-10 as either whole number or .5 (ensuring it's positive)
      const randomBurst = (Math.floor(Math.random() * 19) + 2) / 2; // Generates 1, 1.5, 2, ... up to 10
      
      return {
        ...job,
        arrivalTime: randomArrival,
        burstTime: randomBurst
      };
    });
    
    setJobDetails(randomizedJobs);
    toast.success("Random values generated for all jobs");
  };

  if (step === "config") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>STRF Scheduler Configuration</CardTitle>
          <CardDescription>
            Set up the parameters for the Shortest Remaining Time First scheduler
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleConfigSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="numJobs">Number of Jobs</Label>
                <Input
                  id="numJobs"
                  type="number"
                  min="1"
                  value={numJobs}
                  onChange={(e) => setNumJobs(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="numCPUs">Number of CPUs</Label>
                <Input
                  id="numCPUs"
                  type="number"
                  min="1"
                  value={numCPUs}
                  onChange={(e) => setNumCPUs(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chunkUnit">Chunk Unit (Time)</Label>
                <Input
                  id="chunkUnit"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={chunkUnit}
                  onChange={(e) => setChunkUnit(parseFloat(e.target.value) || 0.1)}
                  required
                />
                <p className="text-sm text-gray-500">
                  The time unit to break each job into (e.g., 0.5, 1.0, 2.0)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantumTime">Quantum Time (Scheduling Frequency)</Label>
                <Input
                  id="quantumTime"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantumTime}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      setQuantumTime(value);
                    }
                  }}
                  required
                />
                <p className="text-sm text-gray-500">
                  How frequently jobs are scheduled (e.g., 1.0, 2.0, 3.0)
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-scheduler-primary hover:bg-scheduler-accent">
              Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
        <CardDescription>
          Enter arrival and burst time for each job
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleJobsSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="mb-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={randomizeJobDetails}
                className="w-full"
              >
                Randomize Job Values
              </Button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Generates random whole numbers or .5 values
              </p>
            </div>
            {jobDetails.map((job, index) => (
              <div key={job.id} className="grid grid-cols-3 gap-4 items-center">
                <div className="font-medium">{job.id}</div>
                <div>
                  <Label htmlFor={`arrival-${index}`}>Arrival Time</Label>
                  <Input
                    id={`arrival-${index}`}
                    type="number"
                    min="0"
                    step="0.5"
                    value={job.arrivalTime}
                    onChange={(e) =>
                      updateJobDetail(index, "arrivalTime", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`burst-${index}`}>Burst Time</Label>
                  <Input
                    id={`burst-${index}`}
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={job.burstTime}
                    onChange={(e) =>
                      updateJobDetail(index, "burstTime", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("config")}
          >
            Back
          </Button>
          <Button type="submit" className="flex-1 bg-scheduler-primary hover:bg-scheduler-accent">
            Run Scheduler
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JobForm;

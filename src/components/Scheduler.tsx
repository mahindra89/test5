
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Job, SchedulerResults } from "@/types/scheduler";
import JobForm from "@/components/JobForm";
import GanttChart from "@/components/GanttChart";
import ResultsTable from "@/components/ResultsTable";
import { runSTRFScheduler } from "@/utils/schedulerLogic";
import { Separator } from "@/components/ui/separator";

const Scheduler: React.FC = () => {
  const [results, setResults] = useState<SchedulerResults | null>(null);
  const [cpuNames, setCpuNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("form");
  const [quantumTime, setQuantumTime] = useState<number>(1);

  const handleRunScheduler = (jobs: Job[], numCPUs: number, chunkUnit: number, quantumTime: number) => {
    // Run the scheduling algorithm
    const results = runSTRFScheduler(jobs, numCPUs, chunkUnit, quantumTime);
    setResults(results);
    setQuantumTime(quantumTime);
    
    // Set CPU names for Gantt chart
    setCpuNames(Array.from({ length: numCPUs }, (_, i) => `CPU${i+1}`));
    
    // Switch to results tab
    setActiveTab("gantt");
  };

  const handleReset = () => {
    setResults(null);
    setActiveTab("form");
  };

  // Calculate max time for Gantt chart
  const maxTime = results 
    ? Math.max(...results.jobs.map(job => job.endTime || 0)) 
    : 0;

  return (
    <div className="container max-w-6xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          STRF CPU Scheduler Simulator
        </h1>
        <p className="text-muted-foreground">
          Shortest Remaining Time First with multi-CPU support, time chunking, and quantum scheduling
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="form">Configure</TabsTrigger>
          <TabsTrigger value="gantt" disabled={!results}>Gantt Chart</TabsTrigger>
          <TabsTrigger value="results" disabled={!results}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardContent className="pt-6">
              <div className="max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Job Configuration</h2>
                <JobForm onSubmit={handleRunScheduler} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gantt">
          {results && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Gantt Chart Visualization</h2>
                <GanttChart 
                  ganttData={results.ganttData}
                  queueEvents={results.queueEvents}
                  maxTime={maxTime}
                  cpuNames={cpuNames}
                  quantumTime={quantumTime}
                />
                
                <div className="mt-6">
                  <Separator className="my-4" />
                  <div className="flex justify-end">
                    <Button onClick={handleReset} variant="outline" className="mr-2">
                      Reset
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("results")}
                    >
                      View Results Table
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results">
          {results && (
            <Card>
              <CardContent className="pt-6">
                <ResultsTable 
                  jobs={results.jobs}
                  averageTurnaround={results.averageTurnaround} 
                />
                
                <div className="mt-6">
                  <Separator className="my-4" />
                  <div className="flex justify-end">
                    <Button onClick={handleReset} variant="outline" className="mr-2">
                      Reset
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("gantt")}
                    >
                      View Gantt Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Scheduler;

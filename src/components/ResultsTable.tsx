
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Job } from "@/types/scheduler";

interface ResultsTableProps {
  jobs: Job[];
  averageTurnaround: number;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ jobs, averageTurnaround }) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">Scheduling Results</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Job</TableHead>
              <TableHead className="text-right">Arrival Time</TableHead>
              <TableHead className="text-right">Burst Time</TableHead>
              <TableHead className="text-right">Start Time</TableHead>
              <TableHead className="text-right">End Time</TableHead>
              <TableHead className="text-right">Turnaround Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell className="text-right">{job.arrivalTime.toFixed(1)}</TableCell>
                <TableCell className="text-right">{job.burstTime.toFixed(1)}</TableCell>
                <TableCell className="text-right">{job.startTime?.toFixed(1) || "-"}</TableCell>
                <TableCell className="text-right">{job.endTime?.toFixed(1) || "-"}</TableCell>
                <TableCell className="text-right">{job.turnaroundTime?.toFixed(1) || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-6 text-center p-4 rounded-md bg-blue-50 border border-blue-100">
        <p className="font-bold text-lg text-blue-700">
          Average Turnaround Time: {averageTurnaround.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default ResultsTable;

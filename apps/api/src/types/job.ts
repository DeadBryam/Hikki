export interface Job {
  created_at: string;
  current_runs: number;
  data: string;
  execute_at: string;
  id: string;
  interval_ms: number | null;
  max_runs: number | null;
  reason: string | null;
  recurrent: boolean;
  retry_count: number;
  service: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  updated_at: string;
}

export interface UpdateJobParams {
  current_runs: number;
  data: string;
  execute_at: string;
  interval_ms: number;
  max_runs: number;
  reason: string;
  recurrent: boolean;
  status: "pending" | "processing" | "completed" | "failed";
}

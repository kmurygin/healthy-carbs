export interface ErrorResponse {
  timestamp: string;
  status: number;
  type: string;
  message: string;
  path: string;
  fieldErrors?: { [key: string]: string };
  details?: string[];
}


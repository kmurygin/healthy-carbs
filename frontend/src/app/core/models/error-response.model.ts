export interface ErrorResponse {
  traceId?: string;
  timestamp?: string;
  status?: number;
  type?: string;
  message?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
  details?: string[];
}

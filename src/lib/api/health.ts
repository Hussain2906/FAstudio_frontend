import { apiClient } from './client';

export interface HealthResponse {
  status: 'ok';
}

export function getBackendHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/health');
}

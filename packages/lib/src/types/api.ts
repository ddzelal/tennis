export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T = any> extends StandardResponse<T[]> {
  pagination: PaginationData;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse extends StandardResponse {
  validationErrors?: ValidationError[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  validationErrors?: Array<{ field: string; message: string }>;
  timestamp: string;
}

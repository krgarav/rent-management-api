import { Response } from 'express';
export interface HTTPResponse {
  status?: string;
  code?: number;
  data?: any;
  message?: string;
}

export interface ApiErrorResponseDto {
  statusCode: number;
  error: {
    code: string;
    type: string;
    message: string;
    details: unknown;
    path: string;
    timestamp: string;
    requestId: string;
  };
}

export class AppError extends Error {
    public statusCode: number;
    public details?: any;
  
    constructor(message: string, statusCode = 400, details: any = null) {
      super(message);
      this.statusCode = statusCode;
      this.details = details;
    }
  }
  
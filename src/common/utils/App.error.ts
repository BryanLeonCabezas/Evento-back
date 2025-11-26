export class AppError extends Error {
    public statusCode: number;
    public errorCode?: string;
    public details?: any;
  
    constructor(message: string, statusCode = 400, errorCode= "ERROR",details: any = null) {
      super(message);
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      this.details = details;
    }
  }
  
import rateLimit from 'express-rate-limit';

export const verifyLimiter = rateLimit({
  windowMs: 60 * 10000, 
  max: 5,
  message: {
    message: 'Demasiados intentos. Intenta nuevamente en 1 minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
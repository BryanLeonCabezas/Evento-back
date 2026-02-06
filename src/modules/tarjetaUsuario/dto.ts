// dto/guardar-tarjeta.dto.ts
export interface GuardarTarjetaDto {
  token: string;                 
  last4: string;                 
  bin?: string;                  
  brand: string;                 
  expiryMonth: number;           
  expiryYear: number;            
  bankName?: string;             
  transactionReference?: string; 
  origin?: string;         
  type?: string;      
}

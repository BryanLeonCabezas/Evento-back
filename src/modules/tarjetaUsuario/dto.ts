
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
  holderName?: string;     
}

export interface TarjetaUsuarioResponseDto {
  idTarjeta: number;
  brand: string;
  brandName: string;
  last4: string;
  bin: string;
  expMonth: number;
  expYear: number;
  banco: string | null;
  predeterminado: boolean;
}
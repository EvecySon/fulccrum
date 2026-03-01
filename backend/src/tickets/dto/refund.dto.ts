export class ProcessRefundDto {
  amount: number;
  type: 'full' | 'partial';
  destination: 'wallet' | 'original_payment';
  chargedTo: 'merchant' | 'platform' | 'courier';
  reason: string;
  orderId?: string;
}

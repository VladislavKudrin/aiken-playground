export interface ResponseDetails {
  walletAddress: string;
  scriptAddress: string;
  amount?: number;
  txHash?: string;
  errorMessage?: string;
}

export interface Response {
  action: 'LOCK' | 'UNLOCK';
  walletName: string;
  status: 'OK' | 'ERROR';
  details: ResponseDetails;
}

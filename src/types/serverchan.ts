export interface ServerChanResponse {
  code: number;
  message: string;
  data?: {
    pushid: string;
    readkey: string;
    error?: string;
    errno?: number;
  };
}

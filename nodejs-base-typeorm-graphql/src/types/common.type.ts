export interface Response<T> {
  success: boolean;
  message: string | unknown;
  totalCount?: number,
  lastSeenId?: string,
  data?: T;
}

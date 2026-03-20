export type SearchResultType = 'subject' | 'parcel';

export interface SearchResultDto {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

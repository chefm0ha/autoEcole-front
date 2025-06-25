import { ApplicationFile } from './application-file.model';
import { Session } from './session.model';

export interface Candidate {
  cin: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  email?: string;
  gender: 'M' | 'F';
  gsm: string;
  isActive: boolean;
  birthDay: string;
  birthPlace?: string;
  startingDate?: string;
  applicationFiles?: ApplicationFile[];
  sessions?: Session[];
}

/**
 * Optimized DTO for candidate list display - matches backend CandidateListDTO
 * Contains only the fields needed for the candidate management table
 */
export interface CandidateListDTO {
  cin: string;
  gender: 'M' | 'F';
  firstName: string;
  lastName: string;
  birthDay: string;
  birthPlace?: string;
  isActive: boolean;
  gsm: string;
  startingDate?: string;
}

/**
 * DTO for candidate details - matches backend CandidateDetailsDTO
 * Contains candidate information
 */
export interface CandidateDetailsDTO {
  cin: string;
  firstName: string;
  lastName: string;
  birthDay: string;
  birthPlace?: string;
  address?: string;
  city?: string;
  email?: string;
  gender: 'M' | 'F';
  gsm: string;
  isActive: boolean;
  startingDate?: string;
}

export interface CandidateSearchDTO {
  firstName?: string;
  lastName?: string;
  cin?: string;
  isActive?: boolean;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: {
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
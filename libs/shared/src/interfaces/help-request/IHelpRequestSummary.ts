import { Urgency, HelpRequestStatus } from '../../enums';

/**
 * People summary statistics
 */
export interface IHelpRequestPeopleSummary {
  totalPeople: number;
  elders: number;
  children: number;
  pets: number;
}

/**
 * Comprehensive summary statistics for help requests
 * Used for dashboard and analytics endpoints
 */
export interface IHelpRequestSummary {
  total: number;
  byUrgency: Record<Urgency, number>;
  byStatus: Record<HelpRequestStatus, number>;
  byDistrict: Record<string, number>;
  people: IHelpRequestPeopleSummary;
  rationItems: Record<string, number>;
}


import apiClient from './api-client';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest';
import { IHelpRequestSummary } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/IHelpRequestSummary';
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto';
import { HelpRequestFilters } from '../types/help-request';

/**
 * Help Request Service
 * Handles all help request-related API calls
 */
class HelpRequestService {
  private static instance: HelpRequestService;
  private readonly basePath = '/api/help-requests';

  private constructor() {}

  /**
   * Get HelpRequestService singleton instance
   */
  public static getInstance(): HelpRequestService {
    if (!HelpRequestService.instance) {
      HelpRequestService.instance = new HelpRequestService();
    }
    return HelpRequestService.instance;
  }

  /**
   * Get all help requests with optional filters
   */
  public async getAllHelpRequests(
    filters?: HelpRequestFilters
  ): Promise<IApiResponse<HelpRequestResponseDto[]>> {
    try {
      const params: Record<string, string> = {};
      if (filters?.urgency) params.urgency = filters.urgency;
      if (filters?.district) params.district = filters.district;

      const response = await apiClient.get<IApiResponse<HelpRequestResponseDto[]>>(
        this.basePath,
        params
      );
      return response;
    } catch (error) {
      console.error('Error in HelpRequestService.getAllHelpRequests:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch help requests',
      };
    }
  }

  /**
   * Create a new help request
   */
  public async createHelpRequest(
    createHelpRequestDto: ICreateHelpRequest
  ): Promise<IApiResponse<HelpRequestResponseDto>> {
    try {
      console.log('[HelpRequestService] Creating help request:', createHelpRequestDto);
      console.log('[HelpRequestService] Endpoint:', this.basePath);
      
      // The API client will automatically add Authorization header if token exists
      // skipAuth defaults to false, so authentication will be used
      const response = await apiClient.post<IApiResponse<HelpRequestResponseDto>>(
        this.basePath,
        createHelpRequestDto
      );
      
      console.log('[HelpRequestService] Help request created successfully:', response);
      return response;
    } catch (error) {
      console.error('[HelpRequestService] Error creating help request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create help request',
      };
    }
  }

  /**
   * Get summary statistics for help requests (used on landing page cards)
   */
  public async getHelpRequestsSummary(): Promise<IApiResponse<IHelpRequestSummary>> {
    try {
      const response = await apiClient.get<IApiResponse<IHelpRequestSummary>>(
        `${this.basePath}/summary`
      );
      return response;
    } catch (error) {
      console.error('Error in HelpRequestService.getHelpRequestsSummary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch help requests summary',
      };
    }
  }
}

// Export singleton instance
export const helpRequestService = HelpRequestService.getInstance();
export default helpRequestService;


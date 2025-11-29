import apiClient from './api-client';
import { IApiResponse, IHelpRequestSummary } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest';
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
   * Get a help request by ID
   */
  public async getHelpRequestById(
    id: number
  ): Promise<IApiResponse<HelpRequestResponseDto>> {
    try {
      const response = await apiClient.get<IApiResponse<HelpRequestResponseDto>>(
        `${this.basePath}/${id}`
      );
      return response;
    } catch (error) {
      console.error('Error in HelpRequestService.getHelpRequestById:', error);
      
      // Fallback: If the route doesn't exist yet, fetch all and filter by ID
      if (error instanceof Error && error.message.includes('Route not found')) {
        console.log('[HelpRequestService] Route not found, falling back to getAllHelpRequests');
        try {
          const allResponse = await this.getAllHelpRequests();
          if (allResponse.success && allResponse.data) {
            const foundRequest = allResponse.data.find((req) => req.id === id);
            if (foundRequest) {
              return {
                success: true,
                data: foundRequest,
                message: 'Help request retrieved successfully',
              };
            } else {
              return {
                success: false,
                error: 'Help request not found',
              };
            }
          }
        } catch (fallbackError) {
          console.error('Error in fallback getAllHelpRequests:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch help request',
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
   * Get comprehensive summary statistics for help requests
   */
  public async getHelpRequestsSummary(): Promise<IApiResponse<IHelpRequestSummary>> {
    try {
      console.log('[HelpRequestService] Fetching summary from:', `${this.basePath}/summary`);
      const response = await apiClient.get<IApiResponse<IHelpRequestSummary>>(
        `${this.basePath}/summary`
      );
      console.log('[HelpRequestService] Summary response:', response);
      console.log('[HelpRequestService] Response success:', response.success);
      console.log('[HelpRequestService] Response data:', response.data);
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


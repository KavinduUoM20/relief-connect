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
      console.error('[HelpRequestService] Error type:', error instanceof Error ? error.constructor.name : typeof error);

      // Try to extract validation error details from API client error
      if (error instanceof Error) {
        const anyErr = error as Error & { 
          details?: unknown;
          errorData?: {
            details?: unknown;
            error?: string;
          };
        };
        let message = error.message || 'Failed to create help request';

        // Helper function to extract message from details array
        const extractMessageFromDetails = (details: unknown): string | null => {
          if (Array.isArray(details) && details.length > 0) {
            // Try first error
            const first = details[0] as {
              field?: string;
              constraints?: Record<string, string>;
            };
            if (first?.constraints) {
              const constraintMessages = Object.values(first.constraints);
              if (constraintMessages.length > 0) {
                return constraintMessages[0];
              }
            }
            // If no constraints, try to get field name
            if (first?.field) {
              return `Validation failed for ${first.field}`;
            }
          }
          return null;
        };

        // Check errorData first (from API response) - this is the most reliable source
        if (anyErr.errorData) {
          console.log('[HelpRequestService] errorData:', JSON.stringify(anyErr.errorData, null, 2));
          if (anyErr.errorData.details) {
            const extracted = extractMessageFromDetails(anyErr.errorData.details);
            if (extracted) {
              message = extracted;
              console.log('[HelpRequestService] Extracted message from errorData.details:', message);
            }
          }
        }
        // Fallback to error.details (directly attached to error)
        if (message === error.message && anyErr.details) {
          console.log('[HelpRequestService] error.details:', JSON.stringify(anyErr.details, null, 2));
          const extracted = extractMessageFromDetails(anyErr.details);
          if (extracted) {
            message = extracted;
            console.log('[HelpRequestService] Extracted message from error.details:', message);
          }
        }

        // If message is still generic "Validation failed", try to get more info
        if (message === 'Validation failed' && anyErr.errorData?.details) {
          const details = anyErr.errorData.details;
          if (Array.isArray(details) && details.length > 0) {
            // Collect all validation errors
            const allErrors: string[] = [];
            details.forEach((err: { field?: string; constraints?: Record<string, string> }) => {
              if (err?.field && err?.constraints) {
                const constraintMessages = Object.values(err.constraints);
                if (constraintMessages.length > 0) {
                  allErrors.push(`${err.field}: ${constraintMessages[0]}`);
                }
              }
            });
            if (allErrors.length > 0) {
              // Show first error, or all if there are multiple
              message = allErrors.length === 1 ? allErrors[0] : allErrors.join('; ');
            }
          }
        }

        return {
          success: false,
          error: message,
        };
      }

      return {
        success: false,
        error: 'Failed to create help request',
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


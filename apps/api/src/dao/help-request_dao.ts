import HelpRequestModel from '../models/help-request.model';
import { 
  IHelpRequest, 
  CreateHelpRequestDto,
  Urgency,
  HelpRequestStatus,
  IHelpRequestSummary
} from '@nx-mono-repo-deployment-test/shared';
import { Op, Sequelize } from 'sequelize';

class HelpRequestDao {
  private static instance: HelpRequestDao;

  private constructor() {}

  public static getInstance(): HelpRequestDao {
    if (!HelpRequestDao.instance) {
      HelpRequestDao.instance = new HelpRequestDao();
    }
    return HelpRequestDao.instance;
  }

  /**
   * Find all help requests, filtering out expired ones (30 days)
   * Optional filters: urgency, district (via approxArea)
   */
  public async findAll(filters?: {
    urgency?: Urgency;
    district?: string;
  }): Promise<IHelpRequest[]> {
    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const whereClause: Record<string, unknown> = {
        [HelpRequestModel.HELP_REQUEST_CREATED_AT]: {
          [Op.gte]: thirtyDaysAgo, // Only get records created in last 30 days
        },
        [HelpRequestModel.HELP_REQUEST_STATUS]: HelpRequestStatus.OPEN,
      };

      // Apply optional filters
      if (filters?.urgency) {
        whereClause[HelpRequestModel.HELP_REQUEST_URGENCY] = filters.urgency;
      }
      if (filters?.district) {
        whereClause[HelpRequestModel.HELP_REQUEST_APPROX_AREA] = {
          [Op.iLike]: `%${filters.district}%`,
        };
      }

      const helpRequests = await HelpRequestModel.findAll({
        where: whereClause,
        order: [[HelpRequestModel.HELP_REQUEST_CREATED_AT, 'DESC']],
      });
      return helpRequests.map(hr => hr.toJSON() as IHelpRequest);
    } catch (error) {
      console.error('Error in HelpRequestDao.findAll:', error);
      throw error;
    }
  }

  public async findById(id: number): Promise<IHelpRequest | null> {
    try {
      const helpRequest = await HelpRequestModel.findByPk(id);
      return helpRequest ? (helpRequest.toJSON() as IHelpRequest) : null;
    } catch (error) {
      console.error(`Error in HelpRequestDao.findById (${id}):`, error);
      throw error;
    }
  }

  public async create(createHelpRequestDto: CreateHelpRequestDto, userId?: number): Promise<IHelpRequest> {
    try {
      const helpRequest = await HelpRequestModel.create({
        [HelpRequestModel.HELP_REQUEST_USER_ID]: userId,
        [HelpRequestModel.HELP_REQUEST_LAT]: createHelpRequestDto.lat,
        [HelpRequestModel.HELP_REQUEST_LNG]: createHelpRequestDto.lng,
        [HelpRequestModel.HELP_REQUEST_URGENCY]: createHelpRequestDto.urgency,
        [HelpRequestModel.HELP_REQUEST_SHORT_NOTE]: createHelpRequestDto.shortNote,
        [HelpRequestModel.HELP_REQUEST_APPROX_AREA]: createHelpRequestDto.approxArea,
        [HelpRequestModel.HELP_REQUEST_CONTACT_TYPE]: createHelpRequestDto.contactType,
        [HelpRequestModel.HELP_REQUEST_CONTACT]: createHelpRequestDto.contact,
        [HelpRequestModel.HELP_REQUEST_NAME]: createHelpRequestDto.name,
        [HelpRequestModel.HELP_REQUEST_TOTAL_PEOPLE]: createHelpRequestDto.totalPeople,
        [HelpRequestModel.HELP_REQUEST_ELDERS]: createHelpRequestDto.elders,
        [HelpRequestModel.HELP_REQUEST_CHILDREN]: createHelpRequestDto.children,
        [HelpRequestModel.HELP_REQUEST_PETS]: createHelpRequestDto.pets,
        [HelpRequestModel.HELP_REQUEST_RATION_ITEMS]: createHelpRequestDto.rationItems,
        [HelpRequestModel.HELP_REQUEST_STATUS]: HelpRequestStatus.OPEN,
      });
      return helpRequest.toJSON() as IHelpRequest;
    } catch (error) {
      console.error('Error in HelpRequestDao.create:', error);
      throw error;
    }
  }

  public async count(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return await HelpRequestModel.count({
        where: {
          [HelpRequestModel.HELP_REQUEST_CREATED_AT]: {
            [Op.gte]: thirtyDaysAgo,
          },
          [HelpRequestModel.HELP_REQUEST_STATUS]: HelpRequestStatus.OPEN,
        },
      });
    } catch (error) {
      console.error('Error in HelpRequestDao.count:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive summary statistics for help requests
   * Uses database-level aggregations for optimal performance
   * Returns counts by urgency, status, district, people totals, and ration items
   */
  public async getSummary(): Promise<IHelpRequestSummary> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const whereClause = {
        [HelpRequestModel.HELP_REQUEST_CREATED_AT]: {
          [Op.gte]: thirtyDaysAgo,
        },
      };

      // Execute all aggregation queries in parallel for better performance
      const [
        total,
        urgencyGroups,
        statusGroups,
        districtGroups,
        peopleSums,
        rationItemsData,
      ] = await Promise.all([
        // Total count
        HelpRequestModel.count({ where: whereClause }),

        // Count by urgency
        HelpRequestModel.findAll({
          where: whereClause,
          attributes: [
            HelpRequestModel.HELP_REQUEST_URGENCY,
            [Sequelize.fn('COUNT', Sequelize.literal('*')), 'count'],
          ],
          group: [HelpRequestModel.HELP_REQUEST_URGENCY],
          raw: true,
        }),

        // Count by status
        HelpRequestModel.findAll({
          where: whereClause,
          attributes: [
            HelpRequestModel.HELP_REQUEST_STATUS,
            [Sequelize.fn('COUNT', Sequelize.literal('*')), 'count'],
          ],
          group: [HelpRequestModel.HELP_REQUEST_STATUS],
          raw: true,
        }),

        // Count by district
        HelpRequestModel.findAll({
          where: whereClause,
          attributes: [
            HelpRequestModel.HELP_REQUEST_APPROX_AREA,
            [Sequelize.fn('COUNT', Sequelize.literal('*')), 'count'],
          ],
          group: [HelpRequestModel.HELP_REQUEST_APPROX_AREA],
          raw: true,
        }),

        // Sum people counts
        HelpRequestModel.findOne({
          where: whereClause,
          attributes: [
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestModel.HELP_REQUEST_TOTAL_PEOPLE)), 0), 'totalPeople'],
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestModel.HELP_REQUEST_ELDERS)), 0), 'elders'],
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestModel.HELP_REQUEST_CHILDREN)), 0), 'children'],
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestModel.HELP_REQUEST_PETS)), 0), 'pets'],
          ],
          raw: true,
        }),

        // Get ration items (array field - need to process in memory)
        HelpRequestModel.findAll({
          where: whereClause,
          attributes: [HelpRequestModel.HELP_REQUEST_RATION_ITEMS],
          raw: true,
        }),
      ]);

      // Initialize counts with default values
      const byUrgency: Record<Urgency, number> = {
        [Urgency.LOW]: 0,
        [Urgency.MEDIUM]: 0,
        [Urgency.HIGH]: 0,
      };

      const byStatus: Record<HelpRequestStatus, number> = {
        [HelpRequestStatus.OPEN]: 0,
        [HelpRequestStatus.CLOSED]: 0,
        [HelpRequestStatus.EXPIRED]: 0,
      };

      const byDistrict: Record<string, number> = {};
      const rationItems: Record<string, number> = {};

      // Process urgency groups (raw queries return model field names, not constants)
      (urgencyGroups as unknown as Array<Record<string, unknown>>).forEach(group => {
        const urgency = group.urgency as Urgency;
        const count = group.count as string | number;
        if (urgency && urgency in byUrgency) {
          byUrgency[urgency] = typeof count === 'string' ? parseInt(count, 10) : count;
        }
      });

      // Process status groups
      (statusGroups as unknown as Array<Record<string, unknown>>).forEach(group => {
        const status = group.status as HelpRequestStatus;
        const count = group.count as string | number;
        if (status && status in byStatus) {
          byStatus[status] = typeof count === 'string' ? parseInt(count, 10) : count;
        }
      });

      // Process district groups
      (districtGroups as unknown as Array<Record<string, unknown>>).forEach(group => {
        const approxArea = group.approxArea as string;
        const count = group.count as string | number;
        if (approxArea) {
          byDistrict[approxArea] = typeof count === 'string' ? parseInt(count, 10) : count;
        }
      });

      // Process people sums
      const peopleSumsData = peopleSums as Record<string, unknown> | null;
      const people = {
        totalPeople: peopleSumsData ? (typeof peopleSumsData.totalPeople === 'string' ? parseInt(peopleSumsData.totalPeople, 10) : Number(peopleSumsData.totalPeople || 0)) : 0,
        elders: peopleSumsData ? (typeof peopleSumsData.elders === 'string' ? parseInt(peopleSumsData.elders, 10) : Number(peopleSumsData.elders || 0)) : 0,
        children: peopleSumsData ? (typeof peopleSumsData.children === 'string' ? parseInt(peopleSumsData.children, 10) : Number(peopleSumsData.children || 0)) : 0,
        pets: peopleSumsData ? (typeof peopleSumsData.pets === 'string' ? parseInt(peopleSumsData.pets, 10) : Number(peopleSumsData.pets || 0)) : 0,
      };

      // Process ration items (array field - PostgreSQL array)
      (rationItemsData as unknown as Array<Record<string, unknown>>).forEach(item => {
        const rationItemsArray = item.rationItems as string[] | undefined;
        if (rationItemsArray && Array.isArray(rationItemsArray)) {
          rationItemsArray.forEach(rationItem => {
            rationItems[rationItem] = (rationItems[rationItem] || 0) + 1;
          });
        }
      });

      return {
        total,
        byUrgency,
        byStatus,
        byDistrict,
        people,
        rationItems,
      };
    } catch (error) {
      console.error('Error in HelpRequestDao.getSummary:', error);
      throw error;
    }
  }
}

export default HelpRequestDao;


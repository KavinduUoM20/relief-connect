import DonationModel from '../models/donation.model';
import UserModel from '../models/user.model';
import { IDonation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/donation/IDonation';

class DonationDao {
  private static instance: DonationDao;

  private constructor() {}

  public static getInstance(): DonationDao {
    if (!DonationDao.instance) {
      DonationDao.instance = new DonationDao();
    }
    return DonationDao.instance;
  }

  /**
   * Find all donations for a help request with donator information
   */
  public async findByHelpRequestId(helpRequestId: number): Promise<Array<IDonation & { donator?: { id: number; username: string; contactNumber?: string } }>> {
    try {
      const donations = await DonationModel.findAll({
        where: {
          [DonationModel.DONATION_HELP_REQUEST_ID]: helpRequestId,
        },
        include: [{
          model: UserModel,
          as: 'donator',
          attributes: ['id', 'username', 'contactNumber'],
        }],
        order: [[DonationModel.DONATION_CREATED_AT, 'DESC']],
      });
      return donations.map(d => {
        const donation = d.toJSON() as IDonation & { donator?: { id: number; username: string; contactNumber?: string } };
        return donation;
      });
    } catch (error) {
      console.error(`Error in DonationDao.findByHelpRequestId (${helpRequestId}):`, error);
      throw error;
    }
  }

  /**
   * Find donation by ID
   */
  public async findById(id: number): Promise<IDonation | null> {
    try {
      const donation = await DonationModel.findByPk(id);
      return donation ? (donation.toJSON() as IDonation) : null;
    } catch (error) {
      console.error(`Error in DonationDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new donation
   */
  public async create(
    helpRequestId: number,
    donatorId: number,
    rationItems: Record<string, number>
  ): Promise<IDonation> {
    try {
      const donation = await DonationModel.create({
        [DonationModel.DONATION_HELP_REQUEST_ID]: helpRequestId,
        [DonationModel.DONATION_DONATOR_ID]: donatorId,
        [DonationModel.DONATION_RATION_ITEMS]: rationItems,
        [DonationModel.DONATION_DONATOR_MARKED_SCHEDULED]: false,
        [DonationModel.DONATION_DONATOR_MARKED_COMPLETED]: false,
        [DonationModel.DONATION_OWNER_MARKED_COMPLETED]: false,
      });
      return donation.toJSON() as IDonation;
    } catch (error) {
      console.error('Error in DonationDao.create:', error);
      throw error;
    }
  }

  /**
   * Update donation - mark as scheduled by donator
   */
  public async markAsScheduled(id: number): Promise<IDonation | null> {
    try {
      const donation = await DonationModel.findByPk(id);
      if (!donation) {
        return null;
      }

      donation[DonationModel.DONATION_DONATOR_MARKED_SCHEDULED] = true;
      await donation.save();

      return donation.toJSON() as IDonation;
    } catch (error) {
      console.error(`Error in DonationDao.markAsScheduled (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update donation - mark as completed by donator
   */
  public async markAsCompletedByDonator(id: number): Promise<IDonation | null> {
    try {
      const donation = await DonationModel.findByPk(id);
      if (!donation) {
        return null;
      }

      donation[DonationModel.DONATION_DONATOR_MARKED_COMPLETED] = true;
      await donation.save();

      return donation.toJSON() as IDonation;
    } catch (error) {
      console.error(`Error in DonationDao.markAsCompletedByDonator (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update donation - mark as completed by owner
   */
  public async markAsCompletedByOwner(id: number): Promise<IDonation | null> {
    try {
      const donation = await DonationModel.findByPk(id);
      if (!donation) {
        return null;
      }

      donation[DonationModel.DONATION_OWNER_MARKED_COMPLETED] = true;
      await donation.save();

      return donation.toJSON() as IDonation;
    } catch (error) {
      console.error(`Error in DonationDao.markAsCompletedByOwner (${id}):`, error);
      throw error;
    }
  }
}

export default DonationDao;


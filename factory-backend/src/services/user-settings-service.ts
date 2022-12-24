import { getUserSettingsFromTable } from '../aws-wrappers/get-item-from-table';
import { insertUserSettingsToTable } from '../aws-wrappers/insert-item-to-table';

export class UserSettingsService {
  constructor(public userSettingsTableName: string) {}

  /**
   * Get user settings from the Dynamo db by user id
   * @param user_id
   * @param userSettings
   */
  async getUserSettings(user_id: string): Promise<Record<string, any>> {
    try {
      console.info('Fetching settings for user', user_id);

      const settings = await getUserSettingsFromTable(
        this.userSettingsTableName,
        user_id
      );

      console.info('Settings successfully fetched for user', user_id);

      return settings;
    } catch (error) {
      console.error('getUserSettings', error);
      throw error;
    }
  }

  /**
   * Save user settings to the Dynamo db
   * @param user_id
   * @param userSettings
   */
  async saveUserSettings(user_id: string, userSettings: Record<string, any>) {
    try {
      const existing = await this.getUserSettings(user_id);
      const data = { ...existing, ...userSettings };

      console.info(
        'saveUserSettings(): Saving user settings for user',
        user_id
      );

      const result = await insertUserSettingsToTable(
        this.userSettingsTableName,
        user_id,
        data
      );

      console.info(
        'saveUserSettings(): Saved settings successfully for user',
        user_id
      );

      return result;
    } catch (error) {
      console.error('saveUserSettings():', error);
      throw error;
    }
  }
}

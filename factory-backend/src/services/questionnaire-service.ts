import { putToBucket } from '../aws-wrappers/put-file-to-bucket';
import { readFromFile } from '../aws-wrappers/read-file-from-bucket';
import { Questionnaire } from '../datamodels/questionnaire';
import { Locale } from '../Locale';

export class QuestionnaireService {
  private QUESTIONNAIRE_CONFIG_NAME: string = 'questionnaire_latest.json';

  constructor(public assetsBucketName: string) {}

  /**
   * Returns the most recent questionnaire defined on the platform.
   * Currently hardcoded & only in Finnish.
   * @param locale The locale in widely accepted 'fi-FI'-form.
   */
  async getQuestionnaire(
    locale: Locale = Locale.fi_FI
  ): Promise<Questionnaire> {
    try {
      return await readFromFile<Questionnaire>(
        this.assetsBucketName,
        this.QUESTIONNAIRE_CONFIG_NAME,
        locale
      );
    } catch (error) {
      console.error(
        'getOrganizations: Error occured while reading from file',
        this.assetsBucketName,
        this.QUESTIONNAIRE_CONFIG_NAME,
        error
      );
      throw error;
    }
  }

  /**
   * Returns the most recent questionnaire defined on the platform.
   * Currently hardcoded & only in Finnish.
   * @param locale The locale in widely accepted 'fi-FI'-form.
   */
  async getCategoryIds(locale: string = 'fi-FI'): Promise<string[]> {
    try {
      const questionnaire = await readFromFile<Questionnaire>(
        this.assetsBucketName,
        this.QUESTIONNAIRE_CONFIG_NAME,
        locale
      );
      return questionnaire.categories.map((c) => c.id);
    } catch (error) {
      console.error(
        'getCategories: Error occured while reading from file',
        this.assetsBucketName,
        this.QUESTIONNAIRE_CONFIG_NAME,
        error
      );
      throw error;
    }
  }

  async postQuestionnaire(questionnaire: Questionnaire) {
    const locale = 'fi-FI'; //TODO: support for different locales
    await putToBucket(
      this.assetsBucketName,
      `questionnaire_v${questionnaire.version}.json`,
      JSON.stringify(questionnaire),
      locale
    );
    await putToBucket(
      this.assetsBucketName,
      this.QUESTIONNAIRE_CONFIG_NAME,
      JSON.stringify(questionnaire),
      locale
    );
  }
}

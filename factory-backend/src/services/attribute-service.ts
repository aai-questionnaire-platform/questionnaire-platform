import { DynamoDBRecord } from 'aws-lambda';
import {
  getAttributeNameFromNewImage,
  getUserIdFromNewImage,
  getUserIdFromRecord,
} from './utils';
import { insertAttributeToTable } from '../aws-wrappers/insert-item-to-table';
import * as aaiPlugin from './attribute-plugins/aai-attribute-plugins';
import { AaiAttributePlugin } from './attribute-plugins/aai-attribute-plugin';
import { getAccessTokenFromTable } from '../aws-wrappers/get-item-from-table';
import { getAaiAttributesFromTable } from '../aws-wrappers/get-item-from-table';
import { deleteAaiAttributesFromTable } from '../aws-wrappers/remove-item-from-table';
import axios from "axios";

/*
  Generates the AuroraAI attribute based on attribute name and saves the attribute
  in DynamoDB table.
 */
export class AttributeService {

  // List of supported attribute plugins,
  // format: 'attribute_name', 'class_name'
  private attributePlugins: any;

  constructor(
    public attributeTableName: string,
    public aaiAttributes?: string,
    public tokenTableName?: string,
    public nextAuthProvider?: string,
    public aaiServiceUrl?: string
  ) {
    // Populate list of supported plugins
    this.attributePlugins = new Map<string, string>();
    this.attributePlugins.set('tampere_demo_flag', 'HoivaavatNuoretAttribute');
  }

  /**
   * Set attribute for the user
   * @param record DynamoDB record from which the attribute value
   * is made.
   */
  async setAttribute(record: DynamoDBRecord) {
    if (!this.aaiAttributes) {
      console.info('setAttribute(): Empty attribute not saved');
      return;
    }
    // Load plugin based on attribute value
    const plugin = this.findPlugin<AaiAttributePlugin>(this.aaiAttributes);

    const userId = getUserIdFromRecord(record);

    if (!userId) {
      console.error('setAttribute(): UserId not found from stream')
    }

    // Save the attribute
    try {
      const attribute = this.aaiAttributes;
      const result = await insertAttributeToTable(
        this.attributeTableName,
        userId!,
        attribute,
        plugin.generateAttribute(this.aaiAttributes, record)
      );

      console.info(
        'setAttribute(): Saved attribute successfully for user',
        userId
      );

      return result;
    } catch (error) {
      console.error('setAttribute(): ', error);
      throw error;
    }
  }

  /**
   * Add attribute pointer to AuroraAI core component. This notifies the core component
   * that the attribute is available for the specified user.
   */
  async addAttributePointer(record: DynamoDBRecord) {
    if (!this.aaiAttributes) {
      console.info('addAttributePointer(): Empty attribute pointer not sent');
      return;
    }

    if (!this.nextAuthProvider) {
      console.error('addAttributePointer(): Next-auth provider is not set');
      return;
    }

    if (!this.aaiServiceUrl) {
      console.error('addAttributePointer(): AAI Service Url not set');
      return;
    }

    if (!this.tokenTableName) {
      console.error('addAttributePointer(): Token table name not set');
      return;
    }
    
    try {
      const userId = getUserIdFromNewImage(record);
      const attributeName = getAttributeNameFromNewImage(record);
      const accessToken = await getAccessTokenFromTable(this.tokenTableName, userId, this.nextAuthProvider);

      if (!userId || !attributeName || !accessToken) {
        console.error('addAttributePointer(): Could not get userid, attribute name or access_token');
        return;
      }

      const attributeEndpoint = 'profile-management/v1/user_attributes';
      await axios({
        method: 'patch',
        url: `${this.aaiServiceUrl}${attributeEndpoint}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: [ `${attributeName}` ]
      });
      console.info(`addAttributePointer(): Attribute pointer ${attributeName} added for user ${userId}`);

    } catch (error) {
      console.error('addAttributePointer(): ', error);
      return;
    }
  }


  /**
   * Get user attributes from the Dynamo db by user id
   * @param user_id
   */
  async getAttributes(user_id: string): Promise<Record<string, any>> {
    try {
      console.info('Fetching attributes for user ', user_id);

      const attributes = await getAaiAttributesFromTable(
        this.attributeTableName,
        user_id
      );

      console.info('Attributes successfully fetched for user ', user_id);

      return attributes;
    } catch (error) {
      console.error('getAttributes', error);
      throw error;
    }
  }

  /**
   * Delete user attributes from the Dynamo db by user id
   * @param user_id
   */
  async deleteAttributes(user_id: string): Promise<Record<string, any>> {
    try {
      console.info('Deleting attributes for user {}', user_id);

      const attributes = await deleteAaiAttributesFromTable(
        this.attributeTableName,
        user_id
      );

      console.info('Attributes successfully deleted from user {}', user_id);

      return attributes;
    } catch (error) {
      console.error('deleteAttributes', error);
      throw error;
    }
  }

  /*
   * Returns the AuroraAI attribute generator plugin specified by
   * attributePlugins map.
   */
  findPlugin<T>(aaiAttributeName: string): T {
    const plugin = this.attributePlugins.get(aaiAttributeName);
    if (!plugin) {
      console.error('Plugin not found for attribute ', aaiAttributeName);
    }
    // @ts-ignore
    return new aaiPlugin[plugin] as T;
  }
}

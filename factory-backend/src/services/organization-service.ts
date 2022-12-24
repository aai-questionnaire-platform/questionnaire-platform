import { readFromFile } from '../aws-wrappers/read-file-from-bucket';
import { Organization, Organizations } from '../datamodels/organizations';
import { Locale } from '../Locale';

export class OrganizationService {
  constructor(public assetsBucketName: string) {}

  private ORGANIZATION_CONFIG_NAME: string =
    'organizations.json';

  /**
   * Get the organization tree registered for the MMK ripari service. Only finnish (fi-FI) supported right now.
   * @param locale The locale in fi-FI style.
   */
  async getOrganizations(
    locale: Locale = Locale.fi_FI
  ): Promise<Organizations> {
    try {
      //Get files from the config
      return await readFromFile<Organizations>(
        this.assetsBucketName,
        this.ORGANIZATION_CONFIG_NAME,
        locale
      );
    } catch (error) {
      console.error(
        'getOrganizations: Error occured while reading from file',
        this.assetsBucketName,
        this.ORGANIZATION_CONFIG_NAME,
        error
      );
      throw error;
    }
  }

  /**
   * Resolve the organization hierarchy from top node to the leaf node.
   * Will return a list of organization ids.
   * @param rootId
   * @returns
   */
  async resolveOrganizationHierarchyTo(rootId: string) {
    const { organizations } = await this.getOrganizations();
    return OrganizationService.traverseAndFormIdHierarchy(
      organizations,
      rootId
    );
  }

  /**
   * Recursively traverse organization tree from top to bottom and form an id hierarchy as a list of ids
   * @private
   * @param entities
   * @param leafId
   * @param memo
   */
  private static traverseAndFormIdHierarchy(
    entities: Organization[],
    leafId: string,
    memo: string[] = []
  ): string[] {
    const head = OrganizationService.findHeadNode(entities, leafId);

    if (!head) {
      return memo;
    }

    console.debug('Head found', head, 'appending to', memo);

    return head.children?.length
      ? OrganizationService.traverseAndFormIdHierarchy(head.children, leafId, [
          ...memo,
          head.id,
        ])
      : [...memo, head.id];
  }

  /**
   * Find a node containing leaf with given id
   * @private
   * @param nodes
   * @param leafId
   * @returns
   */
  private static findHeadNode(nodes: Organization[], leafId: string) {
    return nodes.find((head) => {
      if (head.id == leafId) {
        return head;
      }

      if (head.children) {
        const parent = OrganizationService.findHeadNode(head.children, leafId);
        if (parent) {
          return head;
        }
      }

      return undefined;
    });
  }
}

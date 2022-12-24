/**
 * Container structure to depict an organization
 */
export interface Organizations {
  name: string;
  organizations: Organization[];
}

/**
 * Represents an organization, e.g. "Hiippakunta"
 * The organization may define zero or more "children" e.g. Hiippakunta may have several seurakuntas below it,
 * which may define zero or more active "rippikoulus" beneath.
 */
export interface Organization {
  /**
   * Unique ID (perhaps non-readable) of the organization to be used e.g. to link to a map.
   */
  id: string;

  /**
   * Organization type (localized), e.g. "Hiippakunta", "Seurakunta", "Rippikouluryhmä"
   */
  type: string;

  /**
   * Organization name (localized), e.g. "Pohjois-Suomi", "Rovaniemi", "Juhannusryhmä 1"
   */
  name: string;

  /**
   * Children, if any, e.g. Hiippakunta -> number of seurakuntas -> number of rippikoulu groups
   */
  children?: Organization[];
}

export interface Group {
  id: string;
  name: string;
  parent_organization_id: string;
  /**
   * Last date until a group is valid (selectable)
   */
  valid_until: string;

  /**
   * First date until a group is valid (selectable)
   */
  valid_from?: string;
}

export interface PostGroupRequestBody extends Group {
  pin: string;
}

export type Groups = Group[];

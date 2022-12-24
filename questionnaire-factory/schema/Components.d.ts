/**
 * Component interface that each component that is to be used in app structure json must extend.
 */
interface Component {
  /**
   * Component type to map the component definition in app structure json to a React component
   */
  type: string;
  /**
   * Component properties passed to the corresponding React component
   */
  props: unknown;
  /**
   * Component's child components
   */
  children?: string | ComponentDefinition[];
}

type LoginProvider = 'cognito' | 'aai';

export interface LoginProps {
  /**
   * Login provider. Cognito for group admin, aai for player.
   */
  provider: LoginProvider;
  /**
   * To which path the user is redirected after a successful login
   */
  callbackUrl: string;
}

interface LoginButtonProps extends LoginProps {
  variant?: ButtonVariant;
}

export interface LinkProps {
  slug: string;
  external?: boolean;
}

interface ImageProps {
  src: string;
  width: number;
  height: number;
}

export type ButtonVariant = 'primary' | 'secondary' | 'flat';

interface Color {
  type: 'COLOR';
  /**
   * Color value in hex
   */
  value: string;
}

/**
 * Background image's size
 *   auto: center bottom aligned, repeats along y-axel
 * cover: center top aligned, covers the viewport zooming the image as necessary
 */
export type BackgroundImageSize = 'auto' | 'cover';

interface BackgroundImage {
  type: 'IMAGE';
  /**
   * Url to a background image
   */
  value: string;
  /**
   * Background size.
   * @see {@link BackgroundImageSize}
   */
  size?: BackgroundImageSize;
  /**
   * Background position
   * @example 'center bottom'
   */
  position?: string;
}

export type ColorOrBackgroundImage = Color | BackgroundImage;

/**
 * Method of registration. Currently just registration by pin code is supported.
 */
export type RegistrationMethod = 'PIN_CODE';

interface RegistrationProps {
  /**
   * Registration method
   * @see {@link RegistrationMethod}
   */
  method: RegistrationMethod;
  /**
   * Page background color/image
   */
  background?: ColorOrBackgroundImage;
}

export interface PinCodeRegistrationProps extends RegistrationProps {
  method: 'PIN_CODE';
  /**
   * Properties for the link button on the group preview screen
   */
  nextButton: LinkProps;
}

export interface RegistrationComponent extends Component {
  type: 'REGISTRATION';
  props: PinCodeRegistrationProps;
}

/**
 *  Component for rendering application front page
 *  Feature: FrontPage
 */
export interface FrontPageComponent extends Component {
  type: 'FRONT_PAGE';
  props: {
    /**
     * Page background color/image
     */
    background?: ColorOrBackgroundImage;
    /**
     * Props for the button for player login
     */
    playerLogin: LoginButtonProps;
    /**
     * Props for the button for group admin login
     */
    adminLogin?: LoginButtonProps;
    /**
     * Props for the contact email link
     */
    contactLink?: LinkProps;
  };
}

/**
 *  Component for rendering a questionnaire category view (card deck)
 *  Feature: Category
 */
export interface CategoryComponent extends Component {
  type: 'CATEGORY';
  props: {
    categoryStartCard: {
      /**
       * Url to an image to display on the starting card of each category.
       * If a category specific images are needed, one should consult docs for
       * instruction how to achieve this.
       */
      image?: string;
    };
    /**
     * Page background color/image
     */
    background?: ColorOrBackgroundImage;
    navigation?: {
      /**
       * Variant for buttons in the navigation
       */
      buttonVariant: ButtonVariant;
      /**
       * Font for buttons in navigation
       */
      font?: string;
    };
  };
}

/**
 * A feature that is shown after the last question in a category or exit message card if one is defined
 * Feature: CategoryEnd
 */
export interface CategoryEndComponent extends Component {
  type: 'CATEGORY_END';
  props: {
    /**
     * Page background color/image
     */
    background?: ColorOrBackgroundImage;
    /**
     * Image displayed on the bottom of the screen
     */
    image?: ImageProps;
    /**
     * Properties for the link button
     */
    link?: LinkProps;
  };
}

/**
 * A component for rendering a progress view (map)
 * Feature: Progress
 */
export interface ProgressComponent extends Component {
  type: 'PROGRESS';
  props: {
    /**
     * Page background color/image
     */
    background: ColorOrBackgroundImage;
    /**
     * Category marker properties
     */
    category: {
      /**
       * Category marker properties
       */
      categoryButton: {
        /**
         * Marker's target link
         * @example { slug: '/category' }
         */
        link: LinkProps;
      };

      /**
       * Answer summary marker properties
       */
      answerSummaryButton: {
        /**
         * Url to an icon rendered when a summary is not yet available (category not completed)
         * @example /my-app/locked-icon.svg
         */
        lockedIcon: string;
        /**
         * Url to an icon rendered when a summary available (category completed)
         * @example /my-app/active-icon.svg
         */
        activeIcon: string;
        /**
         * Url to an icon rendered when a summary is available and category is marked done
         * @example /my-app/locked-icon.svg
         */
        doneIcon: string;
        /**
         * Marker's target link
         * @example { slug: '/answersummary' }
         */
        link: LinkProps;
      };
    };

    feedback?: {
      link: LinkProps;
      image?: Partial<ImageProps>;
    };
  };
}

/**
 *  Component for rendering answer summary view
 *  Feature: AnswerSummary
 */
export interface AnswerSummaryComponent extends Component {
  type: 'ANSWER_SUMMARY';
  props: {
    /**
     * Configs for link button displayed on the bottom of the screen
     */
    backLink: LinkProps;
    /**
     * Page background color/image
     */
    background?: ColorOrBackgroundImage;
    /**
     * Image displayed on top of the list of AnswerSummaryCollapsibles
     */
    image?: string;
  };
}

/**
 *  Component rendering game end (feedback) view
 *  Feature: Feedback
 */
export interface FeedbackComponent extends Component {
  type: 'FEEDBACK';
  props: {
    background?: ColorOrBackgroundImage;
    links?: {
      primary?: LinkProps;
      secondary?: LinkProps;
    };
  };
}

/**
 * Component rendering group listing for group admin
 * Feature: AdminGroups
 */
export interface AdminGroupsComponent extends Component {
  type: 'ADMIN_GROUPS';
  props: {
    /**
     * Page background color/image
     */
    background?: ColorOrBackgroundImage;
    /**
     * Badge image/color shown in the header
     */
    headerLogo?: ColorOrBackgroundImage;
    /**
     * Variant used for all the buttons on this page
     */
    buttonVariant?: ButtonVariant;
  };
}

/**
 *  Component rendering category list for group admin
 *  Feature: AdminCategories
 */
export interface AdminCategoriesComponent extends Component {
  type: 'ADMIN_CATEGORIES';
  props: {
    /**
     * Properties for the link displayed in the header
     */
    headerBackLink: LinkProps;
    /**
     * Icons representing category statuses
     */
    icons: {
      lockedIcon: string;
      activeIcon: string;
      doneIcon: string;
    };
    /**
     * Page background color/image
     */
    background?: ColorOrBackgroundImage;
    /**
     * Variant used for all the buttons on this page
     */
    buttonVariant?: ButtonVariant;
  };
}

/**
 *  Component rendering answer summaries for group admin
 *  Feature: AdminAnswerSummary
 */
export interface AdminAnswerSummaryComponent extends Component {
  type: 'ADMIN_ANSWER_SUMMARY';
  props: {
    /**
     * Properties for the link displayed in the header
     */
    headerBackLink: LinkProps;
    /**
     * Page background color/image
     */
    background?: ColorOrBackgroundImage;
    /**
     * Variant used for all the buttons on this page
     */
    buttonVariant?: ButtonVariant;
  };
}

/**
 * @deprecated only to be used in hn-kysely game
 * Feature: HnFrontPage
 */
export interface HnFrontPageComponent extends Component {
  type: 'HN_FRONT_PAGE';
  props: {
    background?: ColorOrBackgroundImage;
    forwardLink: LinkProps;
  };
}

/**
 * @deprecated only to be used in hn-kysely game
 * Feature: HnCategory
 */
export interface HnCategoryComponent extends Component {
  type: 'HN_CATEGORY';
  props: {
    background?: ColorOrBackgroundImage;
  };
}

/**
 * @deprecated only to be used in hn-kysely game
 * Feature: HnResults
 */
export interface HnResultsComponent extends Component {
  type: 'HN_RESULTS';
  props: {
    background: ColorOrBackgroundImage;
    infoLink: string;
  };
}

/**
 * @deprecated only to be used in hn-kysely game
 * Feature: HnResults/HnSignInHandler
 */
export interface HnSignInHandler extends Component {
  type: 'HN_SIGN_IN_HANDLER';
  props: never;
}

export type ComponentDefinition =
  | string
  | FrontPageComponent
  | CategoryComponent
  | CategoryEndComponent
  | ProgressComponent
  | AnswerSummaryComponent
  | FeedbackComponent
  | AdminGroupsComponent
  | RegistrationComponent
  | AdminCategoriesComponent
  | AdminAnswerSummaryComponent
  | HnCategoryComponent
  | HnResultsComponent
  | HnFrontPageComponent
  | HnSignInHandler

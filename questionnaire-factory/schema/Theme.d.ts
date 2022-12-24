interface BaseColorSchema {
  // background shorthand/color
  bgColor: string;
  // font color
  fgColor: string;
}

type TextColor = Pick<BaseColorSchema, 'fgColor'>;

/**
 * Styles for Category card's answer options
 */
interface OptionColorSchema extends BaseColorSchema {
  // option border color
  border: string;
  // option shadow shorthand
  shadow?: string;
}

interface SpinnerButtonColorSchema extends BaseColorSchema {
  // spinner's color when a button is used as a loader button
  spinnerColor?: string;
}

interface PulseButtonColorSchema extends BaseColorSchema {
  // pulse animation color when button is used as a skeleton loader
  pulseColor?: string;
}

interface ButtonColorSchema<T = BaseColorSchema> {
  // button's default colors
  default: T;
  // button's colors when hovered/active
  active: T;
  // button's colors when disabeld
  disabled: T;
}

interface HeadingTheme {
  // heading font shorthand
  font?: string;
  // heading font weight
  weight?: string;
}

interface CommonThemeSchema extends BaseColorSchema {
  // body level font shorthand
  font: string;
}

interface PlayerFeatureBaseTheme extends Partial<TextColor> {
  playerAppHeader?: {
    // player app header logout button's color
    color: string;
  };
}

interface AnswerSummaryChartTheme {
  // default chart bar color
  default: string;
  // chart bar color when highlighted
  highlight: string;
  // chart bar description text's color
  text: string;
}

/**
 * Feature: FrontPage
 */
interface FrontPageTheme extends Partial<TextColor> {
  // hr element color
  divider: string;
}

/**
 * Feature: Category
 */
interface CategoryTheme extends PlayerFeatureBaseTheme {
  // category card's background and text color
  card: BaseColorSchema;
  categoryProgressTracker: {
    // category progress tracker's default colors
    default: BaseColorSchema;
    // category progress tracker's active step's colors
    active: BaseColorSchema;
  };
  option: {
    // answer option's colors when not selected
    default: OptionColorSchema;
    // answer option's colors when selected
    active: OptionColorSchema;
  };
}

type CategoryEndTheme = PlayerFeatureBaseTheme;

/**
 * Feature: Progress
 */
interface ProgressTheme extends PlayerFeatureBaseTheme {
  // Map's category buttons' colors and backgrounds
  progressButton: ButtonColorSchema<PulseButtonColorSchema>;
  // Map's skeleton loader's color and background
  skeleton?: BaseColorSchema;
  // font shorthand for Progress page
  font?: string;
}

/**
 * Feature: AnswerSummary
 */
interface AnswerSummaryTheme extends PlayerFeatureBaseTheme {
  // answer summary chart's colors
  chart: AnswerSummaryChartTheme;
  // colors for answer summary's question collapsibles
  list?: BaseColorSchema;
}

interface AdminCategoryListItemTheme extends BaseColorSchema {
  // border color for an active category
  activeBorder: string;
}

interface AdminFeatureBaseTheme extends Partial<TextColor> {
  // admin page header component's colors
  header: Partial<BaseColorSchema> & { border?: string };
}

/**
 * Feature: AdminCategories
 */
interface AdminCategoriesTheme extends AdminFeatureBaseTheme {
  // hr element's color
  divider: string;
  // color for the line connecting category icons
  dashedLine: string;
  // category list item's colors and background
  categoryListItem: AdminCategoryListItemTheme;
}

/**
 * Feature: AdminGroups
 */
interface AdminGroupsTheme extends AdminFeatureBaseTheme {
  // hr element colors
  divider: string;
  // text color and background for group list items
  groupListItem: BaseColorSchema;
  // color and background for active categories list
  activeCategoryListItem: BaseColorSchema;
  // heading text color
  heading?: TextColor;
}

/**
 * Feature: AdminAnswerSummary
 */
interface AdminAnswerSummaryTheme extends AdminFeatureBaseTheme {
  // text color and background for answer summary list collapsibles
  adminAnswerSummaryListItem: BaseColorSchema;
  // colors for summary chart bars and such
  chart: AnswerSummaryChartTheme;
}

interface HnResultsTheme {
  linkButton: BaseColorSchema;
  socialMediaInfo: TextColor;
  infoLink: TextColor;
}

export interface Theme {
  /**
   * Common "body level" color definitions
   */
  common: CommonThemeSchema;
  //
  // Atom/molecule level themes
  //
  divider: string;
  flatButton: ButtonColorSchema<Omit<BaseColorSchema, 'bgColor'>>;
  heading?: HeadingTheme;
  primaryButton: ButtonColorSchema<SpinnerButtonColorSchema>;
  secondaryButton: ButtonColorSchema<SpinnerButtonColorSchema>;
  //
  // Template level themes
  //
  adminAnswerSummary?: AdminAnswerSummaryTheme;
  adminCategories?: AdminCategoriesTheme;
  adminGroups?: AdminGroupsTheme;
  answerSummary?: AnswerSummaryTheme;
  category?: CategoryTheme;
  categoryEnd?: CategoryEndTheme;
  frontPage?: FrontPageTheme;
  progress?: ProgressTheme;
  results?: HnResultsTheme;
}

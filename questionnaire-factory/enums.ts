export enum CategoryState {
  LOCKED = 1, //    Locked category, not playable just yet
  UNLOCKED = 2, //  Unanwered, unlocked category
  COMPLETED = 3, // Completed category (there are answers to it)
  APPROVED = 4, //  Approved category
}

export enum AuthorizationScopes {
  PLAY = 'mmk-rs/questionnaire:play',
  APPROVE = 'mmk-rs/questionnaire:approve',
}

/**
 * Card type in card deck
 * QUESTION: A card with a question and set of answer options
 * CHANT: A card displaying a chant or other message
 * CATEGORY_COMPLETED: A card displaying an exit message and a button for
 *                     returning back to  the map page
 */
export enum CardType {
  QUESTION = 'CARD_TYPE_QUESTION',
  CHANT = 'CARD_TYPE_CHANT',
  CATEGORY_COMPLETED = 'CARD_TYPE_CATEGORY_COMPLETED',
}

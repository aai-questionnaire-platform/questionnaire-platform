const { getAllTypes } = require('./common.js');

module.exports = {
  /**
   * Handler for the list-types command. Reads all the type props from schema/Components.d.ts file and outputs the result.
   */
  listTypes() {
    console.log('All available types:\n');
    console.log(getAllTypes());
  },
};

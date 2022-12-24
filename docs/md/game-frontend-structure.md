# Game frontend structure

Game structure is customized with a `<game name>-app.json` file. This file defines game’s meta information, routes, and components with their props that are rendered when user navigates to routes. The structure files are located in the questionnaire-factory project’s `assets`-folder.
Types of components that can be used in the json file can be found from the questionnaire-factory project’s `schema/Components.d.ts` file and other parts of the schema from `schema/AppStructure.ts` file.

Example of a app structure file:

```json
{
  "$schema": "../schema/AppStructure.json",
  // game level meta information
  "meta": {
    // game's primary title
    "title": "Mun testi",
    // game's language
    "lang": "fi"
  },
  // all the routes this application contains
  "routes": [
    {
      // url pathname
      "path": "/",
      // route level meta information
      "meta": {
        // route's title
        "title": "Etusivu",
        // authentication properties
        // when false, the route is public
        "auth": false
      },
      // children rendered for this route
      "children": [
        {
          // type of the component
          "type": "FRONT_PAGE",
          // component props, see Components.d.ts for available props
          "props": {
            "background": {
              "type": "COLOR",
              "value": "#e5e5e5"
            }
            // ... more props
          }
        }
      ]
    }
    // ... more routes
  ]
}
```

> _**NOTE**_: The name of the file is meaningful! Game's base path is derived from the file name. For example, if the name of the structure file is `my-game.app.json` then it’s root path is `https://my-url/my-game` and route paths in the structure file are relative to that.

## Adding new types or modifying existing

Instructions for how to add new components are found `[link removed]`. To modify the existing schema, only follow parts of the instructions suitable.

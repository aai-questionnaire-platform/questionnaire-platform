# Theming games

## Game level theming

Game specific themes, mostly colors and fonts, are defined in theme files in the `questionnaire-factory`'s `assets` folder. Theme files follow the naming convention of `<game name>.theme.json`. Each file follows Theme json schema, so the file is validated, and auto suggestions are enabled while typing when a suitable IDE is used.

### App json

Feature backgrounds are defined in the `<game name>.app.json` file as component props. There are two options:

1. Background color:
   ```json
   "background": {
     "type": "COLOR",
     "value": "<color's hex code>"
   }
   ```
2. Background image:
   ```json
   "background": {
      "type": "IMAGE",
      "value": "<image url>",
      "size": "<auto | cover>"
    }
   ```

### Theme file

The theme.json file should follow the following guidelines:

- the name of the file must be `<game name>.theme.json`, game name being the same as the game name in the app structure json file's name
- body level styles should be under common section
- feature specific styles should be listed under a key that corresponds to the feature component's name (e.g., AdminGroups -> adminGroups)
- same applies to subcomponents listed under feature's style block (GroupListItem -> groupListItem)
- fgColor is text color, bgColor background color/background shorthand

```json
{
  "$schema": "../schema/Theme.json",
  // body level styles
  "common": {
    "fgColor": "<text color>",
    "bgColor": "<body background color>",
    "font": "<common font>"
  },

  // atom level component themes, e.g.
  "heading": {
    "font": "<heading font>",
    "weight": "<heading weight>"
  },

  // and definitions for buttons (primary/secondary/flat)
  "primaryButton": {
    "default": {
      "bgColor": "<button background>",
      "fgColor": "<button text color>",
      // some buttons display a spinner while loading
      "spinnerColor": "<button spinner color>"
    },
    "active": {
      "bgColor": "<button background while hovered/active>",
      "fgColor": "<button text color while hovered/active>"
    },
    "disabled": {
      "bgColor": "<button background> while disabled",
      "fgColor": "<button text color while disabled>"
    }
  },

  // ...

  // feature level component definitions. e.g.
  {
    "frontPage": {
    "fgColor": "<front page text color>",
    "divider": "<front page hr element color>"
  },

  "adminGroups": {
    // common admin group page styles
    "fgColor": "<page text color>",
    "heading": {
      "fgColor": "<page heading text color>"
    },
    // sub component styles
    "groupListItem": {
      "fgColor": "<list item's text color>",
      "bgColor": "<list item's background>"
    },
    // ...
  }
}
```

All the possible definitions can be checked from the `schema/Theme.d.ts` file.

## Category level styles

All the category level styles (background image/color) must be bundled with the category data that comes from Webiny to correctly link the category id with styling. There are few fields that can be used for this purpose. For now, those fields cannot be edited using the Admin UI so changes must be made manually.

## Modifying the theme

When adding new features, please follow `[link removed]` instructions. When modifying the existing schema, please follow `[link removed]` instructions.

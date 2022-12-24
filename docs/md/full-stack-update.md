# How to fully update dev/test/etc. environment

These instructions are a checklist for updating dev/test/etc. environment. Feel free to skip stacks without changes for faster deployment.

## Admin stack (admin-infrastructure/admin-backend/admin-frontend)

---

### dev

The latest version is automatically deployed to the dev environment when changes are pushed to the dev branch. If, however, one can deploy some local changes with the following steps:

1. deploy the admin-infrastructure stack `[link removed]`
1. deploy the admin-backend stack `[link removed]`
1. deploy the admin-front stack `[link removed]`

### test

1. deploy the admin-infrastrucure stack using `[link removed]`
1. deploy the admin-backend stack using `[link removed]`
1. deploy the admin-backend stack using `[link removed]`

<br />

> **_NOTE:_** After updating infra/backend one should check that CORS headers are correctly set. If requests fail for CORS errors, then fix them following `[link removed]` instructions!

<br />

### Webiny-model updates

If there is changes in structure of webiny models used by admin-backend/admin-frontend (for example new fields), models should be updated to target webiny-environment when updating admin-backend/admin-frontend stacks. Possible updates are:

- own webiny -> dev webiny (when merging feature branch to dev)
- dev webiny -> test webiny (when deploying to test)
- test webiny -> prod webiny (when deploying to production)

Model updates can be done with script `[link removed]`

When updating models into test-environment, it is recommended to export models into file and import them into target environment from that file. File should be named as "models-[export-date].json" and stored at admin-backend/scripts/webiny/models/.

There are also other scripts for handling webiny-models (updating/exporting/importing model content), instructions for all webiny-related scripts can be found here: `[link removed]`

<br />

## Game stack aka. questionnaire factory (factory-infra/factory-backend/questionnaire-factory)

---

Each game has its own stack so instead of environment name being dev/test, it's `<game name>-<env>`, for example `surupolku-dev`. Each game affected by changes need to be deployed separately (that is, in most cases, every game).

### dev

The latest version is automatically deployed to the dev environment when changes are pushed to the dev branch. If, however, one can deploy some local changes with the following steps:

1. deploy the factory-infra stack manually `[link removed]` or using `[link removed]`
1. deploy the factory-backend stack manually `[link removed]` or using `[link removed]`
1. deploy the game front/questionnaire-factory stack manually (starting from step from 4) `[link removed]` or using `[link removed]`

### test

1. deploy the admin-infrastrucure stack using `[link removed]`
1. deploy the admin-backend stack using `[link removed]`
1. deploy the game front/questionnaire-factory stack using `[link removed]`

<br />

> **_NOTE:_** If there were changes that caused a new assets bucket to have been created then follow `[link removed]` to create organizations and, optionally, questionnaire. It's also possible to just copy the files from the previous assets bucket using preferred tool (aws console/aws cli/hands)

> **_NOTE:_** After updating infra/backend one should check that CORS headers are correctly set. If requests fail for CORS errors, then fix them following `[link removed]` instructions!

<br />

## Dashboard (dashboard-backend/dashboard-frontend)

---

### dev

The latest version is automatically deployed to the dev environment when changes are pushed to the dev branch. If, however, one can deploy some local changes with the following steps:

1. deploy the dashboard-backend stack (how?)
1. deploy the dashboard-frontend stack`[link removed]`

### test

1. deploy the dashboard-backend stack using `[link removed]`
1. deploy the dashboard-frontend stack using `[link removed]`

<br />

> **_NOTE:_** After updating infra/backend one should check that CORS headers are correctly set. If requests fail for CORS errors, then fix them following `[link removed]` instructions!

<br />

## Order (order-infra/order-backend/order-frontend)

---

### dev

There is no dev environment for order application

### test

1. deploy the order-infrastrucure stack using `[link removed]`
1. deploy the order-backend stack using `[link removed]`
1. order-frontend stack using `[link removed]`

<br />

> **_NOTE:_** After updating infra/backend one should check that CORS headers are correctly set. If requests fail for CORS errors, then fix them following [these](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors-console.html) instructions!

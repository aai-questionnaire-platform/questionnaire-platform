# Order Frontend

This project is dependant on `order-backend`.
This repo should deploy automatically to dev envrionemnt upon pushing to dev branch.

## How to run locally

This assumes `order-backend` is already deployed in `dev` environment and CORS has been enabled on all API endpoints.

1. Generate environment variables `./generate-env.sh -e dev -f .env.development -l`
1. `npm start`

## How to deploy manually

Replace [env] with the desired environment. This assumes you have `order-backend` already deployed in desired environment and CORS enabled on all API endpoints (see `order-infra` README for instructions).

1. Deploy aws stack `cdk deploy OrderFrontend-ENV`
1. Generate environment variables by running `./generate-env.sh -e ENV`. This will fetch
1. Build react app `npx env-cmd -f .env.[env] craco build`
1. Move built app to S3 `aws s3 sync ./build/ s3://order-frontend-[env] --delete`
1. Invalidate CloudFront cache `./scripts/clear-cdn-cache.sh -e ENV`

---

## Generating the env files to point to backend APIs

To generate an env file with most recent address of the API in specific environment, run the tool generate-env.sh.

`./generate-env.sh -e [environment] -f [filename] [-l for local development]`

For local development, use your own env/backend-stack:

`./generate-env.sh -e [your own env] -f .env.development -l`

AAI callback-urls should match so using dev-backend+localhost is not recommended anymore

You can manually insert REACT_APP_API_HOST=endpoint-http/https address to .env.development and then build the frontend to use your own backend address.

## Deploying to environments

Deploying to dev and test environments is done by running the script:

`./scripts/deploy-stack.sh -e [dev/test]`

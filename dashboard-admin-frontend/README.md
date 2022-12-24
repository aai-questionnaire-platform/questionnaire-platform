# Dashboard admin frontend

- you need to have aws credentials setup
- you need to have dashboard admin backend and infrastructure stacks setup for your desired environment
- run `./generate-env.sh -e [env]` to fetch cognito hosted ui url and api url
- run `npm start` to start the application

# Authentication flow

- when you try to load any content from backend, app checks localstorage for access key
- if no access key is found or backend responds to a request with something other than 200 status, user is redirected to cognito hosted ui login
- after successful cognito login, user is redirected to /login route with access token in url parameters
- access token is then saved to localstorage to be used in subsequent requests

# Deploy

- run `./scripts/deploy-stack.sh -e [env]`

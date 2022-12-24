# AAI-login

AAI-authentication is implemented according to Oauth2-protocol. In order-application authentication is made using simple-oauth2-library and handling necessary redirects manually. Questionnaire factory uses next-auth-library (more details here: [Adding logins to a game](adding-logins-to-game.md))

If AAI-coreservice apis are needed, api-calls should be made with Authorization-header with value of access_token obtained from oauth2 token-endpoint.

# AAI-authentication

If application needs permission to read or store AAI user attributes, they should be added to scope-parameter of Oauth2-requests. For example scope: 'demo_flag' means that user requests permission to read attribute demo_flag and scope: 'store:demo_flag' is for storing value of that attribute.

AAI-login asks permission for all attributes mentioned in scope on first login, and remembers answers for later use. Selected permissions can be changed later on AAI profile settings.

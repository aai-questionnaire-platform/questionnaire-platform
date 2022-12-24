# Saving user attribute

Attribute is key value pair that is stored to AuroraAI (later AAI) connected service. Questionnaire service generates the attribute when a new record appears in Answers table and saves in to Attributes table in DynamoDB.

# Sharing user attribute

Attribute is shared to other AAI connected services via Profile API that is queried by AuroraAI core component.

At the moment Questionnaire service implements GET and DELETE user_attributes endpoints from API: https://auroraai.astest.suomi.fi/api-doc/auroraai-service/#/Profile%20management. AuroraAI core component uses JWT token to specify user id and authenticate the requests.

When the user attribute is saved, Questionnaire service notifies the AAI core component that user attribute is available - https://auroraai.astest.suomi.fi/api-doc/core-components/#/Profile%20management/patch-user_attributes

End user can grant permission to share the attribute with AAI network when the user logs in to a questionnaire. Permissions can be viewed and modified in AAI core components user interface. Test version of core components user interface is available at https://auroraai.astest.suomi.fi/.

# Reading user attributes

Correct permissions for AAI-attributes should be granted on authentication, and access_token for api-calls should be used. For more information see: [AAI-authentication and permissions](aai-authentication-and-permissions.md)

User attributes can be read from AAI-core components api (https://auroraai.astest.suomi.fi/api-doc/core-components/#/Profile%20management/get-user_attribute). There are 2 endpoins available, one for reading all available attributes (all_authorized) and one for specific attribute name. Authorization-header with access_token obtained from oauth2-token-endpoint should be used on api-calls.

When user attribute is fetched, call from AAI-core component is redirected to api that is responsible for providing user attribute.

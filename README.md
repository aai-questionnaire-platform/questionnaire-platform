Here you can find source codes produced in AuroraAI MMK-project, purpose for this repository is to provide codes and examples for people working with AuroraAI in future projects. You can find examples of integrations with AuroraAI core components (login, user attributes, service recommendations) and also CMS-based factory for producing customizable questionnaires.

General description of applications included:

- Questionnaire factory, which provides mechanism to build and deploy customizable questionnaires where content can be edited with separate admin application
- Dashboard, which shows content and service recommendations from AuroraAI PTV API
- Order-application, which was used in "Huolehtivat nuoret"-pilot, where users were able to order services paid with Kela wallet-API

Applications are based on AWS and each project contains codes for one CloudFormation-stack built with Infrastructure as Code-approach, one application can therefore contain multiple projects/stacks. Some environment specific parts or sensitive information are removed, but basic functionalities are left untouched.

More information can be found from project-specific readme-files and from docs-folder.
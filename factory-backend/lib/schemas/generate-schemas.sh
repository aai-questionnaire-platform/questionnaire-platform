#!/bin/sh
typescript-json-schema --required --strictNullChecks ../../src/datamodels/answer-set.ts AnswerSet > answer-set.json
typescript-json-schema --required --strictNullChecks ../../src/datamodels/answer-sets.ts AnswerSets > answer-sets.json
typescript-json-schema --required --strictNullChecks ../../src/datamodels/questionnaire.ts Questionnaire > questionnaire.json
typescript-json-schema --required --strictNullChecks ../../src/datamodels/organizations.ts Organizations > organizations.json
typescript-json-schema --required --strictNullChecks ../../src/datamodels/answer-summary.ts AnswerSummary > answersummary.json
typescript-json-schema --required --strictNullChecks ../../src/datamodels/progress.ts Progress > progress.json
typescript-json-schema --required --strictNullChecks ../../src/datamodels/organizations.ts PostGroupRequestBody > newgrouprequest.json
typescript-json-schema --required --strictNullChecks ../../src/datamodels/organizations.ts Groups > groups.json
typescript-json-schema --required --strictNullChecks ../../src/datamodels/error-response.ts ErrorResponse > errorresponse.json
typescript-json-schema --required --strictNullChecks ../../src/datamodels/group-member.ts PostGroupMemberRequestBody > postgroupmemberrequest.json

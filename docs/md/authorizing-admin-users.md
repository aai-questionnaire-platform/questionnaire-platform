# Authorizing admin users

In order to view or edit a game using the admin UI an admin user must have correct game_uuids set. To grant access to a game, a new admin user must be created or an existing user's game_uuids must be updated.

## Prerequisities

1. Find the correct Cognito user pool ID (`<user-pool-id>`) from AWS console `[link removed]`
1. Find the correct gameUuid from the `questionnaire-factory-instances` in `./cdk.json`
1. cd to `admin-backend` projects's folder

## Create a new user

To create a new user that has access rights to a game, run

```
./scripts/add-user.sh -p <user-pool-id> -u <user-name> -g <game-uuid>
```

> **_NOTE_**: The script outputs the temporary password used to login the first time so it should be memorized/saved! The user is promted to change the temporary password after the first login.

## Authorize an existing user

To update game_ids of an existing user, run:

```
./scripts/update-user.sh -p <user-pool-id> -u <user-name> -g <game-uuid>
```

> **_NOTE_**: Currently this will overwrite the existing gameUuid value! This behavior is to be fixed in the future.

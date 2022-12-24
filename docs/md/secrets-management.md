# Storing AAI login secrets

Secrets required for AuroraAI logins are stored in an encrypted file `./.aailogins`. Encryption/decryption is handled with [git-secret](https://git-secret.io/) tool.

## Adding new team members

When a new team member needs to access to the file they should ask for a team member with existing access to add them to the secrets repo. The team member requesting access should then [create a gpg key](https://git-secret.io/#using-gpg) with following steps:

1. Create a RSA key-pair
   ```
   gpg --gen-key
   ```
1. Export the public key to a file
   ```
   gpg --armor --export your.email@address.com > public-key.gpg
   ```
1. Send the public key to the member with existing access to the secrets repo

After which the team member with access to the secrets repo should follow [these instructions](https://git-secret.io/#usage-adding-someone-to-a-repository-using-git-secret) to set up access.

## Revealing secrets

After access is granted secrets can be revealed running

```
git secret reveal
```

## Editing secrets

1. Reveal the secrets
1. Edit the secret file
1. Re-encrypt the files. The `-d` handle removes the decrypted file and is optional.
   ```
   git secret hide [-d]
   ```
1. Commit and push changes to git

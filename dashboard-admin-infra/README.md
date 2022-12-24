## Deploy stack

```
$ ./scripts/deploy-stack.sh -e <stack-short-name>
```

or

```
cdk deploy DashboardAdminInfraStack-[env]
```

# Creating admin users

- run `./scripts/create-user.sh -e [env] -m [desired@mail.com]`
- aws will send an email to the specified address with automatically generated password
- user will need to login with that password the first time and change it to something else

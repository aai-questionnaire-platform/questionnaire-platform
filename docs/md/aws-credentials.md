# Setting environment variables for AWS account

AWS cli needs to have credentials and region config set up before it can be used. More info can be found [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html). Access key id and secret can be found from or generated in AWS console (IAM -> Users -> [your username] -> Security credentials).

## Using AWS cli configure

Necessary configuration files can be quickly created using the configure command.

```
$ aws configure
```

## Using profiles

1. add variables to the `.aws/credentials` file

   ```
   [default]
   aws_access_key_id = <your aws secret key>
   aws_secret_access_key = <your aws secret access key>
   region = <aws region>
   ```

1. set the profile active

   ```bash
   export AWS_PROFILE=default
   ```

## Using exports

```bash
export AWS_DEFAULT_REGION=<aws region>
export AWS_ACCESS_KEY_ID=<your aws secret key>
export AWS_SECRET_ACCESS_KEY=<your aws secret access key>
```

# Using multiple profiles

If multiple profiles are needed e.g. for dev and prod then profiles should be used.

1. add new profile for prod. For example:

   _.aws/credentials_

   ```
   [default]
   aws_access_key_id = <your aws secret key>
   aws_secret_access_key = <your aws secret access key>
   region = <aws region>

   [aai-prod]
   aws_access_key_id = <your prod aws secret key>
   aws_secret_access_key = <your prod aws secret access key>
   region = <aws region>
   ```

2. profile can be changed with
   ```bash
   export AWS_PROFILE=aai-prod
   ```

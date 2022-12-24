# Deploy stack

1. Run npm install in root- and src-folders
1. Deploy the stack

   ```
   $ ./scripts/deploy-stack.sh -e <env>
   ```

1. Upload service providers file to s3

   ```
   $ ./scripts/deploy-data-file-to-assets.sh -e <env> -f serviceProviders.json`
   ```

## Good to know

- This backend is serving `order-frontend`
- `order-frontend` POSTs a form to this backend
- Form fields on this form are mapped to correct labels using `./assets/contactDetailsLabels.json`
- These labels are used in an email that is sent after said form submission

## Updating service providers

- If you need to make changes to the service provider's contact details, edit the file in ./assests/serviceProviders.json
- Re-upload file in question to S3

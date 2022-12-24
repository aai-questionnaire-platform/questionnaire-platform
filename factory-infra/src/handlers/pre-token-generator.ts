export const preTokenGenerator = async (
  event: any,
  context: any,
  callback: any
): Promise<any> => {
  console.debug("preTokenGenerator(): handling", JSON.stringify(event));

  const response = {
    ...event.response,
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        organization_ids: event.request.userAttributes["custom:organization_ids"],
      },
    },
  };

  console.debug(
    "preTokenGenerator(): returning",
    JSON.stringify({ ...event, response })
  );

  callback(null, { ...event, response });
};

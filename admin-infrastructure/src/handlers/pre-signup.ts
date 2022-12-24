export const preSignupHandler = async (event: any): Promise<any> => {
  try {
    event.response.autoConfirmUser = true;
    return event;
  } catch (error) {
    console.error("Pre-signup processing failed", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: {
        statusCode: 500,
        message: "Pre-signup processing failed. Couldn't confirm the account.",
      },
    };
  }
};

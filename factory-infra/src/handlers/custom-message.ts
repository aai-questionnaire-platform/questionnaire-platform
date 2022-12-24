export const customMessageHandler = async (event: any, context: any) => {
  if (event.triggerSource === 'CustomMessage_AdminCreateUser') {
    event.response.emailSubject = `[REMOVED]`;
    event.response.emailMessage = `
      [REMOVED]
      `;
  }

  return event;
};

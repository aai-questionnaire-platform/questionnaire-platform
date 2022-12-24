import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { omit } from 'ramda';
import logger from '../services/log-service';
import { findOrders, saveOrder } from '../services/order-service';
import { handlePayment } from '../services/wallet-service';
import { OrderDto } from '../types';
import { sendEmail } from './email/sendEmail';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from './responses';
import { getUserIdFromAuthHeader } from './utils';

export const postOrder = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const userId = getUserIdFromAuthHeader(event.headers);
    if (!userId) {
      return unAuthorizedResponse();
    }

    const body = JSON.parse(event.body!) as OrderDto;

    const orders = await findOrders(userId);
    const alreadyOrdered = orders.some((i) => i.serviceId === body.serviceId);

    if (alreadyOrdered) {
      return serverErrorResponse(new Error('Service already ordered'));
    }

    // TODO: Change balance if needed
    const paymentResponse = await handlePayment(body.serviceId, userId, 1);

    if (!paymentResponse) {
      return serverErrorResponse(new Error('Payment not confirmed'));
    }

    const { kelaWalletId, paymentRequestId } = paymentResponse;

    logger.info(
      `Saving order for user ${userId}, service ${body.serviceId}, KELA wallet id ${kelaWalletId}, payment request id ${paymentRequestId}`
    );

    const updatedOrder = await saveOrder(
      userId,
      body.serviceId,
      kelaWalletId,
      paymentRequestId
    );

    // create email for service providers
    await sendEmail({
      serviceId: body.serviceId,
      contactDetails: body.contactDetails,
    });

    // Omit kelaWalletId as it shouldn't be exposed to the client
    return successResponse(omit(['kelaWalletId'], updatedOrder));
  } catch (error) {
    logger.error('Error', error);
    return serverErrorResponse(error as Error, 'Failed to submit order:');
  }
};

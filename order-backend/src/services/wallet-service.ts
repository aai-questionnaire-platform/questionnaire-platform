import { RestConnector } from '../api/rest/rest-connector';
import servicesList from './get-services-response';
import { scanWalletTable } from '../aws-wrappers/scan-table';
import logger from './log-service';

const kelaApiUrl = 'removed';

export async function handlePayment(
  serviceId: string,
  userId: string,
  balanceToUse: number = 1
) {
  logger.info(
    `Handling payment for user ID: ${userId} using service ${serviceId}`
  );

  const walletId = await getWalletIdFromTable(userId);
  if (!walletId) {
    throw new Error('Wallet not found');
  }

  const balance = await getBalance(walletId);
  if (!balance) {
    logger.error(`No Balance for KELA wallet id ${walletId}`);
    throw new Error('Wallet has no balance');
  }

  const service = servicesList.find((s) => s.id === serviceId);
  if (!service || !service.merchantName) {
    throw new Error('Service with merchant name not found');
  }

  const merchantId = await getMerchantId(service.merchantName);
  if (!merchantId) {
    throw new Error('Merchant not found');
  }

  const paymentRequest = await createPaymentRequest(
    walletId,
    merchantId,
    balanceToUse
  );

  logger.info(
    `Creating payment request, wallet id: ${walletId}, merchant id: ${merchantId}, using ${balanceToUse} of balance.`
  );

  const paymentRequestId = paymentRequest?.output?.linearId?.id;
  if (!paymentRequestId) {
    throw new Error(
      `Payment request not created: ${JSON.stringify(paymentRequest)}`
    );
  }

  const confirmResponse = await confirmPayment(paymentRequestId);

  if (confirmResponse.status !== 'OK') {
    throw new Error('Payment not confirmed');
  }

  logger.info(
    `Summary for handling of KELA payment: User ID: ${userId}, Wallet balance: ${balance}, Service: ${service}, Merchant ID: ${merchantId}`
  );

  return { kelaWalletId: walletId, paymentRequestId };
}

async function getWalletIdFromTable(userId: string) {
  const tableName = process.env.WALLET_TABLE_NAME as string;
  const wallets = await scanWalletTable(tableName);

  const entryWithUserId = wallets.find((i) => i.user_id === userId);

  return entryWithUserId?.wallet_id;
}

async function getBalance(walletId: string) {
  const xApiKey = process.env.X_API_KEY as string;
  const restConnector = new RestConnector(kelaApiUrl, null);
  const response = await restConnector.get(`accounts/${walletId}`, {
    'x-api-key': xApiKey,
  });
  const data = await response.json();
  const quantity = data?.balance_info[0]?.quantity;
  return quantity ? Number(quantity) : undefined;
}

async function getMerchantId(name: string) {
  const adminXApiKey = process.env.ADMIN_X_API_KEY as string;
  const restConnector = new RestConnector(kelaApiUrl, null);
  const response = await restConnector.get('admin/account/merchants', {
    'x-api-key': adminXApiKey,
  });
  const data = await response.json();

  return data[name];
}

async function createPaymentRequest(
  payerAccountId: string,
  receiverAccountId: string,
  amount: number
) {
  const xApiKey = process.env.X_API_KEY as string;
  const restConnector = new RestConnector(kelaApiUrl, null);
  const response = await restConnector.post(
    'paymentrequest',
    { 'x-api-key': xApiKey },
    JSON.stringify({ payerAccountId, receiverAccountId, amount })
  );
  return await response.json();
}

async function confirmPayment(paymentRequestId: string) {
  const xApiKey = process.env.X_API_KEY as string;
  const restConnector = new RestConnector(kelaApiUrl, null);
  const response = await restConnector.post(
    'reimbursements',
    { 'x-api-key': xApiKey },
    JSON.stringify({ paymentRequestId })
  );
  return await response.json();
}

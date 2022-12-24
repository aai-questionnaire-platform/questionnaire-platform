import * as R from 'ramda';
import { Order, Service, ServiceDto } from '../types';
import servicesList from './get-services-response';
import * as logger from './log-service';
import { findOrders } from './order-service';

export async function getServices(userId: string) {
  const services = await listServices();
  logger.info('Found', services.length, 'service(s)');
  const orders = await findOrders(userId);
  return resolveAvailability(services, orders);
}

async function listServices() {
  return servicesList;
}

const findByServiceId = (id: string, list: Order[]) =>
  list.find(R.propEq('serviceId', id));

const isAvailable = (id: string, list: Order[]) => !findByServiceId(id, list);

function resolveAvailability(
  services: Service[],
  orders: Order[]
): ServiceDto[] {
  return services.map((service) => ({
    ...service,
    available: isAvailable(service.id, orders),
  }));
}

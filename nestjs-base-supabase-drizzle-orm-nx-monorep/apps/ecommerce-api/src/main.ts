import { bootstrapApi } from '@/bootstrap-api';
import { EcommerceApiModule } from './ecommerce-api.module';

bootstrapApi(EcommerceApiModule, {
  description:
    'Customer ecommerce API documentation for health and authentication endpoints.',
  portConfigKey: 'ECOMMERCE_API_PORT',
  title: 'Ecommerce API',
});

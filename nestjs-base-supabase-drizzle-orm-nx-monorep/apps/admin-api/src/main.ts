import { bootstrapApi } from '@/bootstrap-api';
import { AdminApiModule } from './admin-api.module';

bootstrapApi(AdminApiModule, {
  description:
    'Admin API documentation for health, authentication, and backoffice user endpoints.',
  portConfigKey: 'ADMIN_API_PORT',
  title: 'Admin API',
});

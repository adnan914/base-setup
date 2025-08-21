import { Injectable } from '@nestjs/common';
import { Discoverable } from '../../common/decorators/discoverable.decorator';

@Discoverable('reporting')
@Injectable()
export class ReportsService {
    list() {
        return [{ id: 1, title: 'System Health' }];
    }
}

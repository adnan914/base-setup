import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsController {
    constructor(private readonly svc: ReportsService) { }
    @Get()
    list() { return this.svc.list(); }
}

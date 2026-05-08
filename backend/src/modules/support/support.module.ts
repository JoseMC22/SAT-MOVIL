import { Module } from '@nestjs/common';
import { SupportController } from './infrastructure/support.controller.js';

@Module({
    controllers: [SupportController],
})
export class SupportModule { }

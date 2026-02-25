import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { RmqModule } from '../../core/rmq/rmq.module';

@Module({
  imports: [RmqModule.register({ name: 'MAIL_SERVICE' })],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern('send_welcome_email')
  async handleWelcomeEmail(
    @Payload() data: { email: string; name: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.mailService.sendWelcomeEmail(data.email, data.name);
      channel.ack(originalMsg);
    } catch (error) {
      // If something goes wrong, we could decide to nack or just log
      // Based on the user's logs, they were negative acknowledged by default before
      console.error('Error processing welcome email:', error);
      channel.nack(originalMsg, false, false); // Don't requeue if it failed logic
    }
  }

  @EventPattern('send_otp_email')
  async handleOtpEmail(
    @Payload() data: { email: string; otp: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.mailService.sendOtpEmail(data.email, data.otp);
      channel.ack(originalMsg);
    } catch (error) {
      console.error('Error processing OTP email:', error);
      channel.nack(originalMsg, false, false);
    }
  }
}

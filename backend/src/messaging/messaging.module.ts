import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { TermiiService } from './termii.service';
import { EmailService } from './email.service';

@Module({
  providers: [FirebaseService, TermiiService, EmailService],
  exports: [FirebaseService, TermiiService, EmailService],
})
export class MessagingModule {}

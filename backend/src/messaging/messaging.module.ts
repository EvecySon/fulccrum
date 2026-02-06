import { Module } from '@nestjs/common';
import { TermiiService } from './termii.service';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [TermiiService, FirebaseService],
  exports: [TermiiService, FirebaseService],
})
export class MessagingModule {}

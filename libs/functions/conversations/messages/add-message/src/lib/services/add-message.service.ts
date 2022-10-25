import { BaseMessage, RawMessageData } from '@app/model/convs-mgr/conversations/messages';

/**
 * Base class that defines the methods for adding messages from various platforms e.g. whatsapp, telegram
 * Each child class will have its own implementation based on its docs
 */
export abstract class AddMessageService<T> {

  constructor() {}

  /** Main method that will call the appropriate add method depending on the Message type received.*/
  abstract addMessage(msg: RawMessageData, channel: T): void;

}
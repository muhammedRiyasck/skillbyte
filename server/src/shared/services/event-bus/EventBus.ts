import { EventEmitter } from 'events';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
  PaymentFailedEvent,
} from './PaymentEvents';

// Centralized type mapping for all application events
export interface AppEvents {
  [key: string]: unknown;
  [PAYMENT_EVENTS.PAYMENT_SUCCEEDED]: PaymentSucceededEvent;
  [PAYMENT_EVENTS.PAYMENT_FAILED]: PaymentFailedEvent;
}

export class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(20);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance as EventBus;
  }

  public emit<K extends keyof AppEvents>(
    event: K,
    payload: AppEvents[K],
  ): boolean {
    return this.emitter.emit(event as string, payload);
  }

  public on<K extends keyof AppEvents>(
    event: K,
    listener: (payload: AppEvents[K]) => void,
  ): this {
    this.emitter.on(event as string, listener);
    return this;
  }

  public off<K extends keyof AppEvents>(
    event: K,
    listener: (payload: AppEvents[K]) => void,
  ): this {
    this.emitter.off(event as string, listener);
    return this;
  }

  public once<K extends keyof AppEvents>(
    event: K,
    listener: (payload: AppEvents[K]) => void,
  ): this {
    this.emitter.once(event as string, listener);
    return this;
  }
}

// Export the singleton instance typed with AppEvents
export const eventBus = EventBus.getInstance();

import { Injectable } from '@nestjs/common';
import { CounterStore } from './counter-store.js';

interface Counter {
  requestCount: number;
  expiresAtMs: number;
}

const EXPIRED_COUNTER_SWEEP_INTERVAL_MS = 60_000;

@Injectable()
export class InMemoryCounterStore extends CounterStore {
  private readonly counterByKey = new Map<string, Counter>();
  private lastSweepAtMs = Date.now();

  increment(key: string, timeToLiveMs: number): Promise<number> {
    const nowMs = Date.now();
    this.cleanUpExpiredCountersWhenDue(nowMs);
    const existingCounter = this.counterByKey.get(key);

    const isExistingCounterActive =
      existingCounter !== undefined && existingCounter.expiresAtMs > nowMs;

    const activeCounter: Counter = isExistingCounterActive
      ? existingCounter
      : { requestCount: 0, expiresAtMs: nowMs + timeToLiveMs };

    activeCounter.requestCount += 1;
    this.counterByKey.set(key, activeCounter);
    return Promise.resolve(activeCounter.requestCount);
  }

  get(key: string): Promise<number> {
    const existingCounter = this.counterByKey.get(key);
    const isExistingCounterActive =
      existingCounter !== undefined && existingCounter.expiresAtMs > Date.now();

    return Promise.resolve(
      isExistingCounterActive ? existingCounter.requestCount : 0,
    );
  }

  private cleanUpExpiredCountersWhenDue(nowMs: number): void {
    const isSweepDue =
      nowMs - this.lastSweepAtMs >= EXPIRED_COUNTER_SWEEP_INTERVAL_MS;

    if (!isSweepDue) {
      return;
    }

    for (const [key, counter] of this.counterByKey) {
      if (counter.expiresAtMs <= nowMs) {
        this.counterByKey.delete(key);
      }
    }
    this.lastSweepAtMs = nowMs;
  }
}

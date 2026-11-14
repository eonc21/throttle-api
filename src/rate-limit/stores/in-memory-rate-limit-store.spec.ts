import { describeRateLimitStore } from '../../../test/support/rate-limit-store.contract.js';
import { InMemoryRateLimitStore } from './in-memory-rate-limit-store.js';

describeRateLimitStore(
  'InMemoryRateLimitStore',
  () => new InMemoryRateLimitStore(),
);

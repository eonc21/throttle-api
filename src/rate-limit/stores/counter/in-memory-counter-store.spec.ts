import { describeCounterStore } from '../../../../test/support/counter-store.contract.js';
import { InMemoryCounterStore } from './in-memory-counter-store.js';

describeCounterStore('InMemoryCounterStore', () => new InMemoryCounterStore());

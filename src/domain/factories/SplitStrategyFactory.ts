import type { SplitMode } from '../types';
import type { ISplitStrategy } from '../strategies/ISplitStrategy';
import { EqualSplitStrategy } from '../strategies/EqualSplitStrategy';
import { ItemizedSplitStrategy } from '../strategies/ItemizedSplitStrategy';

export class SplitStrategyFactory {
  static createStrategy(mode: SplitMode): ISplitStrategy {
    switch (mode) {
      case 'itemized':
        return new ItemizedSplitStrategy();
      case 'equal':
      default:
        return new EqualSplitStrategy();
    }
  }
}

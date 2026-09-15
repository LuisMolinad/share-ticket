import type { Invoice, CalculationResult } from '../types';

export interface ISplitStrategy {
  calculate(invoice: Invoice): CalculationResult;
}

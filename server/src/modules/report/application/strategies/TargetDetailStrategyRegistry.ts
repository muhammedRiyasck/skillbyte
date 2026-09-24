import { ITargetDetailStrategy } from './ITargetDetailStrategy';

/** Handles target detail strategy registry functionality. */
export class TargetDetailStrategyRegistry {
  private strategies = new Map<string, ITargetDetailStrategy>();

  /**
   * Register for the TargetDetailStrategyRegistry entity.
   *
   * @param strategy - The strategy information.
   */
  register(strategy: ITargetDetailStrategy): void {
    this.strategies.set(strategy.targetType, strategy);
  }

  /**
   * Get for the TargetDetailStrategyRegistry entity.
   *
   * @param targetType - The target type information.
   * @returns The result of the operation.
   */
  get(targetType: string): ITargetDetailStrategy | undefined {
    return this.strategies.get(targetType);
  }
}

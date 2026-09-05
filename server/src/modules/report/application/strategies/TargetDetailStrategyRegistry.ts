import { ITargetDetailStrategy } from './ITargetDetailStrategy';

export class TargetDetailStrategyRegistry {
  private strategies = new Map<string, ITargetDetailStrategy>();

  register(strategy: ITargetDetailStrategy): void {
    this.strategies.set(strategy.targetType, strategy);
  }

  get(targetType: string): ITargetDetailStrategy | undefined {
    return this.strategies.get(targetType);
  }
}

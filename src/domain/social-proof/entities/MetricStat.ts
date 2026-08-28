export interface MetricStat {
  readonly value: number;
  readonly suffix: string | undefined;
  readonly label: string;
}

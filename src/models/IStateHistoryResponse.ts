import { StateType } from '@/models/StateType'

export type IStateHistoryResponse = {
  state_type: StateType,
  state_name: string,
  count_runs: number,
  sum_estimated_run_time: number,
  sum_estimated_lateness: number,
}
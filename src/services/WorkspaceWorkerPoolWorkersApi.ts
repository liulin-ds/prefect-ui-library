import { WorkerPoolWorker, WorkerPoolWorkerFilter } from '@/models'
import { WorkerPoolWorkerResponse } from '@/models/api/WorkerPoolWorkerResponse'
import { mapper, WorkspaceApi } from '@/services'

export interface IWorkspaceWorkerPoolWorkersApi {
  getWorkers: (workerPoolName: string, filter: WorkerPoolWorkerFilter) => Promise<WorkerPoolWorker[]>,
}

export class WorkspaceWorkerPoolWorkersApi extends WorkspaceApi implements IWorkspaceWorkerPoolWorkersApi {
  protected override routePrefix = '/experimental/worker_pools/'

  public async getWorkers(workerPoolName: string, filter: WorkerPoolWorkerFilter): Promise<WorkerPoolWorker[]> {
    const { data } = await this.post<WorkerPoolWorkerResponse[]>(`/${workerPoolName}/workers/filter`, filter)

    return mapper.map('WorkerPoolWorkerResponse', data, 'WorkerPoolWorker')
  }
}
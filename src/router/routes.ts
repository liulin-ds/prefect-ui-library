type CreateWorkspaceRoutesConfig = {
  accountId: string,
  workspaceId: string,
}


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createWorkspaceRoutes(config?: CreateWorkspaceRoutesConfig) {
  const PrefectUser: string = window.localStorage.getItem('prefect-user') ?? 'public'
  console.log(':: >>> <prefect-ui-library> Trying to find "prefect-user" for ROUTE querying', PrefectUser)

  return {
    artifact: (artifactId: string) => ({ name: 'workspace.artifacts.artifact', params: { artifactId, ...config }, query: { user: PrefectUser } }) as const,
    artifactKey: (artifactKey: string) => ({ name: 'workspace.artifacts.artifact.key', params: { artifactKey, ...config }, query: { user: PrefectUser } }) as const,
    artifacts: () => ({ name: 'workspace.artifacts', params: { ...config }, query: { user: PrefectUser } }) as const,
    flowRuns: () => ({ name: 'workspace.flow-runs', params: { ...config }, query: { user: PrefectUser } }) as const,
    flowRun: (flowRunId: string) => ({ name: 'workspace.flow-runs.flow-run', params: { flowRunId, ...config }, query: { user: PrefectUser } }) as const,
    taskRun: (taskRunId: string) => ({ name: 'workspace.flow-runs.task-run', params: { taskRunId, ...config }, query: { user: PrefectUser } }) as const,
    flows: () => ({ name: 'workspace.flows', params: { ...config }, query: { user: PrefectUser } }) as const,
    flow: (flowId: string) => ({ name: 'workspace.flows.flow', params: { flowId, ...config }, query: { user: PrefectUser } }) as const,
    flowCollections: () => ({ name: 'workspace.flows.collections', params: { ...config }, query: { user: PrefectUser } }) as const,
    flowCollection: (name: string) => ({ name: 'workspace.flows.collections.collection', params: { name, ...config }, query: { user: PrefectUser } }) as const,
    deployments: () => ({ name: 'workspace.deployments', params: { ...config }, query: { user: PrefectUser } }) as const,
    deployment: (deploymentId: string) => ({ name: 'workspace.deployments.deployment', params: { deploymentId, ...config }, query: { user: PrefectUser } }) as const,
    deploymentEdit: (deploymentId: string) => ({ name: 'workspace.deployments.deployment-edit', params: { deploymentId, ...config }, query: { user: PrefectUser } }) as const,
    deploymentFlowRunCreate: (deploymentId: string, parameters?: Record<string, unknown>) => {
      const query = parameters ? { parameters: encodeURIComponent(JSON.stringify(parameters)) } : { query: { user: PrefectUser } }
      return { name: 'workspace.deployments.deployment-flow-run-create', params: { deploymentId, ...config }, query } as const
    },
    workQueues: () => ({ name: 'workspace.work-queues', params: { ...config }, query: { user: PrefectUser } }) as const,
    workQueue: (workQueueId: string) => ({ name: 'workspace.work-queues.work-queue', params: { workQueueId, ...config }, query: { user: PrefectUser } }) as const,
    workQueueCreate: () => ({ name: 'workspace.work-queues.work-queue-create', params: { ...config }, query: { user: PrefectUser } }) as const,
    workQueueEdit: (workQueueId: string) => ({ name: 'workspace.work-queues.work-queue-edit', params: { workQueueId, ...config }, query: { user: PrefectUser } }) as const,
    blocks: () => ({ name: 'workspace.blocks', params: { ...config }, query: { user: PrefectUser } }) as const,
    blocksCatalog: () => ({ name: 'workspace.blocks.catalog', params: { ...config } }) as const,
    blocksCatalogView: (blockTypeSlug: string) => ({ name: 'workspace.blocks.catalog-view', params: { blockTypeSlug, ...config }, query: { user: PrefectUser } }) as const,
    blockCreate: (blockTypeSlug: string) => ({ name: 'workspace.blocks.block-create', params: { blockTypeSlug, ...config }, query: { user: PrefectUser } }) as const,
    block: (blockDocumentId: string) => ({ name: 'workspace.blocks.block', params: { blockDocumentId, ...config }, query: { user: PrefectUser } }) as const,
    blockEdit: (blockDocumentId: string) => ({ name: 'workspace.blocks.block-edit', params: { blockDocumentId, ...config }, query: { user: PrefectUser } }) as const,
    notifications: () => ({ name: 'workspace.notifications', params: { ...config }, query: { user: PrefectUser } }) as const,
    notificationCreate: () => ({ name: 'workspace.notifications.create', params: { ...config }, query: { user: PrefectUser } }) as const,
    notificationEdit: (notificationId: string) => ({ name: 'workspace.notifications.notification-edit', params: { notificationId, ...config }, query: { user: PrefectUser } }) as const,
    concurrencyLimit: (concurrencyLimitId: string) => ({ name: 'workspace.concurrency-limits.concurrency-limit', params: { concurrencyLimitId, ...config }, query: { user: PrefectUser } }) as const,
    concurrencyLimits: () => ({ name: 'workspace.concurrency-limits', params: { ...config }, query: { user: PrefectUser } }) as const,
    variables: () => ({ name: 'workspace.variables', params: { ...config }, query: { user: PrefectUser } }) as const,
    workPools: () => ({ name: 'workspace.work-pools', params: { ...config }, query: { user: PrefectUser } }) as const,
    workPool: (workPoolName: string) => ({ name: 'workspace.work-pools.work-pool', params: { workPoolName, ...config }, query: { user: PrefectUser } }) as const,
    workPoolCreate: () => ({ name: 'workspace.work-pools.work-pool-create', params: { ...config }, query: { user: PrefectUser } }) as const,
    workPoolEdit: (workPoolName: string) => ({ name: 'workspace.work-pools.work-pool-edit', params: { workPoolName, ...config }, query: { user: PrefectUser } }) as const,
    workPoolQueue: (workPoolName: string, workPoolQueueName: string) => ({ name: 'workspace.work-pools.work-pool.work-pool-queue', params: { workPoolName, workPoolQueueName, ...config }, query: { user: PrefectUser } }) as const,
    workPoolQueueCreate: (workPoolName: string) => ({ name: 'workspace.work-pools.work-pool.work-pool-queue-create', params: { workPoolName, ...config }, query: { user: PrefectUser } }) as const,
    workPoolQueueEdit: (workPoolName: string, workPoolQueueName: string) => ({ name: 'workspace.work-pools.work-pool.work-pool-queue-edit', params: { workPoolName, workPoolQueueName, ...config }, query: { user: PrefectUser } }) as const,
  }
}
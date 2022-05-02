import { InjectionKey } from 'vue'
import { RouteLocationRaw } from 'vue-router'

export const workspaceDashboardKey: InjectionKey<Exclude<RouteLocationRaw, string>> = Symbol('workspaceDashboardKey')

export const dashboardRouteKey: InjectionKey<() => RouteLocationRaw> = Symbol('dashboardRouteKey')
export const flowRunRouteKey: InjectionKey<(flowRunId: string) => RouteLocationRaw> = Symbol('flowRunRouteKey')
export const taskRunRouteKey: InjectionKey<(taskRunId: string) => RouteLocationRaw> = Symbol('taskRunRouteKey')
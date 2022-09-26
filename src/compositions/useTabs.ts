import { computed, ComputedRef } from 'vue'

export type ConditionalTab = {
  label: string,
  hidden?: boolean,
}

export function useTabs(tabs: ConditionalTab[]): ComputedRef<string[]> {
  return computed(() => tabs.filter(tab => tab.hidden !== false).map(tab => tab.label))
}
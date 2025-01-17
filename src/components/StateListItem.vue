<template>
  <p-list-item-input v-model:selected="model" :value="value" class="state-list-item" :class="classes" disabled>
    <div class="state-list-item__content-container">
      <div class="state-list-item__content">
        <div class="state-list-item__top-section">
          <div class="state-list-item__name">
            <slot name="name" />
          </div>

          <div class="state-list-item__tags">
            <slot name="tags">
              <p-tag-wrapper v-bind="{ tags, justify }" />
            </slot>
          </div>

          <template v-if="slots.action">
            <div class="state-list-item__action">
              <slot name="action" />
            </div>
          </template>
        </div>
        <div v-if="slots.meta" class="state-list-item__meta">
          <slot name="meta" />
        </div>
        <template v-if="slots.relationships">
          <div class="state-list-item__relationships">
            <slot name="relationships" />
          </div>
        </template>
      </div>
    </div>

    <slot />
  </p-list-item-input>
</template>

<script lang="ts" setup>
  import { PListItemInput, CheckboxModel, media } from '@prefecthq/prefect-design'
  import { computed, useSlots } from 'vue'
  import { StateType } from '@/models/StateType'

  const props = defineProps<{
    selected?: CheckboxModel | null,
    value?: unknown,
    stateType?: StateType | null | undefined,
    tags?: string[] | null,
  }>()

  const emit = defineEmits<{
    (event: 'update:selected', value: CheckboxModel): void,
  }>()

  const slots = useSlots()

  const model = computed({
    get() {
      return props.selected ?? undefined
    },
    set(value: CheckboxModel) {
      emit('update:selected', value)
    },
  })

  const classes = computed(() => `state-list-item--${props.stateType ?? 'unknown'}`)
  const justify = computed(() => media.md ? 'right' : 'left')
  const tags = computed(() => props.tags ?? [])
</script>

<style>
.state-list-item .p-list-item-input__checkbox { @apply
  bg-transparent
}

.state-list-item--completed .p-list-item-input__checkbox { @apply
  bg-state-completed-500
}

.state-list-item--running .p-list-item-input__checkbox { @apply
  bg-state-running-500
}

.state-list-item--scheduled .p-list-item-input__checkbox { @apply
  bg-state-scheduled-500
}

.state-list-item--pending .p-list-item-input__checkbox { @apply
  bg-state-pending-500
}

.state-list-item--paused .p-list-item-input__checkbox { @apply
  bg-state-paused-500
}

.state-list-item--failed .p-list-item-input__checkbox { @apply
  bg-state-failed-500
}

.state-list-item--cancelled .p-list-item-input__checkbox { @apply
  bg-state-cancelled-500
}

.state-list-item--crashed .p-list-item-input__checkbox { @apply
  bg-state-crashed-500
}

.state-list-item__content { @apply
  flex
  flex-col
  gap-2
  items-start
  grow
}

.state-list-item__content-container { @apply
  flex
}

.state-list-item__top-section { @apply
  grid
  w-full
  items-center
  gap-2;

  grid-template-columns: 1fr auto;
  grid-template-areas:
    "name action"
    "tags tags";
}

@screen md {
  .state-list-item__top-section {
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
     "name tags action";
  }
}

.state-list-item__name { @apply
  text-base
  text-foreground-200
  shrink-0
  whitespace-nowrap
  grow-0
  text-ellipsis
  overflow-hidden;

  grid-area: name;
}

.state-list-item__meta { @apply
  flex
  flex-col
  items-start
  gap-2
  whitespace-nowrap
  mr-1
  md:flex-row
  md:flex-wrap
  md:items-center
  w-full
}

.state-list-item__tags { @apply
  min-w-0
  grow;

  grid-area: tags;
}

.state-list-item__action {
  grid-area: action;
}

.state-list-item__relationships { @apply
  flex
  flex-col
  items-start
  text-xs
  font-medium
  gap-2
  whitespace-nowrap
  mr-1
  self-stretch
  md:items-center
  md:flex-wrap
  md:flex-row
  md:gap-4
}
</style>
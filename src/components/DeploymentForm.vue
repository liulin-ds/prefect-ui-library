<template>
  <p-form class="deployment-form" :loading="isSubmitting" @submit="submit" @cancel="cancel">
    <p-content>
      <p-content>
        <h3 class="deployment-form__section-header">
          General
        </h3>

        <p-label label="Name">
          <p-text-input :model-value="name" disabled />
        </p-label>

        <p-label label="Description (Optional)" :state="descriptionState">
          <p-code-input
            v-model="description"
            class="deployment-form__description-input"
            :min-lines="3"
            lang="markdown"
            show-line-numbers
            :state="descriptionState"
            :placeholder="localization.info.descriptionPlaceholder"
          />
        </p-label>

        <p-label label="Work Pool (Optional)">
          <WorkPoolCombobox v-model:selected="workPoolName" />
        </p-label>

        <p-label v-if="workPoolName" label="Work Queue (Optional)">
          <WorkPoolQueueCombobox v-model:selected="workQueueName" :work-pool-name="workPoolName" />
        </p-label>

        <p-label label="Tags (Optional)">
          <p-tags-input v-model="tags" empty-message="Add tags" />
        </p-label>
      </p-content>

      <p-divider />

      <p-content>
        <h3 class="deployment-form__section-header">
          Scheduling
        </h3>

        <span>
          <p-label label="Schedule" />
          <ScheduleFieldset v-model="schedule" />
        </span>

        <p-label label="Scheduler">
          <p-toggle v-model="isScheduleActive" :disabled="!schedule" class="deployment-form__schedule-toggle" />
        </p-label>
      </p-content>

      <p-divider />

      <p-content>
        <h3 class="deployment-form__section-header">
          Parameters
        </h3>

        <p-button-group v-model="parametersInput" :options="parametersInputOptions" size="sm" />

        <template v-if="hasParameters">
          <template v-if="parametersInput === 'form'">
            <DeploymentParameters v-model="parameters" :deployment="deployment" />
          </template>

          <template v-else>
            <p-label :state="jsonParametersState" :message="jsonParametersErrorMessage">
              <p-code-input v-model="jsonParameters" lang="json" :min-lines="3" show-line-numbers />
            </p-label>
          </template>
        </template>

        <template v-else>
          <em>This deployment's flow has no parameters</em>
        </template>
      </p-content>
    </p-content>

    <p-divider />

    <p-content>
      <h3 class="deployment-form__section-header">
        {{ localization.info.infraOverrides }}
      </h3>
      <p-label label="Infrastructure Overrides (Optional)" :message="overrideErrorMessage" :state="overrideState">
        <JsonInput
          v-model="infrastructureOverrides"
          show-line-numbers
          :min-lines="3"
          class="deployment-form__infrastructure-overrides-input"
          show-format-button
        />
      </p-label>
    </p-content>


    <template #footer>
      <p-button inset @click="cancel">
        Cancel
      </p-button>
      <p-button type="submit" @click="submit">
        Save
      </p-button>
    </template>
  </p-form>
</template>

<script lang="ts" setup>
  import { useValidation } from '@prefecthq/vue-compositions'
  import { merge } from 'lodash'
  import { useField } from 'vee-validate'
  import { computed, ref } from 'vue'
  import { ScheduleFieldset, WorkPoolCombobox, DeploymentParameters, WorkPoolQueueCombobox, JsonInput } from '@/components'
  import { useForm } from '@/compositions/useForm'
  import { localization } from '@/localization'
  import { Deployment, DeploymentUpdate, DeploymentEdit, Schedule } from '@/models'
  import { getSchemaDefaultValues, mapper } from '@/services'
  import { SchemaValues } from '@/types/schemas'
  import { stringify, isJson, fieldRules, stringifyUnknownJson, parseUnknownJson, isRecord } from '@/utilities'

  const props = defineProps<{
    deployment: Deployment,
  }>()

  const parametersInputOptions = [{ value: 'form', label: 'Form' }, { value: 'json', label: 'JSON' }]
  const parametersInput = ref<'form' | 'json'>('form')

  const hasParameters = computed(() => {
    return Object.keys(props.deployment.parameterOpenApiSchema.properties ?? {}).length > 0
  })

  const name = computed(() => props.deployment.name)

  const { handleSubmit, isSubmitting } = useForm<DeploymentEdit>({
    initialValues: {
      description: props.deployment.description,
      parameters: props.deployment.rawParameters,
      schedule: props.deployment.schedule,
      isScheduleActive: props.deployment.isScheduleActive,
      workPoolName: props.deployment.workPoolName,
      workQueueName: props.deployment.workQueueName,
      tags: props.deployment.tags,
      schema: props.deployment.parameterOpenApiSchema,
      infrastructureOverrides: stringify(props.deployment.infrastructureOverrides),
    },
  })

  const rules = {
    infrastructureOverrides: fieldRules('Infrastructure overrides', isJson),
    jsonParameters: fieldRules('Parameters', isJson),
  }

  const { value: description, meta: descriptionState } = useField<string>('description')
  const { value: schedule } = useField<Schedule | null>('schedule')
  const { value: parameters } = useField<SchemaValues>('parameters')
  const { value: isScheduleActive } = useField<boolean>('isScheduleActive')
  const { value: workPoolName } = useField<string | null>('workPoolName')
  const { value: workQueueName } = useField<string | null>('workQueueName')
  const { value: tags } = useField<string[] | null>('tags')
  const { value: infrastructureOverrides, meta: overrideState, errorMessage: overrideErrorMessage } = useField<string>('infrastructureOverrides', rules.infrastructureOverrides)

  const parameterOpenApiSchema = computed(() => {
    const { rawSchema } = props.deployment

    if (rawSchema && 'required' in rawSchema) {
      rawSchema.required = []
    }

    return mapper.map('SchemaResponse', rawSchema ?? {}, 'Schema')
  })
  const jsonParameters = ref(stringifyUnknownJson(merge(getSchemaDefaultValues(parameterOpenApiSchema.value), props.deployment.rawParameters)))
  const { error: jsonParametersErrorMessage, state: jsonParametersState, validate: validateJsonParameters } = useValidation(jsonParameters, localization.info.parameters, rules.jsonParameters)

  const emit = defineEmits<{
    (event: 'submit', value: DeploymentUpdate): void,
    (event: 'cancel'): void,
  }>()

  const submit = handleSubmit(async (values): Promise<void> => {
    if (parametersInput.value == 'json') {
      const valid = await validateJsonParameters()

      if (!valid) {
        return
      }

      const parsed = parseUnknownJson(jsonParameters.value)
      if (isRecord(parsed)) {
        values.parameters = parsed
      }
    }

    const deploymentUpdate: DeploymentUpdate = {
      ...values,
      infrastructureOverrides: JSON.parse(infrastructureOverrides.value),
    }

    emit('submit', deploymentUpdate)
  })

  const cancel = (): void => {
    emit('cancel')
  }
</script>

<style>
.deployment-form {
  @apply
  border
  dark:border-background-600
  px-6
  py-6
  rounded-lg
}

.deployment-form__section-header {
  @apply
  text-lg
  font-semibold
}

.deployment-form__schedule-row {
  @apply
  flex
  gap-2
  items-center
}

.deployment-form__description-input,
.deployment-form__infrastructure-overrides-input { @apply
  min-h-[2.5rem]
  resize-y
  min-w-full
}

.deployment-form__schedule {
  @apply
  text-lg
}
</style>
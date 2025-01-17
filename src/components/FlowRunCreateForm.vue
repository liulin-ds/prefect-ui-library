<template>
  <p-form class="flow-run-create-form" @submit="submit">
    <p-content class="flow-run-create-form__section">
      <h3 class="flow-run-create-form__section-header">
        General
      </h3>

      <p-label label="Name (optional)">
        <p-text-input v-model="name">
          <template #append>
            <p-button
              class="flow-run-create-form__random-name-button"
              color="primary"
              icon="ArrowPathIcon"
              @click="name = generateRandomName()"
            />
          </template>
        </p-text-input>
      </p-label>

      <p-label label="Message (optional)">
        <p-textarea v-model="stateMessage" placeholder="Created from the Prefect UI" />
      </p-label>

      <p-label label="Tags (optional)">
        <p-tags-input v-model="tags" :options="deploymentTags" />
      </p-label>

      <div class="flow-run-create-form__retries">
        <p-label label="Retries (optional)">
          <p-number-input v-model="retries" :min="0" />
        </p-label>

        <p-label label="Retry Delay (optional)">
          <p-number-input v-model="retryDelay" :min="0" append="Seconds" />
        </p-label>
      </div>

      <p-divider v-if="deployment.parameters" />

      <h3 class="flow-run-create-form__section-header">
        Start
      </h3>

      <p-button-group v-model="when" :options="whenOptions" size="sm" />

      <template v-if="when == 'later'">
        <div class="flow-run-create-form__row">
          <p-label label="Date" :message="startErrorMessage" :state="startState">
            <DateInput v-model="start" show-time />
          </p-label>
          <p-label label="Timezone">
            <TimezoneSelect v-model="timezone" />
          </p-label>
        </div>
      </template>


      <template v-if="hasParameters">
        <p-divider />

        <h3 class="flow-run-create-form__section-header">
          Parameters
        </h3>

        <p-button-group v-model="overrideParameters" :options="overrideParametersOptions" size="sm" />

        <template v-if="overrideParameters == 'custom'">
          <DeploymentParameters v-model="parameters" :deployment="deployment" />
        </template>

        <template v-else-if="overrideParameters == 'json'">
          <p-label :state="jsonParametersState" :message="jsonParametersErrorMessage">
            <p-code-input v-model="jsonParameters" lang="json" :min-lines="3" show-line-numbers />
          </p-label>
        </template>
      </template>
    </p-content>

    <template #footer>
      <p-button inset @click="cancel">
        Cancel
      </p-button>
      <p-button type="submit">
        Run
      </p-button>
    </template>
  </p-form>
</template>

<script lang="ts" setup>
  import { PButton, ButtonGroupOption } from '@prefecthq/prefect-design'
  import { useValidation } from '@prefecthq/vue-compositions'
  import { zonedTimeToUtc } from 'date-fns-tz'
  import { merge } from 'lodash'
  import { useField } from 'vee-validate'
  import { computed, ref } from 'vue'
  import { isJson, localization } from '..'
  import { TimezoneSelect, DateInput, DeploymentParameters } from '@/components'
  import { useForm } from '@/compositions/useForm'
  import { Deployment, DeploymentFlowRunCreate } from '@/models'
  import { getSchemaDefaultValues, mocker } from '@/services'
  import { SchemaValues } from '@/types/schemas'
  import { isRecord, parseUnknownJson, stringifyUnknownJson } from '@/utilities'
  import { fieldRules, isRequiredIf } from '@/utilities/validation'

  const props = defineProps<{
    deployment: Deployment,
    // these must be the unmapped SchemaValues
    parameters?: SchemaValues,
  }>()

  const generateRandomName = (): string => {
    return mocker.create('runName')
  }

  const emit = defineEmits<{
    (event: 'submit', value: DeploymentFlowRunCreate): void,
    (event: 'cancel'): void,
  }>()

  const hasParameters = computed(() => {
    return Object.keys(props.deployment.parameterOpenApiSchema.properties ?? {}).length > 0
  })

  const rules = {
    start: fieldRules('Start date', isRequiredIf(() => when.value === 'later')),
    jsonParameters: fieldRules('Parameters', isJson),
  }

  const combinedParameters = computed(() => {
    return { ...props.deployment.parameters, ...props.parameters }
  })

  const rawParameters = computed(() => {
    const schemaDefaults = getSchemaDefaultValues(props.deployment.parameterOpenApiSchema)

    return merge(schemaDefaults, props.parameters)
  })

  const { handleSubmit } = useForm<DeploymentFlowRunCreate>({
    initialValues: {
      state: {
        type: 'scheduled',
      },
      tags: props.deployment.tags ?? [],
      name: generateRandomName(),
      parameters: combinedParameters.value,
      schema: props.deployment.parameterOpenApiSchema,
    },
  })


  const { value: start, meta: startState, errorMessage: startErrorMessage } = useField<Date>('state.stateDetails.scheduledTime', rules.start)
  const { value: tags } = useField<string[]>('tags')
  const { value: retries } = useField<number | null>('empiricalPolicy.retries')
  const { value: retryDelay } = useField<number | null>('empiricalPolicy.retryDelay')
  const { value: name } = useField<string>('name')
  const { value: parameters } = useField<SchemaValues>('parameters')
  const { value: stateMessage } = useField<string>('state.message')

  const jsonParameters = ref(stringifyUnknownJson(rawParameters.value))
  const { error: jsonParametersErrorMessage, state: jsonParametersState, validate: validateJsonParameters } = useValidation(jsonParameters, localization.info.parameters, rules.jsonParameters)

  const adjustedStart = computed(() => zonedTimeToUtc(start.value, timezone.value))
  const whenOptions: ButtonGroupOption[] = [{ label: 'Now', value: 'now' }, { label: 'Later', value: 'later' }]
  const when = ref<'now' | 'later'>('now')

  const overrideParametersOptions: ButtonGroupOption[] = [{ label: 'Default', value: 'default' }, { label: 'Custom', value: 'custom' }, { label: 'JSON', value: 'json' }]
  const overrideParameters = ref<'default' | 'custom' | 'json'>(props.parameters ? 'custom' : 'default')

  const timezone = ref('UTC')
  const deploymentTags = computed(() => props.deployment.tags?.map((tag) => ({ label: tag, value: tag, disabled: true })))

  const cancel = (): void => emit('cancel')
  const submit = handleSubmit(async (values): Promise<void> => {
    const resolvedValues: DeploymentFlowRunCreate = { ...values }

    if (when.value == 'now' && resolvedValues.state?.stateDetails?.scheduledTime) {
      resolvedValues.state.stateDetails.scheduledTime = null
    }

    if (when.value == 'later' && resolvedValues.state?.stateDetails?.scheduledTime) {
      resolvedValues.state.stateDetails.scheduledTime = adjustedStart.value
    }

    if (overrideParameters.value == 'default') {
      delete resolvedValues.parameters
    } else if (overrideParameters.value == 'json') {
      const valid = await validateJsonParameters()

      if (!valid) {
        return
      }

      const parsed = parseUnknownJson(jsonParameters.value)
      if (isRecord(parsed)) {
        resolvedValues.parameters = parsed
      }
    }

    emit('submit', resolvedValues)
  })
</script>

<style>
.flow-run-create-form { @apply
  border
  dark:border-background-600
  px-6
  py-6
  rounded-lg
}

.flow-run-create-form__random-name-button { @apply
  rounded-none
  rounded-tr
  rounded-br
}

.flow-run-create-form__title { @apply
  font-semibold
  m-0
  p-0
}

.flow-run-create-form__section-header { @apply
  text-lg
  font-semibold
}

.flow-run-create-form__row { @apply
  grid
  gap-2
  grid-cols-2
}

.flow-run-create-form__tag { @apply
  py-0
}

.flow-run-create-form__retries { @apply
  flex
  gap-4
}
</style>
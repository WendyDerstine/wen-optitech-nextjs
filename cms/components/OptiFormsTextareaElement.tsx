import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import TextareaField from '@/components/forms/TextareaField'
import ConditionalField from '@/components/forms/ConditionalField'
import { parseValidators } from '@/cms/forms/validators'

type Props = { content: any }

export default function OptiFormsTextareaElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const nodeKey = content.__composition?.key ?? content._metadata?.key ?? 'field'
  const name = content.SubmissionFieldName || nodeKey

  return (
    <ConditionalField nodeKey={nodeKey}>
      <div className="w-full" {...pa(content.__composition)}>
        <TextareaField
          id={nodeKey}
          name={name}
          label={content.Label ?? undefined}
          placeholder={content.Placeholder ?? undefined}
          tooltip={content.Tooltip ?? undefined}
          defaultValue={content.PredefinedValue ?? undefined}
          autoComplete={content.AutoComplete ?? undefined}
          required={parseValidators(content.Validators).required}
        />
      </div>
    </ConditionalField>
  )
}

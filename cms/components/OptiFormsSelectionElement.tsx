import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import SelectionField from '@/components/forms/SelectionField'
import ConditionalField from '@/components/forms/ConditionalField'
import { parseValidators } from '@/cms/forms/validators'
import { parseOptions } from '@/cms/forms/options'

type Props = { content: any }

export default function OptiFormsSelectionElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const nodeKey = content.__composition?.key ?? content._metadata?.key ?? 'field'
  const name = content.SubmissionFieldName || nodeKey

  return (
    <ConditionalField nodeKey={nodeKey}>
      <div className="w-full" {...pa(content.__composition)}>
        <SelectionField
          id={nodeKey}
          name={name}
          label={content.Label ?? undefined}
          placeholder={content.Placeholder ?? undefined}
          tooltip={content.Tooltip ?? undefined}
          options={parseOptions(content.Options)}
          allowMultiSelect={content.AllowMultiSelect ?? false}
          autoComplete={content.AutoComplete ?? undefined}
          required={parseValidators(content.Validators).required}
        />
      </div>
    </ConditionalField>
  )
}

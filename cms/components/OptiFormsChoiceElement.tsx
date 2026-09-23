import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import ChoiceField from '@/components/forms/ChoiceField'
import ConditionalField from '@/components/forms/ConditionalField'
import { parseValidators } from '@/cms/forms/validators'
import { parseOptions } from '@/cms/forms/options'

type Props = { content: any }

export default function OptiFormsChoiceElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const nodeKey = content.__composition?.key ?? content._metadata?.key ?? 'field'
  const name = content.SubmissionFieldName || nodeKey

  return (
    <ConditionalField nodeKey={nodeKey}>
      <div className="w-full" {...pa(content.__composition)}>
        <ChoiceField
          id={nodeKey}
          name={name}
          label={content.Label ?? undefined}
          tooltip={content.Tooltip ?? undefined}
          options={parseOptions(content.Options)}
          allowMultiSelect={content.AllowMultiSelect ?? false}
          required={parseValidators(content.Validators).required}
        />
      </div>
    </ConditionalField>
  )
}

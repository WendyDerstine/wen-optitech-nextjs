import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import RangeField from '@/components/forms/RangeField'
import ConditionalField from '@/components/forms/ConditionalField'

type Props = { content: any }

export default function OptiFormsRangeElementAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)
  const nodeKey = content.__composition?.key ?? content._metadata?.key ?? 'field'
  const name = content.SubmissionFieldName || nodeKey

  return (
    <ConditionalField nodeKey={nodeKey}>
      <div className="w-full" {...pa(content.__composition)}>
        <RangeField
          id={nodeKey}
          name={name}
          label={content.Label ?? undefined}
          tooltip={content.Tooltip ?? undefined}
          defaultValue={content.PredefinedValue ?? undefined}
          min={content.Min ?? 0}
          max={content.Max ?? 100}
          step={content.Increment ?? 1}
        />
      </div>
    </ConditionalField>
  )
}

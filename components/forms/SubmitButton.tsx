import Button from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

type Props = {
  label?: string
  tooltip?: string
}

export default function SubmitButton({ label, tooltip }: Props) {
  return (
    // The Forms editor often gives Submit its own column alongside Reset —
    // justify-end anchors it to that column's trailing edge (the row's right
    // edge) instead of hugging the left, regardless of how the author split
    // the row.
    <div title={tooltip} className="flex w-full justify-end">
      <Button type="submit" variant="brand" size="sm" trailingIcon={<ArrowRight />}>
        {label ?? 'Submit'}
      </Button>
    </div>
  )
}

'use client'
import type { ReactNode } from 'react'
import { useFieldVisibility } from './FormRulesContext'

type Props = {
  nodeKey: string
  children: ReactNode
}

/** Unmounts its field when a DependencyRule hides it, so it's excluded from submission. */
export default function ConditionalField({ nodeKey, children }: Props) {
  return useFieldVisibility(nodeKey) ? <>{children}</> : null
}

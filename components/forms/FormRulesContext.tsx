'use client'
import { createContext, useContext } from 'react'

export type FormCondition = {
  DependsOnField?: string | null
  ComparisonOperator?: string | null
  ComparisonValue?: string | null
}

// Optimizely Forms also exposes TargetStep/AfterStep/JumpToStep on this type
// (step-branching) — deliberately not modeled or evaluated here. There's no
// authored multi-step form to verify the branching behavior against yet, and
// getting it wrong would silently skip a step for a real visitor.
export type FormDependencyRule = {
  TargetElement?: string | null
  SatisfiedAction?: string | null
  ConditionCombination?: string | null
  Conditions?: FormCondition[] | null
}

type ContextValue = {
  rules: FormDependencyRule[]
  values: Record<string, string>
}

const FormRulesContext = createContext<ContextValue>({ rules: [], values: {} })

export const FormRulesProvider = FormRulesContext.Provider

function evaluateCondition(condition: FormCondition, values: Record<string, string>): boolean {
  const actual   = values[condition.DependsOnField ?? ''] ?? ''
  const expected = condition.ComparisonValue ?? ''
  switch ((condition.ComparisonOperator ?? '').toLowerCase()) {
    case 'notequal':
    case 'notequals':
    case 'ne':
      return actual !== expected
    case 'contains':
      return actual.includes(expected)
    case 'greaterthan':
    case 'gt':
      return Number(actual) > Number(expected)
    case 'lessthan':
    case 'lt':
      return Number(actual) < Number(expected)
    // 'equal' / 'equals' / 'eq' and any operator string we don't recognize yet
    // (no authored rule exists to confirm exact operator names against) fall
    // back to equality — the common case for a simple show/hide condition.
    default:
      return actual === expected
  }
}

function isRuleSatisfied(rule: FormDependencyRule, values: Record<string, string>): boolean {
  const conditions = rule.Conditions ?? []
  if (conditions.length === 0) return true
  const results = conditions.map(c => evaluateCondition(c, values))
  return (rule.ConditionCombination ?? '').toLowerCase().startsWith('any')
    ? results.some(Boolean)
    : results.every(Boolean)
}

/**
 * Whether the field at `nodeKey` should render. Fails open (visible) when no
 * rule targets it, or when a rule's SatisfiedAction isn't recognized — a
 * misread rule should never hide a field a visitor needs to fill out.
 */
export function useFieldVisibility(nodeKey: string): boolean {
  const { rules, values } = useContext(FormRulesContext)
  const targeting = rules.filter(r => r.TargetElement === nodeKey)
  if (targeting.length === 0) return true

  return targeting.every(rule => {
    const satisfied = isRuleSatisfied(rule, values)
    const action = (rule.SatisfiedAction ?? '').toLowerCase()
    if (action.includes('hide')) return !satisfied
    if (action.includes('show')) return satisfied
    return true
  })
}

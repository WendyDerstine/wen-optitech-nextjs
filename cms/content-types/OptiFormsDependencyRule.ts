import { contentType } from '@optimizely/cms-sdk'
import { OptiFormsCondition } from './OptiFormsCondition'

export const OptiFormsDependencyRule = contentType({
  key: 'OptiFormsDependencyRule',
  displayName: 'Dependency Rule',
  baseType: '_component',
  properties: {
    TargetElement:        { type: 'string', displayName: 'Target Element' },
    SatisfiedAction:      { type: 'string', displayName: 'Satisfied Action' },
    ConditionCombination: { type: 'string', displayName: 'Condition Combination' },
    Conditions:           { type: 'array',  displayName: 'Conditions', items: { type: 'component', contentType: OptiFormsCondition } },
    // Step-branching targets, confirmed live but not wired up in app code yet —
    // see the "out of scope" note in components/forms/FormRulesContext.tsx.
    TargetStep:           { type: 'string', displayName: 'Target Step' },
    AfterStep:            { type: 'string', displayName: 'After Step' },
    JumpToStep:           { type: 'string', displayName: 'Jump To Step' },
  },
})

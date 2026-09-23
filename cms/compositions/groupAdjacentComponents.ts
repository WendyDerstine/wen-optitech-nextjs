/**
 * Pure grouping logic for column-level element merging (e.g. adjacent
 * OT_TabItemBlock elements rendering as one tab switcher). No SDK/React
 * imports — safe to unit-test and reuse from a showcase harness with
 * synthetic nodes, exactly like cms/compositions/Column.tsx does with real
 * composition nodes.
 *
 * A component composition node has `__typename: 'CompositionComponentNode'`
 * (the SDK's own `isComponentNode` check, replicated here rather than
 * importing it — it lives at `@optimizely/cms-sdk/dist/esm/util/baseTypeUtil.js`,
 * which isn't part of the package's public export map).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CompositionNode = Record<string, any>

export type Segment =
  | { type: 'single'; node: CompositionNode }
  | { type: 'group'; nodes: CompositionNode[] }

function isMatchingComponentNode(node: CompositionNode, typeName: string): boolean {
  return node?.__typename === 'CompositionComponentNode' && node?.component?.__typename === typeName
}

/**
 * Splits an ordered list of composition nodes into segments, merging
 * contiguous runs of 2+ nodes whose component type matches `typeName` into
 * `group` segments. A lone match (no adjacent sibling of the same type)
 * stays a `single` segment — it renders through its own normal adapter,
 * which is what gives an isolated Tab Item its single-tab fallback chrome.
 */
export function groupAdjacentComponents(nodes: CompositionNode[], typeName: string): Segment[] {
  const segments: Segment[] = []
  let run: CompositionNode[] = []

  const flushRun = () => {
    if (run.length === 0) return
    if (run.length === 1) segments.push({ type: 'single', node: run[0] })
    else segments.push({ type: 'group', nodes: run })
    run = []
  }

  for (const node of nodes) {
    if (isMatchingComponentNode(node, typeName)) {
      run.push(node)
    } else {
      flushRun()
      segments.push({ type: 'single', node })
    }
  }
  flushRun()

  return segments
}

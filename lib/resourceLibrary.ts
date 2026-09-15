import { getClient } from '@/lib/optimizely'
import { getCmpAccessToken, cmpConfigured } from '@/lib/cmpApi'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ResourceAsset = {
  title:       string
  url:         string
  extension:   string | null
  fileSize:    number | null
  description: string | null
  // Populated when the CMP schema exposes a Tags field on cmp_Asset.
  // Add `Tags` to SIBLINGS_QUERY and map it in the merge step to enable.
  tags:        string[] | null
}

// ─── GraphQL queries ────────────────────────────────────────────────────────────
//
// DAM assets in this Optimizely instance are indexed as cmp_Asset (Optimizely
// CMP integration). The DAM folder is identified by ParentFolderGuid — the GUID
// visible in the DAM URL bar (parentFolderGuid=...).
//
// Two-step pattern:
//   1. Fetch all cmp_Asset items in the folder (Title, MimeType, keys).
//   2. Batch-fetch CDN download URLs from _AssetItem using the asset keys.
//      _assetMetadata.url on _AssetItem is the only place the CDN URL lives;
//      cmp_Asset itself has no url field.

const SIBLINGS_QUERY = `
  query GetFolderSiblings($parentFolderGuid: String!) {
    cmp_Asset(
      where: { ParentFolderGuid: { eq: $parentFolderGuid } }
      orderBy: { Title: ASC }
      limit: 50
    ) {
      items {
        _itemMetadata { key }
        Title
        MimeType
      }
    }
  }
`

const ASSET_URLS_QUERY = `
  query GetAssetUrls($keys: [String]) {
    _AssetItem(
      where: { _itemMetadata: { key: { in: $keys } } }
      limit: 50
    ) {
      items {
        _itemMetadata { key }
        _assetMetadata { fileSize url }
      }
    }
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────────

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf':  'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/gif':  'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'video/mp4':  'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'application/zip': 'zip',
  'text/plain': 'txt',
  'text/csv':   'csv',
}

function extFromMime(mime: string): string | null {
  return MIME_TO_EXT[mime] ?? null
}

function extFromFilename(filename: string): string | null {
  const dot = filename.lastIndexOf('.')
  if (dot < 1 || dot === filename.length - 1) return null
  return filename.slice(dot + 1).toLowerCase()
}

function titleWithoutExt(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot > 0 ? filename.slice(0, dot) : filename
}

function matchesFilter(mime: string, filterType: string): boolean {
  if (filterType === 'all') return true
  if (filterType === 'images')    return mime.startsWith('image/')
  if (filterType === 'video')     return mime.startsWith('video/')
  if (filterType === 'documents') return mime.startsWith('application/') || mime.startsWith('text/')
  return true
}

// ─── CMP API path ────────────────────────────────────────────────────────────
//
// The folder_id used in the CMP REST API is a different identifier than the
// ParentFolderGuid indexed in Content Graph. Using the CMP API directly (same
// approach as /api/search/docs) reliably matches the folder ID visible in the
// DAM UI and in the Topic Hub config.

interface CmpApiAsset {
  id:              string
  title?:          string
  is_archived?:    boolean
  file_extension?: string | null
  content?:        { type: string; value: string }
}

function extMatchesFilter(ext: string | null, filterType: string): boolean {
  if (filterType === 'all') return true
  const e = ext?.toLowerCase() ?? ''
  const images    = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const videos    = ['mp4', 'mov', 'webm']
  if (filterType === 'images')    return images.includes(e)
  if (filterType === 'video')     return videos.includes(e)
  if (filterType === 'documents') return !images.includes(e) && !videos.includes(e)
  return true
}

async function getAssetsFromCmpApi(
  folderId: string,
  filterType: string,
): Promise<ResourceAsset[]> {
  const token = await getCmpAccessToken()
  const url = `https://api.cmp.optimizely.com/v3/assets?folder_id=${encodeURIComponent(folderId)}&include_subfolder_assets=false&page_size=100`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`CMP assets fetch failed: ${res.status}`)

  const body = (await res.json()) as { data?: CmpApiAsset[] }
  return (body.data ?? [])
    .filter(a => !a.is_archived && a.content?.value)
    .filter(a => extMatchesFilter(a.file_extension ?? null, filterType))
    .map(a => ({
      title:       a.title ? titleWithoutExt(a.title) : 'Untitled',
      url:         a.content!.value,
      extension:   a.file_extension ?? extFromFilename(a.title ?? ''),
      fileSize:    null,
      description: null,
      tags:        null,
    }))
}

// ─── Content Graph fallback ───────────────────────────────────────────────────
// Used when CMP credentials aren't configured (local dev / instances without CMP).

async function getAssetsFromGraph(
  folderGuid: string,
  filterType: string,
): Promise<ResourceAsset[]> {
  const siblingsData = await getClient().request(SIBLINGS_QUERY, { parentFolderGuid: folderGuid })
  const siblings: Array<{ key: string; Title: string; MimeType: string }> =
    ((siblingsData as any)?.cmp_Asset?.items ?? [])
      .map((item: any) => ({
        key:      String(item._itemMetadata?.key   ?? ''),
        Title:    String(item.Title    ?? ''),
        MimeType: String(item.MimeType ?? ''),
      }))
      .filter((s: { key: string; Title: string }) => s.key && s.Title)
      .filter((s: { MimeType: string }) => matchesFilter(s.MimeType, filterType))

  if (!siblings.length) return []

  const keys    = siblings.map(s => s.key)
  const urlData = await getClient().request(ASSET_URLS_QUERY, { keys })
  const urlMap  = new Map<string, { url: string; fileSize: number | null }>()
  for (const item of (urlData as any)?._AssetItem?.items ?? []) {
    const k   = item._itemMetadata?.key as string | undefined
    const url = item._assetMetadata?.url as string | undefined
    if (k && url) {
      urlMap.set(k, {
        url,
        fileSize: typeof item._assetMetadata?.fileSize === 'number'
          ? item._assetMetadata.fileSize
          : null,
      })
    }
  }

  return siblings
    .filter(s => urlMap.has(s.key))
    .map(s => {
      const { url, fileSize } = urlMap.get(s.key)!
      return {
        title:       titleWithoutExt(s.Title),
        url,
        extension:   extFromMime(s.MimeType) ?? extFromFilename(s.Title),
        fileSize,
        description: null,
        tags:        null,
      }
    })
}

// ─── Data access ────────────────────────────────────────────────────────────────

/**
 * Fetches all CMP assets in the DAM folder identified by the given folder ID.
 *
 * Uses the CMP REST API when credentials are available (primary path — matches
 * the same folder_id visible in the DAM UI). Falls back to Content Graph when
 * CMP credentials are absent.
 */
export async function getResourceLibraryAssets(
  folderId: string,
  filterType = 'all',
): Promise<ResourceAsset[]> {
  try {
    if (cmpConfigured()) {
      return await getAssetsFromCmpApi(folderId, filterType)
    }
    return await getAssetsFromGraph(folderId, filterType)
  } catch {
    return []
  }
}

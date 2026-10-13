import { isDesktopApp } from './runtime'

const downloadInBrowser = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const extensionOf = (filename: string) => filename.split('.').pop()?.toLowerCase()

/**
 * Saves generated files using the native dialog in Tauri and a regular browser
 * download everywhere else. A cancelled native dialog is not treated as an error.
 */
export const saveBlob = async (blob: Blob, filename: string): Promise<boolean> => {
  if (!isDesktopApp()) {
    downloadInBrowser(blob, filename)
    return true
  }

  const [{ save }, { writeFile }] = await Promise.all([
    import('@tauri-apps/plugin-dialog'),
    import('@tauri-apps/plugin-fs'),
  ])
  const extension = extensionOf(filename)
  const path = await save({
    title: '保存文件',
    defaultPath: filename,
    ...(extension ? { filters: [{ name: `${extension.toUpperCase()} 文件`, extensions: [extension] }] } : {}),
  })
  if (!path) return false

  await writeFile(path, new Uint8Array(await blob.arrayBuffer()))
  return true
}

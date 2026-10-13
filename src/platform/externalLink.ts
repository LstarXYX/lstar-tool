import { isDesktopApp } from './runtime'

export const openExternalLink = async (url: string) => {
  if (isDesktopApp()) {
    const { openUrl } = await import('@tauri-apps/plugin-opener')
    await openUrl(url)
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

import { isDesktopApp } from './runtime'

export const writeClipboardText = async (value: string) => {
  if (isDesktopApp()) {
    const { writeText } = await import('@tauri-apps/plugin-clipboard-manager')
    await writeText(value)
    return
  }

  await navigator.clipboard.writeText(value)
}

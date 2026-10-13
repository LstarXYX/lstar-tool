import { isTauri } from '@tauri-apps/api/core'

/** True only inside the packaged Tauri WebView, never in the public website. */
export const isDesktopApp = () => isTauri()

const configuredSiteUrl = 'http://tool.lstarr.xyz'

/**
 * The public root URL of the site. Change this single value when the site moves.
 * Keep it as the URL of the deployed application root (rather than a single page).
 */
export const siteUrl = `${configuredSiteUrl.replace(/\/+$/, '')}/`

const parsedSiteUrl = new URL(siteUrl)

export const siteHostname = parsedSiteUrl.hostname

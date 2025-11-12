const userAgent = navigator.userAgent

export const isFirefox = (userAgent.includes('Firefox'))
export const isWebKit = (userAgent.includes('AppleWebKit'))
export const isChrome = (userAgent.includes('Chrome'))
export const isSafari = (!isChrome && (userAgent.includes('Safari')))
export const isWebkitWebView = (!isChrome && !isSafari && isWebKit)
export const isElectron = (userAgent.includes('Electron/'))
export const isAndroid = (userAgent.includes('Android'))

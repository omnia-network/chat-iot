declare global {
  interface Window {
    gtag?: (...args: any) => void
  }
}

type GAEventParameters = Record<string, string | number | boolean>;

export const sendEvent = (name: string, parameters: GAEventParameters = {}) => {
  if (!window.gtag) {
    return
  }

  window.gtag('event', name, parameters)
}

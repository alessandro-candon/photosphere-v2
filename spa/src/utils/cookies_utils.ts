export const setSecureCookie = (key: string, value: string, seconds: number) => {
  let expires = ''
  if (seconds) {
    const date = new Date()
    date.setTime(date.getTime() + seconds * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = key + '=' + (value || '') + expires + '; path=/; Secure'
}

export const getCookie = (key: string): string | null => {
  const name = key + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookieArray = decodedCookie.split(';')
  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim()
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length)
    }
  }
  return null
}

export const deleteCookie = (key: string) => {
  document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure'
}

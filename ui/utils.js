const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1

export function toHHSS(sec) {
    let hours = parseInt(sec / 3600) % 24
    let minutes = parseInt(sec / 60) % 60
    let seconds = sec % 60
    return minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds)
}

export function mod(n, m) {
    return ((n % m) + m) % m
}

export function scrollIntoView(el) {
    if (el) {
        if (el.scrollIntoViewIfNeeded)
            el.scrollIntoViewIfNeeded()
        else
            el.scrollIntoView()
    }
}

export function getScrollTop(el) {
    if (isFirefox) return document.documentElement.scrollTop
    if (isChrome) return window.pageYOffset
    return el.scrollTop
}

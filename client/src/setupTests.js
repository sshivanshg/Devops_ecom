import '@testing-library/jest-dom'

// jsdom does not provide IntersectionObserver (needed by Framer Motion and others)
global.IntersectionObserver = class IntersectionObserver {
  observe = () => null
  disconnect = () => null
  unobserve = () => null
  root = null
  rootMargin = ''
  thresholds = []
}

import { useState, useEffect } from 'react'

export function useNotifications() {
  const [permission, setPermission] = useState('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    const isSupported = 'Notification' in window
    setSupported(isSupported)
    if (isSupported) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!supported) return 'unsupported'
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch {
      return 'denied'
    }
  }

  const sendNotification = (title, options = {}) => {
    if (permission !== 'granted') return false
    try {
      new Notification(title, {
        icon: '/icon.png',
        badge: '/icon.png',
        ...options,
      })
      return true
    } catch {
      return false
    }
  }

  return {
    permission,
    supported,
    requestPermission,
    sendNotification,
  }
}

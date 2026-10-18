/**
 * TeacherLayout — charge le CSS enseignant uniquement quand on est
 * dans l'espace enseignant. Évite tout conflit avec le CSS admin.
 */
import { useEffect } from 'react'

let cssLoaded = false

export default function TeacherLayout({ children }) {
  useEffect(() => {
    if (cssLoaded) return
    // Injection dynamique du CSS enseignant uniquement pour les routes /dashboard, /ai, /quiz...
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/teacher-styles.css'
    link.id = 'teacher-css'
    document.head.appendChild(link)
    cssLoaded = true

    return () => {
      // On ne supprime pas le CSS au démontage car il peut être re-monté
    }
  }, [])

  return <>{children}</>
}

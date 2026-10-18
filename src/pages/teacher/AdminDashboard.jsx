// Cette page n'est plus utilisée dans le frontend unifié
// Les admins sont redirigés vers /admin (panneau admin complet)
import { Navigate } from 'react-router-dom'

export default function AdminDashboard() {
  return <Navigate to="/admin" replace />
}

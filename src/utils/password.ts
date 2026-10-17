export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []
  if (password.length < 8) errors.push('Au moins 8 caractères')
  if (!/[A-Z]/.test(password)) errors.push('Au moins une lettre majuscule')
  if (!/[a-z]/.test(password)) errors.push('Au moins une lettre minuscule')
  if (!/\d/.test(password)) errors.push('Au moins un chiffre')
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Au moins un caractère spécial')
  return { valid: errors.length === 0, errors }
}

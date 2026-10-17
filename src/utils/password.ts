/**
 * Password strength rules (mirrors the frontend validation in Profile.tsx)
 */

export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: /[A-Z]/,
  requireLowercase: /[a-z]/,
  requireDigit: /\d/,
  requireSpecial: /[^A-Za-z0-9]/,
}

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < PASSWORD_RULES.minLength)
    errors.push(`Au moins ${PASSWORD_RULES.minLength} caractères`)

  if (!PASSWORD_RULES.requireUppercase.test(password))
    errors.push('Au moins une lettre majuscule')

  if (!PASSWORD_RULES.requireLowercase.test(password))
    errors.push('Au moins une lettre minuscule')

  if (!PASSWORD_RULES.requireDigit.test(password))
    errors.push('Au moins un chiffre')

  if (!PASSWORD_RULES.requireSpecial.test(password))
    errors.push('Au moins un caractère spécial')

  return { valid: errors.length === 0, errors }
}

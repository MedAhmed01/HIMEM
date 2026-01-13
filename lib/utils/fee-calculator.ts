/**
 * Fee Calculator Utility for OMIGEC Platform
 * Calculates annual subscription fees based on years of experience
 */

/**
 * Calculate the annual subscription fee based on graduation year
 * 
 * Fee tiers:
 * - < 5 years experience: 1,500 MRU
 * - 5-15 years experience: 3,000 MRU
 * - > 15 years experience: 5,000 MRU
 * 
 * @param graduationYear - The year the engineer graduated
 * @returns The annual fee in MRU
 */
export function calculateAnnualFee(graduationYear: number): number {
  const currentYear = new Date().getFullYear()
  const experience = currentYear - graduationYear
  
  if (experience < 5) {
    return 1500
  }
  
  if (experience <= 15) {
    return 3000
  }
  
  return 5000
}

/**
 * Calculate years of experience from graduation year
 * 
 * @param graduationYear - The year the engineer graduated
 * @returns Years of experience
 */
export function calculateExperience(graduationYear: number): number {
  const currentYear = new Date().getFullYear()
  return currentYear - graduationYear
}

/**
 * Check if a subscription is currently active
 * 
 * @param expiryDate - The subscription expiry date (ISO string or Date)
 * @returns true if subscription is active, false otherwise
 */
export function isSubscriptionActive(expiryDate: string | Date | null): boolean {
  if (!expiryDate) {
    return false
  }
  
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate
  return new Date() < expiry
}

/**
 * Calculate the next subscription expiry date (1 year from now)
 * 
 * @returns ISO string of expiry date
 */
export function calculateNextExpiryDate(): string {
  const nextYear = new Date()
  nextYear.setFullYear(nextYear.getFullYear() + 1)
  return nextYear.toISOString()
}

/**
 * Format fee amount for display
 * 
 * @param amount - Fee amount in MRU
 * @returns Formatted string (e.g., "1 500 MRU")
 */
export function formatFee(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} MRU`
}

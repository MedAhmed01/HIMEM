'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userType: 'ingenieur' | 'entreprise'
  userName: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userId,
  userType,
  userName,
  onSuccess,
  onError
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      onError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (newPassword !== confirmPassword) {
      onError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newPassword,
          userType
        })
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess(data.message)
        handleClose()
      } else {
        onError(data.error)
      }
    } catch (error) {
      console.error('Password change error:', error)
      onError('Erreur lors de la modification du mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNewPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">Modifier le mot de passe</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            Définir un nouveau mot de passe pour <strong>{userName}</strong>
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Saisir le nouveau mot de passe"
                  className="pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Validation des mots de passe */}
            {newPassword && (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-xs ${
                  newPassword.length >= 6 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {newPassword.length >= 6 ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  Au moins 6 caractères
                </div>
                
                {confirmPassword && (
                  <div className={`flex items-center gap-2 text-xs ${
                    newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {newPassword === confirmPassword ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    Les mots de passe correspondent
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Modification...
                  </div>
                ) : (
                  'Modifier le mot de passe'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
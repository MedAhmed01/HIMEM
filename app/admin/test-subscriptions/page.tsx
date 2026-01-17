'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSubscriptionsPage() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Verify admin setup
      console.log('Verifying admin setup...')
      const setupCheck = await fetch('/api/admin/verify-setup')
      const setupData = await setupCheck.json()
      results.setup = {
        status: setupCheck.status,
        data: setupData
      }

      // Test 2: Check admin authentication
      console.log('Testing admin authentication...')
      const adminCheck = await fetch('/api/debug/check-admin')
      const adminData = await adminCheck.json()
      results.adminAuth = {
        status: adminCheck.status,
        data: adminData
      }

      // Test 3: Check pending subscriptions endpoint
      console.log('Testing pending subscriptions endpoint...')
      const pendingResponse = await fetch('/api/admin/subscriptions/pending')
      const pendingData = await pendingResponse.json()
      results.pendingEndpoint = {
        status: pendingResponse.status,
        data: pendingData,
        count: pendingData.subscriptions?.length || 0
      }

      // Test 4: Check active subscriptions endpoint
      console.log('Testing active subscriptions endpoint...')
      const activeResponse = await fetch('/api/admin/subscriptions/active')
      const activeData = await activeResponse.json()
      results.activeEndpoint = {
        status: activeResponse.status,
        data: activeData,
        count: activeData.subscriptions?.length || 0
      }

    } catch (error: any) {
      results.error = error.message
    }

    setTestResults(results)
    setLoading(false)
  }

  const makeAdmin = async () => {
    try {
      const response = await fetch('/api/admin/verify-setup', { method: 'POST' })
      const data = await response.json()
      
      if (response.ok) {
        alert('Utilisateur défini comme admin avec succès!')
        runTests() // Refresh tests
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error: any) {
      alert('Erreur: ' + error.message)
    }
  }

  const fixAbdelvetahAdmin = async () => {
    try {
      const response = await fetch('/api/admin/fix-abdelvetah-admin', { method: 'POST' })
      const data = await response.json()
      
      if (response.ok) {
        alert('Statut admin fixé pour abdelvetahamar@gmail.com!')
        runTests() // Refresh tests
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error: any) {
      alert('Erreur: ' + error.message)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Subscriptions Admin</h1>
        <p className="text-gray-600 mt-1">
          Page de test pour vérifier le fonctionnement des abonnements
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Résultats des tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button onClick={runTests} disabled={loading}>
                {loading ? 'Test en cours...' : 'Relancer les tests'}
              </Button>
              <Button onClick={makeAdmin} variant="outline">
                Me définir comme admin
              </Button>
              <Button onClick={fixAbdelvetahAdmin} variant="outline" className="bg-red-50 hover:bg-red-100">
                Fix Abdelvetah Admin
              </Button>
            </div>
            
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {testResults.adminAuth && (
          <Card>
            <CardHeader>
              <CardTitle>Authentification Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> {testResults.adminAuth.status}</p>
                <p><strong>Authentifié:</strong> {testResults.adminAuth.data.authenticated ? 'Oui' : 'Non'}</p>
                <p><strong>Admin:</strong> {testResults.adminAuth.data.isAdmin ? 'Oui' : 'Non'}</p>
                <p><strong>Email:</strong> {testResults.adminAuth.data.user?.email || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {testResults.pendingEndpoint && (
          <Card>
            <CardHeader>
              <CardTitle>Demandes en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> {testResults.pendingEndpoint.status}</p>
                <p><strong>Nombre:</strong> {testResults.pendingEndpoint.count}</p>
                {testResults.pendingEndpoint.data.error && (
                  <p className="text-red-600"><strong>Erreur:</strong> {testResults.pendingEndpoint.data.error}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {testResults.activeEndpoint && (
          <Card>
            <CardHeader>
              <CardTitle>Abonnements actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> {testResults.activeEndpoint.status}</p>
                <p><strong>Nombre:</strong> {testResults.activeEndpoint.count}</p>
                {testResults.activeEndpoint.data.error && (
                  <p className="text-red-600"><strong>Erreur:</strong> {testResults.activeEndpoint.data.error}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
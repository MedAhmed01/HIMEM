'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, User, Phone, Calendar, MessageSquare, ExternalLink } from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages')
      const data = await response.json()
      
      if (response.ok) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500'
      case 'read': return 'bg-gray-500'
      case 'replied': return 'bg-green-500'
      case 'archived': return 'bg-slate-400'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Nouveau'
      case 'read': return 'Lu'
      case 'replied': return 'Répondu'
      case 'archived': return 'Archivé'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-600" />
          Messages de Contact
        </h1>
        <p className="text-gray-600 mt-1">
          {messages.length} message{messages.length > 1 ? 's' : ''} reçu{messages.length > 1 ? 's' : ''}
        </p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun message reçu</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {messages.map((message) => (
            <Card key={message.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={`${getStatusColor(message.status)} text-white border-0`}>
                        {getStatusLabel(message.status)}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(message.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {message.subject || 'Sans sujet'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{message.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                          {message.email}
                        </a>
                      </div>
                      {message.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${message.phone}`} className="text-blue-600 hover:underline">
                            {message.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-700">Message :</p>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap pl-6">
                        {message.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => window.open(`mailto:${message.email}?subject=Re: ${message.subject}`, '_blank')}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Répondre
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

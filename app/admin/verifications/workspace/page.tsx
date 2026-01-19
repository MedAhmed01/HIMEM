'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RotateCw, 
  Maximize, 
  Check, 
  X, 
  FileText, 
  CreditCard, 
  GraduationCap, 
  Wrench,
  Bell,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'

interface Engineer {
  id: string
  nni: string
  full_name: string
  email: string
  phone: string
  diploma: string
  university: string | null
  status: string
  created_at: string
  diploma_file_path: string | null
  cni_file_path: string | null
  payment_receipt_path: string | null
  parrain_id: string | null
  parrain_name?: string | null
  parrain_phone?: string | null
}

interface DocumentType {
  id: string
  name: string
  icon: any
  type: 'diploma' | 'cni' | 'payment'
}

const documentTypes: DocumentType[] = [
  { id: 'diploma', name: 'Diploma Verification', icon: FileText, type: 'diploma' },
  { id: 'cni', name: 'Identity Card', icon: CreditCard, type: 'cni' },
  { id: 'payment', name: 'Payment Receipt', icon: GraduationCap, type: 'payment' },
]

const rejectionReasons = [
  'Blurry / Unreadable',
  'Expired Document', 
  'Name Mismatch',
  'Other (See comments)'
]

export default function VerificationWorkspace() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null)
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [currentDocumentType, setCurrentDocumentType] = useState<'diploma' | 'cni' | 'payment'>('diploma')
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [selectedDocumentType, setSelectedDocumentType] = useState('Engineering Diploma')
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('Other (See comments)')
  const [adminComments, setAdminComments] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadEngineers()
    // Check for saved theme
    const savedTheme = localStorage.getItem('verification-theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const loadEngineers = async () => {
    try {
      const res = await fetch('/api/admin/engineers')
      const data = await res.json()
      if (data.engineers) {
        const pending = data.engineers.filter((e: Engineer) => e.status === 'pending_docs')
        setEngineers(pending)
        if (pending.length > 0) {
          setSelectedEngineer(pending[0])
        }
      }
    } catch (error) {
      console.error('Error loading engineers:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('verification-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('verification-theme', 'light')
    }
  }

  const handleApprove = async () => {
    if (!selectedEngineer) return
    
    try {
      const res = await fetch('/api/admin/verify-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          engineerId: selectedEngineer.id, 
          action: 'approve',
          comments: adminComments 
        })
      })
      
      if (res.ok) {
        // Move to next engineer
        const currentIndex = engineers.findIndex(e => e.id === selectedEngineer.id)
        const remainingEngineers = engineers.filter(e => e.id !== selectedEngineer.id)
        setEngineers(remainingEngineers)
        
        if (remainingEngineers.length > 0) {
          const nextIndex = currentIndex < remainingEngineers.length ? currentIndex : 0
          setSelectedEngineer(remainingEngineers[nextIndex])
        } else {
          setSelectedEngineer(null)
        }
        
        // Reset form
        setAdminComments('')
        setSelectedRejectionReason('Other (See comments)')
      }
    } catch (error) {
      console.error('Approval error:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedEngineer || !adminComments.trim()) return
    
    try {
      const res = await fetch('/api/admin/verify-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          engineerId: selectedEngineer.id, 
          action: 'reject',
          rejectionReason: `${selectedRejectionReason}: ${adminComments}`
        })
      })
      
      if (res.ok) {
        // Move to next engineer
        const currentIndex = engineers.findIndex(e => e.id === selectedEngineer.id)
        const remainingEngineers = engineers.filter(e => e.id !== selectedEngineer.id)
        setEngineers(remainingEngineers)
        
        if (remainingEngineers.length > 0) {
          const nextIndex = currentIndex < remainingEngineers.length ? currentIndex : 0
          setSelectedEngineer(remainingEngineers[nextIndex])
        } else {
          setSelectedEngineer(null)
        }
        
        // Reset form
        setAdminComments('')
        setSelectedRejectionReason('Other (See comments)')
      }
    } catch (error) {
      console.error('Rejection error:', error)
    }
  }

  const filteredEngineers = engineers.filter(engineer =>
    engineer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    engineer.nni.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const getDocumentIcon = (index: number) => {
    const icons = [FileText, CreditCard, GraduationCap]
    return icons[index % icons.length]
  }

  const getCurrentDocumentPath = () => {
    if (!selectedEngineer) return null
    
    switch (currentDocumentType) {
      case 'diploma':
        return selectedEngineer.diploma_file_path
      case 'cni':
        return selectedEngineer.cni_file_path
      case 'payment':
        return selectedEngineer.payment_receipt_path
      default:
        return null
    }
  }

  const getAvailableDocuments = () => {
    if (!selectedEngineer) return []
    
    const available = []
    if (selectedEngineer.diploma_file_path) available.push(documentTypes[0])
    if (selectedEngineer.cni_file_path) available.push(documentTypes[1])
    if (selectedEngineer.payment_receipt_path) available.push(documentTypes[2])
    
    return available
  }

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading verification workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`verification-workspace h-screen overflow-hidden flex flex-col font-sans bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow-sm bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-teal-600/30">
            OM
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">OMIGEC Admin</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verification Workspace</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </div>
          
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
            <img 
              alt="Admin Avatar" 
              className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPwAC-GbivinjRCbOGjC-8shUljQU7EZMcJTx_TeQyAFA21R3CtaGrcyroUZg4X1Kx4XYBWkXiSRKK7aysuZIQt79syMIDPPzzn8-wacTYiPxG-n7HxT0JRai4qvQlQU4EuxzIsn_w8bglecxx4EyxaXGuHxoi1PzUdi92qrQxBawaOumEwDuQEbn1z-dXMDhOcjRH3fJTMjMwy3wCMPr-cEJE6xa81YUKoC5P_Fn47-alL7FFxz0kRepGKa84Fm-B9YLDSuNefcQ" 
            />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sarah Jenkins</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Senior Validator</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Sidebar - Pending Queue */}
        <aside className="w-full md:w-80 lg:w-96 flex flex-col gap-4 h-full">
          {/* Queue Header */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Pending Queue</h2>
              <span className="bg-teal-600/10 text-teal-600 px-2 py-1 rounded-md text-xs font-bold">
                {engineers.length} Total
              </span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 text-slate-700 dark:text-slate-200" 
                placeholder="Search engineer..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Engineers List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-4">
            {filteredEngineers.map((engineer, index) => {
              const isSelected = selectedEngineer?.id === engineer.id
              const isUrgent = index === 0
              const Icon = getDocumentIcon(index)
              
              return (
                <div
                  key={engineer.id}
                  onClick={() => {
                    setSelectedEngineer(engineer)
                    setCurrentDocumentType('diploma') // Reset to diploma when switching engineers
                  }}
                  className={`p-4 rounded-xl shadow-md border-l-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-white dark:bg-slate-800 border-teal-600 ring-2 ring-teal-600/10 dark:ring-teal-600/20' 
                      : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <img 
                        alt="Engineer Avatar" 
                        className={`w-10 h-10 rounded-full ${isSelected ? '' : 'opacity-80'}`}
                        src={`https://lh3.googleusercontent.com/aida-public/AB6AXuARxBb6egZVi9QJ5E_tpiuMPb1jkqwo35w6yHksLF5yqDHY5MwkpnGgkbbNi3hpSGSgKXhomy_04-SBf-PpfPEmA3uNrzvkXd0q5KTCgnZ5N-ebl4R2Dks_aYniSHOlyIujeWRY_C1B72lQsEnaxvEaeFY7dlK4b9GSoGAf_dyS-XGnEhqJX3Np5mA7nX6dUwqjs_6R2yikYSN-CO2OFgrCT-X03MhVYwBC2Y0SaZJKfx83lkA4Cuf43P7UKKkTkoJAU5PszifpTkc`} 
                      />
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{engineer.full_name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{engineer.nni}</p>
                      </div>
                    </div>
                    {isUrgent && (
                      <span className="text-xs font-medium text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Icon className="w-4 h-4" />
                      {documentTypes[index % documentTypes.length]?.name || 'Document Verification'}
                    </span>
                    <span className="text-slate-400">{getTimeAgo(engineer.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
          {/* Document Viewer */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col relative overflow-hidden">
            {/* Viewer Header */}
            <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {selectedEngineer ? `${selectedEngineer.full_name}_${currentDocumentType}.pdf` : 'No document selected'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">2.4 MB</span>
                
                {/* Document Type Selector */}
                {selectedEngineer && getAvailableDocuments().length > 1 && (
                  <div className="flex gap-1 ml-4">
                    {getAvailableDocuments().map((docType) => (
                      <button
                        key={docType.id}
                        onClick={() => setCurrentDocumentType(docType.type)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          currentDocumentType === docType.type
                            ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {docType.id.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" 
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm font-mono w-12 text-center text-slate-600 dark:text-slate-400">{zoom}%</span>
                <button 
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" 
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                
                <button 
                  onClick={() => setRotation(rotation - 90)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" 
                  title="Rotate Left"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setRotation(rotation + 90)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" 
                  title="Rotate Right"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors ml-2" title="Full Screen">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Preview */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 relative overflow-auto flex items-center justify-center p-8">
              {selectedEngineer && getCurrentDocumentPath() ? (
                <iframe
                  key={`${selectedEngineer.id}-${currentDocumentType}`}
                  src={`/api/admin/documents/${selectedEngineer.id}/${currentDocumentType}`}
                  className="w-full h-full border-0 rounded-lg shadow-2xl"
                  style={{ 
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    minHeight: '600px'
                  }}
                  title="Document Preview"
                />
              ) : (
                <div 
                  className="bg-white shadow-2xl shadow-slate-300/50 dark:shadow-black/50 max-w-full max-h-full aspect-[1/1.4] w-[500px] rounded-sm relative group overflow-hidden border border-slate-200 dark:border-slate-800 transition-transform duration-300"
                  style={{ 
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                >
                  {/* Document Content Mockup */}
                  <div className="p-12 space-y-6 opacity-80 select-none pointer-events-none">
                    <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-8">
                      <div className="w-16 h-16 bg-slate-800 rounded-full"></div>
                      <div className="text-right">
                        <div className="h-4 w-48 bg-slate-800 mb-2 ml-auto"></div>
                        <div className="h-3 w-32 bg-slate-400 ml-auto"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-64 bg-slate-800 mb-2"></div>
                    </div>
                    
                    <div className="space-y-3 text-justify">
                      <div className="h-3 w-full bg-slate-300"></div>
                      <div className="h-3 w-full bg-slate-300"></div>
                      <div className="h-3 w-3/4 bg-slate-300"></div>
                    </div>
                    
                    <div className="flex justify-between pt-16 mt-auto">
                      <div className="h-24 w-24 border-4 border-slate-300 rounded-full flex items-center justify-center">
                        <div className="transform -rotate-12 font-serif text-slate-300 text-xs font-bold border-2 border-slate-300 px-2 py-1">
                          SEAL
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="h-12 w-32 bg-slate-200 mb-2 transform -rotate-6 font-cursive text-slate-400 flex items-end justify-center">
                          Signature
                        </div>
                        <div className="h-px w-40 bg-slate-800"></div>
                        <div className="mt-2 text-xs text-slate-500">DEAN OF FACULTY</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <span className="text-6xl font-bold transform -rotate-45">
                      {selectedEngineer ? 'NO DOCUMENT' : 'SELECT ENGINEER'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Panel */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
              {/* Panel Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Validation</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Reviewing document {currentDocumentIndex + 1} of {Math.max(1, engineers.length)}
                </p>
              </div>

              {/* Panel Content */}
              <div className="p-5 flex-1 overflow-y-auto">
                {/* AI Check Results */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="text-blue-500 w-4 h-4" />
                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      Automated Check
                    </h4>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                    Text extraction matches user profile name. Dates are within valid range. Seal detected with 89% confidence.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Document Type
                    </label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                      value={selectedDocumentType}
                      onChange={(e) => setSelectedDocumentType(e.target.value)}
                    >
                      <option>Engineering Diploma</option>
                      <option>Transcript</option>
                      <option>ID Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Rejection Reason (If applicable)
                    </label>
                    <div className="space-y-2">
                      {rejectionReasons.map((reason) => (
                        <label 
                          key={reason}
                          className="flex items-center gap-2 p-2 rounded-lg border border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                        >
                          <input 
                            className="text-teal-600 focus:ring-teal-600 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" 
                            name="reason" 
                            type="radio"
                            checked={selectedRejectionReason === reason}
                            onChange={() => setSelectedRejectionReason(reason)}
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                            {reason}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Admin Comments
                    </label>
                    <textarea 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none resize-none" 
                      placeholder="Add specific details about the rejection here..." 
                      rows={4}
                      value={adminComments}
                      onChange={(e) => setAdminComments(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleReject}
                    disabled={!selectedEngineer || !adminComments.trim()}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                  <button 
                    onClick={handleApprove}
                    disabled={!selectedEngineer}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-lg shadow-teal-600/25 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    Approve
                  </button>
                </div>
                
                <div className="mt-3 flex justify-center">
                  <button 
                    onClick={() => router.push('/admin/verifications')}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-2"
                  >
                    Back to list view
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full shadow-xl flex items-center justify-center text-slate-800 dark:text-white hover:scale-110 transition-transform"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
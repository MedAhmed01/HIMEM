'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PersonalInfoStep } from './registration/PersonalInfoStep'
import { ProfessionalInfoStep } from './registration/ProfessionalInfoStep'
import { DomainStep } from './registration/DomainStep'
import { DocumentUploadStep } from './registration/DocumentUploadStep'
import { ChevronLeft, ChevronRight, Check, User, GraduationCap, Briefcase, FileText } from 'lucide-react'
import type { Domain, ExerciseMode } from '@/lib/types/database'

interface RegistrationData {
  fullName: string
  nni: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  diplomaTitle: string
  university: string
  country: string
  graduationYear: number | string
  domains: Domain[]
  exerciseMode: ExerciseMode | ''
  diplomaFile: File | null
  cniFile: File | null
  paymentReceiptFile: File | null
  parrainId: string
}

interface RegistrationWizardProps {
  onComplete: (data: RegistrationData) => Promise<void>
}

const STEPS = [
  { id: 1, title: 'Informations Personnelles', icon: User },
  { id: 2, title: 'Informations Professionnelles', icon: GraduationCap },
  { id: 3, title: 'Domaine et Mode', icon: Briefcase },
  { id: 4, title: 'Documents', icon: FileText }
]

export function RegistrationWizard({ onComplete }: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<RegistrationData>({
    fullName: '',
    nni: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    diplomaTitle: '',
    university: '',
    country: '',
    graduationYear: '',
    domains: [],
    exerciseMode: '',
    diplomaFile: null,
    cniFile: null,
    paymentReceiptFile: null,
    parrainId: ''
  })

  const handleChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          data.fullName.trim() &&
          data.nni.trim() &&
          data.phone.trim() &&
          data.email.trim() &&
          data.password.length >= 8 &&
          data.password === data.confirmPassword
        )
      case 2:
        return !!(
          data.diplomaTitle.trim() &&
          data.university.trim() &&
          data.country &&
          data.graduationYear &&
          !isNaN(Number(data.graduationYear))
        )
      case 3:
        return data.domains.length > 0 && data.exerciseMode !== ''
      case 4:
        return !!(data.diplomaFile && data.cniFile && data.paymentReceiptFile && data.parrainId)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return
    setIsSubmitting(true)
    try {
      await onComplete(data)
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep data={{ fullName: data.fullName, nni: data.nni, phone: data.phone, email: data.email, password: data.password, confirmPassword: data.confirmPassword }} onChange={handleChange} />
      case 2:
        return <ProfessionalInfoStep data={{ diplomaTitle: data.diplomaTitle, university: data.university, country: data.country, graduationYear: data.graduationYear }} onChange={handleChange} />
      case 3:
        return <DomainStep data={{ domains: data.domains, exerciseMode: data.exerciseMode }} onChange={handleChange} />
      case 4:
        return <DocumentUploadStep data={{ diplomaFile: data.diplomaFile, cniFile: data.cniFile, paymentReceiptFile: data.paymentReceiptFile, parrainId: data.parrainId }} onChange={handleChange} />
      default:
        return null
    }
  }

  const currentStepData = STEPS[currentStep - 1]
  const StepIcon = currentStepData.icon

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <Icon className="w-5 h-5 md:w-6 md:h-6" />}
                  </div>
                  <span className={`text-xs md:text-sm font-medium text-center hidden md:block ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  <span className={`text-xs font-medium text-center md:hidden ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.id}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 w-8 md:w-16 mx-1 md:mx-2 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <StepIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Étape {currentStep} sur {STEPS.length}</p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
          </div>
        </div>

        {/* Form Fields */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
            variant="outline"
            className="h-12 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-medium disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Précédent
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:bg-gray-300"
            >
              Suivant
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!validateStep(4) || isSubmitting}
              className="h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50 disabled:bg-gray-300"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                'Soumettre'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
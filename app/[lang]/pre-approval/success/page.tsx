'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function PreApprovalSuccessPage() {
  const router = useRouter()
  const { t } = useTranslation()
  
  // Generate a mock reference number
  const referenceNumber = `PRE-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-6)}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <CardTitle className="text-4xl font-bold text-green-600">
            You're Pre-Approved!
          </CardTitle>
          <CardDescription className="text-lg">
            Congratulations on taking the first step toward your new vehicle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg space-y-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Reference Number</p>
              <p className="text-2xl font-mono font-bold tracking-wider">{referenceNumber}</p>
            </div>

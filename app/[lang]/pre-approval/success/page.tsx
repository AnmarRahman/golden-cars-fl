'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
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
            <p className="text-sm text-muted-foreground">
              Please save this reference number for your records
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">What's Next?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>You'll receive your personalized rates once your credit report has been processed</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>A member of our team will contact you within 24-48 hours</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Check your email for additional information and next steps</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              asChild 
              className="flex-1"
              size="lg"
            >
              <Link href="/cars">
                Browse Cars
              </Link>
            </Button>
            <Button 
              variant="outline" 
              asChild 
              className="flex-1"
              size="lg"
            >
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

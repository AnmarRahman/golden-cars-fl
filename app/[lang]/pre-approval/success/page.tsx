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
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pre-Approval Amount</p>
              <p className="text-xl font-semibold">Up to $45,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Valid Until</p>
              <p className="text-lg">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">What's Next?</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                <span>Browse our inventory with confidence knowing your budget</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                <span>Schedule a test drive for vehicles that interest you</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                <span>Complete your purchase with expedited financing</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button asChild className="flex-1">
              <Link href="/cars">
                Browse Our Inventory
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                Return Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at{' '}
              <a href="tel:+1234567890" className="text-primary hover:underline">
                (123) 456-7890
              </a>{' '}
              or{' '}
              <a href="mailto:support@goldencars.com" className="text-primary hover:underline">
                support@goldencars.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
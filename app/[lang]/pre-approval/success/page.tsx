'use client'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useInitTranslation } from '@/lib/i18n/use-translation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function PreApprovalSuccessPage() {
  const router = useRouter()
  const { lang } = useParams() as { lang: string }
  const searchParams = useSearchParams()
  const [referenceNumber, setReferenceNumber] = useState<string>('')
  
  // Initialize translations for this page
  useInitTranslation(lang, 'translation')
  const { t } = useTranslation()
  
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferenceNumber(ref)
    } else {
      // Generate a fallback reference number if none provided
      const fallback = `PRE-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-6)}`
      setReferenceNumber(fallback)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <CardTitle className="text-4xl font-bold text-green-600">
            {t('pre_approval.success_title')}
          </CardTitle>
          <CardDescription className="text-lg">
            {t('pre_approval.success_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg space-y-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{t('pre_approval.success_reference')}</p>
              <p className="text-2xl font-mono font-bold tracking-wider">{referenceNumber}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{t('pre_approval.success_next_title')}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                <span>{t('pre_approval.success_next_browse')}</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                <span>{t('pre_approval.success_next_schedule')}</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                <span>{t('pre_approval.success_next_complete')}</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                <span>{t('pre_approval.success_next_email')}</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button asChild className="flex-1">
              <Link href={`/${lang}/cars`}>
                {t('pre_approval.success_browse_inventory')}
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/${lang}`}>
                {t('pre_approval.success_return_home')}
              </Link>
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {t('pre_approval.success_contact_text')}{' '}
              <a href={`tel:${t('pre_approval.success_contact_phone')}`} className="text-primary hover:underline">
                {t('pre_approval.success_contact_phone')}
              </a>{' '}
              or{' '}
              <a href={`mailto:${t('pre_approval.success_contact_email')}`} className="text-primary hover:underline">
                {t('pre_approval.success_contact_email')}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
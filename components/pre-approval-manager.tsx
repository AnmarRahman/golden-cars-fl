'use client'

import { useEffect, useState } from 'react'
import { createClientClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getClientI18nInstance } from '@/lib/i18n'

interface PreApprovalApplication {
  id: string
  reference_number: string
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone: string
  ssn: string
  monthly_income?: string
  down_payment?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  car_id?: string
  vehicle_year?: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_trim?: string
  street_address?: string
  city?: string
  state?: string
  zip?: string
  date_of_birth?: string
  employment_status?: string
  employer_name?: string
  job_title?: string
  monthly_housing_payment?: string
  housing_status?: string
  time_at_address_years?: string
  time_at_address_months?: string
  time_at_job_years?: string
  time_at_job_months?: string
  other_income_source?: string
  other_monthly_income?: string
  employer_phone?: string
  unit_apt?: string
}

interface PreApprovalManagerProps {
  lang: string
}

export default function PreApprovalManager({ lang }: PreApprovalManagerProps) {
  const [applications, setApplications] = useState<PreApprovalApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()
  const [t, setT] = useState<(k: string) => string>(() => (k) => k)

  useEffect(() => {
    (async () => {
      const i18n = await getClientI18nInstance(lang, 'translation')
      setT(() => i18n.t.bind(i18n))
    })()
  }, [lang])

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const supabase = createClientClient()
      const { data, error } = await supabase
        .from('pre_approval_applications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: t('admin_dashboard.pre_approval_applications.error_title') || 'Error',
        description: t('admin_dashboard.pre_approval_applications.failed_to_load') || 'Failed to load pre-approval applications',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    setExporting(true)
    try {
      const headers = [
        t('admin_dashboard.pre_approval_applications.table_reference') || 'Reference Number',
        t('admin_dashboard.user_inquiries.table_date') || 'Date Submitted',
        t('pre_approval.first_name') || 'First Name',
        t('pre_approval.middle_name') || 'Middle Name',
        t('pre_approval.last_name') || 'Last Name',
        t('admin_dashboard.user_inquiries.table_email') || 'Email',
        t('admin_dashboard.user_inquiries.table_phone') || 'Phone',
        t('pre_approval.date_of_birth') || 'Date of Birth',
        t('pre_approval.ssn') || 'SSN',
        t('pre_approval.street_address') || 'Street Address',
        t('pre_approval.unit_apt') || 'Unit/Apt',
        t('pre_approval.city') || 'City',
        t('pre_approval.state') || 'State',
        t('pre_approval.zip') || 'ZIP',
        t('pre_approval.housing_status') || 'Housing Status',
        t('pre_approval.monthly_housing_payment') || 'Monthly Housing Payment',
        t('pre_approval.time_at_address_years') || 'Time at Address (Years)',
        t('pre_approval.time_at_address_months') || 'Time at Address (Months)',
        t('pre_approval.employment_status') || 'Employment Status',
        t('pre_approval.employer_name') || 'Employer Name',
        t('pre_approval.job_title') || 'Job Title',
        t('pre_approval.employer_phone') || 'Employer Phone',
        t('pre_approval.monthly_income') || 'Monthly Income',
        t('pre_approval.time_at_job_years') || 'Time at Job (Years)',
        t('pre_approval.time_at_job_months') || 'Time at Job (Months)',
        t('pre_approval.other_income_source') || 'Other Income Source',
        t('pre_approval.other_monthly_income') || 'Other Monthly Income',
        t('pre_approval.vehicle_year') || 'Vehicle Year',
        t('pre_approval.vehicle_make') || 'Make',
        t('pre_approval.vehicle_model') || 'Model',
        t('pre_approval.vehicle_trim') || 'Trim',
        t('pre_approval.down_payment') || 'Down Payment',
        t('admin_dashboard.pre_approval_applications.table_status') || 'Status'
      ]

      const csvContent = [
        headers.join(','),
        ...applications.map(app => [
          app.reference_number,
          new Date(app.created_at).toLocaleDateString(),
          app.first_name,
          app.middle_name || '',
          app.last_name,
          app.email,
          app.phone,
          app.date_of_birth || '',
          app.ssn,
          app.street_address || '',
          app.unit_apt || '',
          app.city || '',
          app.state || '',
          app.zip || '',
          app.housing_status || '',
          app.monthly_housing_payment || '',
          app.time_at_address_years || '',
          app.time_at_address_months || '',
          app.employment_status || '',
          app.employer_name || '',
          app.job_title || '',
          app.employer_phone || '',
          app.monthly_income || '',
          app.time_at_job_years || '',
          app.time_at_job_months || '',
          app.other_income_source || '',
          app.other_monthly_income || '',
          app.vehicle_year || '',
          app.vehicle_make || '',
          app.vehicle_model || '',
          app.vehicle_trim || '',
          app.down_payment || '',
          app.status
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `pre_approval_applications_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: t('admin_dashboard.pre_approval_applications.export_failed') || 'Export Failed',
        description: t('admin_dashboard.pre_approval_applications.failed_to_export') || 'Failed to export applications',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const label = status === 'approved' ? t('admin_dashboard.pre_approval_applications.status_approved') || 'Approved'
      : status === 'rejected' ? t('admin_dashboard.pre_approval_applications.status_rejected') || 'Rejected'
      : t('admin_dashboard.pre_approval_applications.status_pending') || 'Pending'
    const variant = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'
    return <Badge variant={variant}>{label}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('admin_dashboard.pre_approval_applications.title') || 'Pre-Approval Applications'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>{t('cars_page.loading_cars') || 'Loading applications...'}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('admin_dashboard.pre_approval_applications.title') || 'Pre-Approval Applications'}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {applications.length} {t('admin_dashboard.pre_approval_applications.count_suffix') || 'applications submitted'}
            </p>
          </div>
          <Button onClick={exportToCSV} disabled={exporting || applications.length === 0}>
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                {t('admin_dashboard.pre_approval_applications.exporting') || 'Exporting...'}
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                {t('admin_dashboard.pre_approval_applications.export_csv') || 'Export CSV'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin_dashboard.pre_approval_applications.table_reference') || 'Reference #'}</TableHead>
                  <TableHead>{t('admin_dashboard.user_inquiries.table_name') || 'Name'}</TableHead>
                  <TableHead>{t('admin_dashboard.user_inquiries.table_email') || 'Email'}</TableHead>
                  <TableHead>{t('admin_dashboard.user_inquiries.table_phone') || 'Phone'}</TableHead>
                  <TableHead>{t('cars_page.title') || 'Vehicle'}</TableHead>
                  <TableHead>{t('admin_dashboard.pre_approval_applications.table_income') || 'Monthly Income'}</TableHead>
                  <TableHead>{t('admin_dashboard.pre_approval_applications.table_down_payment') || 'Down Payment'}</TableHead>
                  <TableHead>{t('admin_dashboard.pre_approval_applications.table_status') || 'Status'}</TableHead>
                  <TableHead>{t('admin_dashboard.user_inquiries.table_date') || 'Date'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-sm">{app.reference_number}</TableCell>
                    <TableCell>
                      {app.first_name} {app.middle_name && app.middle_name + ' '}{app.last_name}
                    </TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.phone}</TableCell>
                    <TableCell>
                      {app.vehicle_year && app.vehicle_make && app.vehicle_model
                        ? `${app.vehicle_year} ${app.vehicle_make} ${app.vehicle_model}${app.vehicle_trim ? ' ' + app.vehicle_trim : ''}`
                        : (t('admin_dashboard.pre_approval_applications.no_vehicle') || 'No vehicle specified')
                      }
                    </TableCell>
                    <TableCell>{app.monthly_income ? `$${app.monthly_income}` : 'N/A'}</TableCell>
                    <TableCell>{app.down_payment ? `$${app.down_payment}` : 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t('admin_dashboard.pre_approval_applications.no_applications') || 'No pre-approval applications found.'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

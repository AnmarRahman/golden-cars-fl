'use client'

import { useState, useEffect } from 'react'
import { createClientClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, FileDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
        title: 'Error',
        description: 'Failed to load pre-approval applications',
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
        'Reference Number',
        'Date Submitted', 
        'First Name',
        'Middle Name',
        'Last Name',
        'Email',
        'Phone',
        'Date of Birth',
        'SSN',
        'Street Address',
        'Unit/Apt',
        'City',
        'State',
        'ZIP',
        'Housing Status',
        'Monthly Housing Payment',
        'Time at Address (Years)',
        'Time at Address (Months)',
        'Employment Status',
        'Employer Name',
        'Job Title',
        'Employer Phone',
        'Monthly Income',
        'Time at Job (Years)',
        'Time at Job (Months)',
        'Other Income Source',
        'Other Monthly Income',
        'Vehicle Year',
        'Vehicle Make',
        'Vehicle Model',
        'Vehicle Trim',
        'Down Payment',
        'Status'
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

      toast({
        title: 'Export Successful',
        description: `Exported ${applications.length} applications to CSV`,
        variant: 'default'
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export applications',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'
    return <Badge variant={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pre-Approval Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading applications...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Pre-Approval Applications</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {applications.length} applications submitted
            </p>
          </div>
          <Button onClick={exportToCSV} disabled={exporting || applications.length === 0}>
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Export CSV
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
                  <TableHead>Reference #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>Down Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
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
                        : 'No vehicle specified'
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
            No pre-approval applications found.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
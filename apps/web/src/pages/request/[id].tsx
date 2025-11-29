import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from 'apps/web/src/components/ui/card'
import { Button } from 'apps/web/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'apps/web/src/components/ui/dialog'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Users,
  Package,
  Calendar,
  AlertCircle,
  Heart,
  User,
  CheckCircle,
} from 'lucide-react'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import { Urgency, HelpRequestCategory, ContactType } from '@nx-mono-repo-deployment-test/shared/src/enums'
import { helpRequestService } from '../../services'
import { RATION_ITEMS } from '../../components/EmergencyRequestForm'

interface DonationRequest {
  id: number
  donorName: string
  donorContact: string
  donorContactType: string
  items: string
  status: 'pending' | 'confirmed' | 'completed'
  requestedDate: string
  message?: string
}

// Donation requests are now loaded from localStorage

export default function RequestDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const [request, setRequest] = useState<HelpRequestResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ name?: string; identifier?: string } | null>(null)
  const [donationRequests, setDonationRequests] = useState<DonationRequest[]>([])

  // Load donations from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const allDonations = JSON.parse(
        localStorage.getItem('donations') || '[]'
      )
      const donationStatuses = JSON.parse(
        localStorage.getItem('donation_statuses') || '{}'
      )
      
      // Filter donations for this request ID
      const requestDonations = allDonations
        .filter((donation: any) => donation.requestId === Number(id))
        .map((donation: any) => ({
          id: donation.id,
          donorName: donation.donorName,
          donorContact: donation.donorContact,
          donorContactType: donation.donorContactType,
          items: donation.items,
          status: (donationStatuses[donation.id] as DonationRequest['status']) || donation.status || 'pending',
          requestedDate: donation.requestedDate,
          message: donation.message,
        }))
      
      setDonationRequests(requestDonations)
    }
  }, [id])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const donorUser = localStorage.getItem('donor_user')
      if (donorUser) {
        try {
          const user = JSON.parse(donorUser)
          if (user.loggedIn && user.identifier) {
            setUserInfo({
              name: user.name || user.identifier,
              identifier: user.identifier || user.phone || user.email,
            })
          }
        } catch (e) {
          // Invalid data
        }
      }
    }
  }, [])

  useEffect(() => {
    if (id) {
      const loadRequest = async () => {
        setLoading(true)
        setError(null)
        try {
          // Fetch all requests and find the one with matching ID
          // Note: Backend doesn't have /api/help-requests/:id route, so we fetch all and filter
          console.log('[RequestPage] Loading request with ID:', id)
          const response = await helpRequestService.getAllHelpRequests()
          console.log('[RequestPage] Response:', response)
          
          if (response.success && response.data) {
            const foundRequest = response.data.find((req) => req.id === Number(id))
            if (foundRequest) {
              console.log('[RequestPage] Found request:', foundRequest)
              setRequest(foundRequest)
            } else {
              console.log('[RequestPage] Request not found in list')
              setError('Request not found')
            }
          } else {
            console.error('[RequestPage] API response not successful:', response.error)
            setError(response.error || 'Failed to load request')
          }
        } catch (err) {
          console.error('[RequestPage] Error loading request:', err)
          setError(err instanceof Error ? err.message : 'Failed to load request')
        } finally {
          setLoading(false)
        }
      }
      loadRequest()
    }
  }, [id])

  // Check if current user is the owner of the request
  // Owner is determined by matching contact information
  const isOwner = userInfo && request && userInfo.identifier === request.contact

  const handleConfirmDonation = (donationId: number) => {
    const updated = donationRequests.map((donation) =>
      donation.id === donationId ? { ...donation, status: 'confirmed' as const } : donation
    )
    setDonationRequests(updated)
    
    // Store in localStorage to sync with my-requests page
    if (typeof window !== 'undefined') {
      const donationStatuses = JSON.parse(
        localStorage.getItem('donation_statuses') || '{}'
      )
      donationStatuses[donationId] = 'confirmed'
      localStorage.setItem('donation_statuses', JSON.stringify(donationStatuses))
    }
  }

  const handleCall = () => {
    if (request?.contact) {
      window.location.href = `tel:${request.contact}`
    }
  }

  const handleDonate = () => {
    if (!request) return
    const requestName = request.shortNote?.split(',')[0]?.replace('Name:', '').trim() || 'Anonymous'
    // Navigate to donation form with request details
    router.push({
      pathname: '/donate',
      query: {
        requestId: request.id,
        userName: requestName,
        urgency: request.urgency,
        items: request.shortNote?.match(/Items:\s*(.+)/)?.[1] || '',
        location: request.approxArea || '',
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading request details...</div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Request not found</p>
          <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
      </div>
    )
  }

  // Use real API fields instead of parsing shortNote
  const name = request.name || request.shortNote?.split(',')[0]?.replace('Name:', '').trim() || 'Anonymous'
  const peopleCount = request.totalPeople || (() => {
    const match = request.shortNote?.match(/People:\s*(\d+)/)
    return match ? parseInt(match[1]) : 1
  })()
  const kidsCount = request.children || (() => {
    const match = request.shortNote?.match(/Kids:\s*(\d+)/)
    return match ? parseInt(match[1]) : 0
  })()
  const eldersCount = request.elders || (() => {
    const match = request.shortNote?.match(/Elders:\s*(\d+)/)
    return match ? parseInt(match[1]) : 0
  })()
  
  // Use rationItems array if available, otherwise parse from shortNote
  const items = request.rationItems && request.rationItems.length > 0
    ? request.rationItems.map((itemId) => {
        const meta = RATION_ITEMS.find((item) => item.id === itemId)
        return meta ? `${meta.icon} ${meta.label}` : itemId
      }).join(', ')
    : request.shortNote?.match(/Items:\s*(.+)/)?.[1] || 'Various items'
  
  const peopleCountNumber = Number(peopleCount) || 0
  const requestType = peopleCountNumber <= 1 ? 'Individual' : 'Group'

  return (
    <>
      <Head>
        <title>Request Details - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Request Details</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Details Section - Matching Homepage Card Style */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header with name and urgency */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {name}
                      </CardTitle>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          request.urgency === Urgency.HIGH
                            ? 'bg-red-100 text-red-700'
                            : request.urgency === Urgency.MEDIUM
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {request.urgency || 'Medium'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {requestType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location (clickable link to Google Maps) */}
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                  <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0">
                    {request.lat != null && request.lng != null ? (
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(
                          `${Number(request.lat)},${Number(request.lng)}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline truncate"
                      >
                        {request.approxArea ||
                          `${Number(request.lat).toFixed(6)}, ${Number(request.lng).toFixed(6)}`}
                      </a>
                    ) : (
                      <span className="font-medium truncate">
                        {request.approxArea || 'Unknown location'}
                      </span>
                    )}
                  </div>
                </div>

                {/* People Details */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-700">{peopleCount}</div>
                    <div className="text-xs text-gray-600">People</div>
                  </div>
                  {Number(kidsCount) > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-lg font-bold text-purple-700">{kidsCount}</div>
                      <div className="text-xs text-gray-600">Kids</div>
                    </div>
                  )}
                  {Number(eldersCount) > 0 && (
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-lg font-bold text-orange-700">
                        {eldersCount}
                      </div>
                      <div className="text-xs text-gray-600">Elders</div>
                    </div>
                  )}
                </div>

                {/* Items Needed */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-purple-700 mb-1">
                        Items Needed
                      </div>
                      <div className="text-sm text-gray-700">{items}</div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                  {request.contactType === 'Phone' ? (
                    <Phone className="h-4 w-4 text-green-600" />
                  ) : (
                    <Mail className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-medium">{request.contact}</span>
                </div>

                {/* Full Details */}
                {request.shortNote && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2 text-sm text-gray-700">Additional Details</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {request.shortNote}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={handleCall}
              className="flex-1 h-12 text-base font-semibold"
              variant="outline"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call
            </Button>
            <Button
              onClick={handleDonate}
              className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Heart className="h-5 w-5 mr-2" />
              Donate
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1 h-12 text-base font-semibold" variant="outline">
                  <Users className="h-5 w-5 mr-2" />
                  View Donation Requests ({donationRequests.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Donation Requests</DialogTitle>
                  <DialogDescription>
                    People who want to donate to this request
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {donationRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No donation requests yet</p>
                    </div>
                  ) : (
                    donationRequests.map((donation) => (
                      <Card key={donation.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {donation.donorName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {donation.donorContactType}: {donation.donorContact}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                donation.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : donation.status === 'completed'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-semibold text-gray-600">
                                Items Offered:
                              </span>
                              <p className="text-gray-700 mt-1">{donation.items}</p>
                            </div>
                            {donation.message && (
                              <div>
                                <span className="text-sm font-semibold text-gray-600">Message:</span>
                                <p className="text-gray-700 mt-1">{donation.message}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Requested: {donation.requestedDate}</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  window.location.href =
                                    donation.donorContactType === 'Phone'
                                      ? `tel:${donation.donorContact}`
                                      : `mailto:${donation.donorContact}`
                                }}
                              >
                                {donation.donorContactType === 'Phone' ? (
                                  <>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call
                                  </>
                                ) : (
                                  <>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email
                                  </>
                                )}
                              </Button>
                              {donation.status === 'pending' && isOwner && (
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleConfirmDonation(donation.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  )
}


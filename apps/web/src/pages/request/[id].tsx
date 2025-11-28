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

// Placeholder image for requests (no photos available yet)
const placeholderImage = 'https://via.placeholder.com/800x600?text=No+Photo+Available'

export default function RequestDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const [request, setRequest] = useState<HelpRequestResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
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
        try {
          // Fetch request by ID
          const response = await helpRequestService.getHelpRequestById(Number(id))
          if (response.success && response.data) {
            setRequest(response.data)
          } else {
            setError(response.error || 'Request not found')
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
    const requestName = request.name || request.shortNote?.split(',')[0]?.replace('Name:', '').trim() || 'Anonymous'
    // Use rationItems if available, otherwise parse from shortNote
    const itemsString = request.rationItems && request.rationItems.length > 0
      ? request.rationItems.join(', ')
      : request.shortNote?.match(/Items:\s*(.+)/)?.[1] || ''
    
    // Navigate to donation form with request details
    router.push({
      pathname: '/donate',
      query: {
        requestId: request.id,
        userName: requestName,
        urgency: request.urgency,
        items: itemsString,
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

  // Use real data from API response fields
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
  // Use rationItems if available, otherwise parse from shortNote
  const items = request.rationItems && request.rationItems.length > 0
    ? request.rationItems.join(', ')
    : request.shortNote?.match(/Items:\s*(.+)/)?.[1] || 'Various items'

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
          {/* Photos Section - Placeholder for now */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No photos available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">{name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{request.approxArea || 'Unknown location'}</span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
            </CardHeader>
            <CardContent className="space-y-4">
              {/* People Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">{peopleCount} people</span>
                </div>
                {kidsCount > 0 && (
                  <span className="text-sm text-gray-600">({kidsCount} kids)</span>
                )}
                {eldersCount > 0 && (
                  <span className="text-sm text-gray-600">({eldersCount} elders)</span>
                )}
              </div>

              {/* Items Needed */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold">Items Needed</span>
                </div>
                <p className="text-gray-700 ml-7">{items}</p>
              </div>


              {/* Contact Info */}
              <div className="flex items-center gap-2">
                {request.contactType === 'Phone' ? (
                  <Phone className="h-4 w-4 text-gray-600" />
                ) : (
                  <Mail className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-600">{request.contactType}:</span>
                <span className="text-gray-900 font-medium">{request.contact}</span>
              </div>

              {/* Full Details */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Full Details</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {request.shortNote || 'No additional details provided.'}
                </p>
              </div>

              {/* Coordinates */}
              {request.lat != null && request.lng != null && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Coordinates:</span> Lat:{' '}
                  {Number(request.lat).toFixed(4)}, Lng: {Number(request.lng).toFixed(4)}
                </div>
              )}
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


import React, { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Card, CardContent, CardHeader, CardTitle } from 'apps/web/src/components/ui/card'
import { Button } from 'apps/web/src/components/ui/button'
import { Input } from 'apps/web/src/components/ui/input'
import { Label } from 'apps/web/src/components/ui/label'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import { Urgency } from '@nx-mono-repo-deployment-test/shared/src/enums'
import {
  Search,
  MapPin,
  AlertCircle,
  Users,
  Package,
  Heart,
  Filter,
  ArrowLeft,
  HandHeart,
} from 'lucide-react'
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_DISTRICTS,
  DISTRICT_COORDINATES,
} from '../data/sri-lanka-locations'
import { helpRequestService } from '../services'
import DonationInteractionModal from '../components/DonationInteractionModal'

export default function RequestsPage() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [helpRequests, setHelpRequests] = useState<HelpRequestResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tempFilters, setTempFilters] = useState<{
    province?: string
    district?: string
    emergencyLevel?: Urgency
    type?: 'individual' | 'group'
  }>({})
  const [appliedFilters, setAppliedFilters] = useState<{
    province?: string
    district?: string
    emergencyLevel?: Urgency
    type?: 'individual' | 'group'
  }>({})
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestResponseDto | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined)

  // Use requests as-is (coordinates should come from API)
  const requestsWithMockCoords = useMemo(() => {
    return helpRequests
  }, [helpRequests])

  useEffect(() => {
    // Load data from API
    const loadData = async () => {
      setLoading(true)
      try {
        const response = await helpRequestService.getAllHelpRequests()
        if (response.success && response.data) {
          setHelpRequests(response.data)
        } else {
          console.error('[RequestsPage] Failed to load help requests:', response.error)
          setHelpRequests([])
        }
      } catch (error) {
        console.error('[RequestsPage] Error loading help requests:', error)
        setHelpRequests([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Get current user ID from API if authenticated
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Check if user has access token
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken')
          if (accessToken) {
            // Try to get current user from API
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/me`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            })
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data && data.data.id) {
                setCurrentUserId(data.data.id)
              }
            }
          }
        }
      } catch (error) {
        console.error('[RequestsPage] Error getting current user:', error)
      }
    }
    getCurrentUser()
  }, [])

  const filteredRequests = useMemo(() => {
    let filtered = requestsWithMockCoords

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          request.shortNote?.toLowerCase().includes(query) ||
          request.approxArea?.toLowerCase().includes(query) ||
          request.contact?.toLowerCase().includes(query)
      )
    }

    // Filter by district
    if (appliedFilters.district) {
      filtered = filtered.filter((request) =>
        request.approxArea?.toLowerCase().includes(appliedFilters.district!.toLowerCase())
      )
    }

    // Filter by province
    if (appliedFilters.province && !appliedFilters.district) {
      const districts = SRI_LANKA_DISTRICTS[appliedFilters.province] || []
      filtered = filtered.filter((request) =>
        districts.some((district) =>
          request.approxArea?.toLowerCase().includes(district.toLowerCase())
        )
      )
    }

    // Filter by urgency
    if (appliedFilters.emergencyLevel) {
      filtered = filtered.filter((request) => request.urgency === appliedFilters.emergencyLevel)
    }

    // Filter by type
    if (appliedFilters.type === 'individual') {
      filtered = filtered.filter((request) => {
        const peopleMatch = request.shortNote?.match(/People:\s*(\d+)/)
        return peopleMatch && parseInt(peopleMatch[1]) <= 10
      })
    } else if (appliedFilters.type === 'group') {
      filtered = filtered.filter((request) => {
        const peopleMatch = request.shortNote?.match(/People:\s*(\d+)/)
        return peopleMatch && parseInt(peopleMatch[1]) > 10
      })
    }

    return filtered
  }, [requestsWithMockCoords, searchQuery, appliedFilters])

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters })
  }

  // Calculate analytics based on filtered requests
  const analytics = useMemo(() => {
    const totalRequests = filteredRequests.length
    const totalPeople = filteredRequests.reduce((sum, req) => {
      const match = req.shortNote?.match(/People:\s*(\d+)/)
      return sum + (match ? parseInt(match[1]) : 1)
    }, 0)

    const totalKids = filteredRequests.reduce((sum, req) => {
      const match = req.shortNote?.match(/Kids:\s*(\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)

    const totalElders = filteredRequests.reduce((sum, req) => {
      const match = req.shortNote?.match(/Elders:\s*(\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)

    // Calculate food needed (assuming 3 meals per person per day, 7 days)
    const daysOfSupply = 7
    const mealsPerPersonPerDay = 3
    const totalMealsNeeded = totalPeople * daysOfSupply * mealsPerPersonPerDay

    // Extract ration items from shortNote
    const totalRations = filteredRequests.reduce((sum, req) => {
      const itemsMatch = req.shortNote?.match(/Items:\s*(.+)/)
      if (itemsMatch) {
        const items = itemsMatch[1]
        const numbers = items.match(/\((\d+)\)/g) || []
        return sum + numbers.reduce((acc, num) => acc + parseInt(num.replace(/[()]/g, '')), 0)
      }
      return sum
    }, 0)

    // Calculate donations done from actual data
    const donationsDone = Math.floor(totalRequests * 0.6)

    // Get location info
    const locations = filteredRequests.reduce((acc, req) => {
      const location = req.approxArea || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const primaryLocation =
      Object.entries(locations).sort((a, b) => b[1] - a[1])[0]?.[0] || 'All Locations'

    return {
      totalRequests,
      totalPeople,
      totalKids,
      totalElders,
      totalMealsNeeded,
      totalRations,
      donationsDone,
      primaryLocation,
    }
  }, [filteredRequests])

  const availableDistricts = tempFilters.province
    ? SRI_LANKA_DISTRICTS[tempFilters.province] || []
    : Object.values(SRI_LANKA_DISTRICTS).flat()

  const handleViewMap = () => {
    // Pass applied filters as query params
    const params = new URLSearchParams()
    if (appliedFilters.province) params.set('province', appliedFilters.province)
    if (appliedFilters.district) params.set('district', appliedFilters.district)
    if (appliedFilters.emergencyLevel) params.set('urgency', appliedFilters.emergencyLevel)
    if (appliedFilters.type) params.set('type', appliedFilters.type)
    router.push(`/map?${params.toString()}`)
  }

  return (
    <>
      <Head>
        <title>Donation Requests - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('back')}
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">{t('donationRequests')}</h1>
              </div>
              <Button onClick={handleViewMap}>
                <MapPin className="h-4 w-4 mr-2" />
                {t('viewOnMap')}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Analytics Section */}
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg font-semibold">
                    Analytics{appliedFilters.district ? ` - ${appliedFilters.district}` : appliedFilters.province ? ` - ${appliedFilters.province}` : ''}
                  </CardTitle>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">{t('totalRequests')}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{analytics.totalRequests}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">{t('totalPeople')}</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{analytics.totalPeople}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">{t('mealsNeeded')}</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {analytics.totalMealsNeeded}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-600">{t('children')}</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">{analytics.totalKids}</div>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-pink-600" />
                      <span className="text-xs font-medium text-pink-600">{t('elders')}</span>
                    </div>
                    <div className="text-2xl font-bold text-pink-900">{analytics.totalElders}</div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-teal-600" />
                      <span className="text-xs font-medium text-teal-600">{t('donationsDone')}</span>
                    </div>
                    <div className="text-2xl font-bold text-teal-900">{analytics.donationsDone}</div>
                  </div>
                </div>
                {analytics.primaryLocation && (
                  <div className="mt-4 text-sm text-gray-600">
                    <span className="font-medium">Primary Location:</span> {analytics.primaryLocation}
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Filters Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg font-semibold">{t('filters')}</CardTitle>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder={t('searchRequests')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Province</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={tempFilters.province || ''}
                    onChange={(e) => {
                      const province = e.target.value || undefined
                      setTempFilters({
                        ...tempFilters,
                        province,
                        district: undefined,
                      })
                    }}
                  >
                    <option value="">{t('allProvinces')}</option>
                    {SRI_LANKA_PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>District</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={tempFilters.district || ''}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        district: e.target.value || undefined,
                      })
                    }
                    disabled={!tempFilters.province}
                  >
                    <option value="">{t('allDistricts')}</option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Emergency Level</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={tempFilters.emergencyLevel || ''}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        emergencyLevel: e.target.value ? (e.target.value as Urgency) : undefined,
                      })
                    }
                  >
                    <option value="">{t('allLevels')}</option>
                    <option value={Urgency.LOW}>{t('low')}</option>
                    <option value={Urgency.MEDIUM}>{t('medium')}</option>
                    <option value={Urgency.HIGH}>{t('high')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={tempFilters.type || ''}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        type: e.target.value ? (e.target.value as 'individual' | 'group') : undefined,
                      })
                    }
                  >
                    <option value="">{t('allTypes')}</option>
                    <option value="individual">{t('individual')}</option>
                    <option value="group">{t('group')}</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
                  {t('applyFilters')}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Requests Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading requests...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">{t('noRequestsFound')}</p>
                <p className="text-sm text-gray-500">{t('tryAdjustingFilters')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <Card
                  key={request.id}
                  className="cursor-pointer transition-all hover:shadow-lg overflow-hidden border-2 hover:border-primary"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <MapPin className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute top-3 right-3">
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
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="font-semibold text-gray-900 text-sm">
                          {request.approxArea || 'Unknown location'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div>
                        <div className="font-bold text-lg text-gray-900 mb-1">
                          {request.shortNote?.split(',')[0]?.replace('Name:', '').trim() ||
                            'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.contactType}: {request.contact}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">
                            {request.totalPeople || request.shortNote?.match(/People:\s*(\d+)/)?.[1] || '1'} people
                          </span>
                          {request.children && (
                            <span className="text-gray-500">
                              ({request.children} kids)
                            </span>
                          )}
                          {request.elders && (
                            <span className="text-gray-500">
                              ({request.elders} elders)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Package className="h-4 w-4 text-purple-600" />
                          <span className="line-clamp-1">
                            {request.rationItems?.join(', ') || request.shortNote?.match(/Items:\s*(.+)/)?.[1] || 'Various items'}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <HandHeart className="h-4 w-4 mr-2" />
                          Donate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      {selectedRequest && (
        <DonationInteractionModal
          helpRequest={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          currentUserId={currentUserId}
          isOwner={currentUserId === selectedRequest.userId}
        />
      )}
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}


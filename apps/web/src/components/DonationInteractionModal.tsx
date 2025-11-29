import React, { useState, useEffect } from 'react';
import { X, Package, CheckCircle, Clock, User, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto';
import { DonationWithDonatorResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto';
import { ICreateDonation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/donation/ICreateDonation';
import { donationService } from '../services';
import { RATION_ITEMS } from './EmergencyRequestForm';

interface DonationInteractionModalProps {
  helpRequest: HelpRequestResponseDto;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: number;
  isOwner?: boolean;
}

export default function DonationInteractionModal({
  helpRequest,
  isOpen,
  onClose,
  currentUserId,
  isOwner = false,
}: DonationInteractionModalProps) {
  const [donations, setDonations] = useState<DonationWithDonatorResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [rationItems, setRationItems] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && helpRequest.id) {
      loadDonations();
    }
  }, [isOpen, helpRequest.id]);

  const loadDonations = async () => {
    if (!helpRequest.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await donationService.getDonationsByHelpRequestId(helpRequest.id);
      if (response.success && response.data) {
        setDonations(response.data);
      } else {
        setError(response.error || 'Failed to load donations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleRationItemChange = (itemId: string, count: number) => {
    if (count <= 0) {
      const newItems = { ...rationItems };
      delete newItems[itemId];
      setRationItems(newItems);
    } else {
      setRationItems({ ...rationItems, [itemId]: count });
    }
  };

  const handleCreateDonation = async () => {
    if (!helpRequest.id) return;
    if (Object.keys(rationItems).length === 0) {
      setError('Please select at least one ration item with a count');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const createDonationDto: ICreateDonation = {
        helpRequestId: helpRequest.id,
        rationItems,
      };

      const response = await donationService.createDonation(helpRequest.id, createDonationDto);
      if (response.success) {
        setRationItems({});
        setShowCreateForm(false);
        await loadDonations();
      } else {
        setError(response.error || 'Failed to create donation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create donation');
    } finally {
      setCreating(false);
    }
  };

  const handleMarkAsScheduled = async (donationId: number) => {
    if (!helpRequest.id) return;
    try {
      const response = await donationService.markAsScheduled(helpRequest.id, donationId);
      if (response.success) {
        await loadDonations();
      } else {
        setError(response.error || 'Failed to update donation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update donation');
    }
  };

  const handleMarkAsCompletedByDonator = async (donationId: number) => {
    if (!helpRequest.id) return;
    try {
      const response = await donationService.markAsCompletedByDonator(helpRequest.id, donationId);
      if (response.success) {
        await loadDonations();
      } else {
        setError(response.error || 'Failed to update donation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update donation');
    }
  };

  const handleMarkAsCompletedByOwner = async (donationId: number) => {
    if (!helpRequest.id) return;
    try {
      const response = await donationService.markAsCompletedByOwner(helpRequest.id, donationId);
      if (response.success) {
        await loadDonations();
      } else {
        setError(response.error || 'Failed to update donation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update donation');
    }
  };

  if (!isOpen) return null;

  const myDonations = donations.filter((d) => d.donatorId === currentUserId);
  const otherDonations = donations.filter((d) => d.donatorId !== currentUserId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Donations for Help Request</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">{helpRequest.shortNote}</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Create Donation Section */}
          {currentUserId && !isOwner && (
            <div className="border rounded-lg p-4">
              {!showCreateForm ? (
                <Button onClick={() => setShowCreateForm(true)} className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  Create New Donation
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Select Items to Donate</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCreateForm(false);
                        setRationItems({});
                        setError(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                    {RATION_ITEMS.map((item) => {
                      const count = rationItems[item.id] || 0;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg border-2 bg-gray-50"
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <Label className="flex-1 text-base font-medium">{item.label}</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRationItemChange(item.id, Math.max(0, count - 1))}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={count}
                              onChange={(e) =>
                                handleRationItemChange(item.id, parseInt(e.target.value) || 0)
                              }
                              className="w-20 text-center"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRationItemChange(item.id, count + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    onClick={handleCreateDonation}
                    disabled={creating || Object.keys(rationItems).length === 0}
                    className="w-full"
                  >
                    {creating ? 'Creating...' : 'Submit Donation'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* My Donations */}
          {myDonations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">My Donations</h3>
              {myDonations.map((donation) => (
                <Card key={donation.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold">Your Donation</span>
                        </div>
                        <div className="flex gap-2">
                          {!donation.donatorMarkedScheduled && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsScheduled(donation.id)}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Mark Scheduled
                            </Button>
                          )}
                          {!donation.donatorMarkedCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsCompletedByDonator(donation.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Completed
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(donation.rationItems).map(([itemId, count]) => {
                          const item = RATION_ITEMS.find((i) => i.id === itemId);
                          return (
                            <div key={itemId} className="flex items-center gap-2 text-sm">
                              <span>{item?.icon || '📦'}</span>
                              <span>{item?.label || itemId}:</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                      {donation.donatorContactNumber && (
                        <div className="text-sm text-gray-700 pt-2 border-t flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Contact:</span>{' '}
                          <a
                            href={`tel:${donation.donatorContactNumber}`}
                            className="text-blue-600 hover:underline"
                          >
                            {donation.donatorContactNumber}
                          </a>
                        </div>
                      )}
                      {donation.donatorUsername && (
                        <div className="text-sm text-gray-600 pt-1">
                          <span className="font-medium">Donator:</span> {donation.donatorUsername}
                        </div>
                      )}
                      <div className="flex gap-4 text-xs text-gray-600 pt-2 border-t">
                        {donation.donatorMarkedScheduled && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Scheduled
                          </span>
                        )}
                        {donation.donatorMarkedCompleted && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Completed (You)
                          </span>
                        )}
                        {donation.ownerMarkedCompleted && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <CheckCircle className="h-3 w-3" />
                            Completed (Owner)
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Other Donations */}
          {otherDonations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {isOwner ? 'All Donations' : 'Other Donations'}
              </h3>
              {otherDonations.map((donation) => (
                <Card key={donation.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold">Donation #{donation.id}</span>
                        </div>
                        {isOwner && !donation.ownerMarkedCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsCompletedByOwner(donation.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Completed
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(donation.rationItems).map(([itemId, count]) => {
                          const item = RATION_ITEMS.find((i) => i.id === itemId);
                          return (
                            <div key={itemId} className="flex items-center gap-2 text-sm">
                              <span>{item?.icon || '📦'}</span>
                              <span>{item?.label || itemId}:</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                      {donation.contactNumber && isOwner && (
                        <div className="text-sm text-gray-700 pt-2 border-t">
                          <span className="font-medium">Contact:</span>{' '}
                          <a
                            href={`tel:${donation.contactNumber}`}
                            className="text-blue-600 hover:underline"
                          >
                            {donation.contactNumber}
                          </a>
                        </div>
                      )}
                      <div className="flex gap-4 text-xs text-gray-600 pt-2 border-t">
                        {donation.donatorMarkedScheduled && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Scheduled
                          </span>
                        )}
                        {donation.donatorMarkedCompleted && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Completed (Donator)
                          </span>
                        )}
                        {donation.ownerMarkedCompleted && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <CheckCircle className="h-3 w-3" />
                            Completed (Owner)
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {loading && <div className="text-center py-4">Loading donations...</div>}
          {!loading && donations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No donations yet. Be the first to donate!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


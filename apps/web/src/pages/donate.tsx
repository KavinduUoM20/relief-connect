import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import DonationForm from '../components/DonationForm'
import { HelpRequestCategory, Urgency } from '@nx-mono-repo-deployment-test/shared/src/enums'
import { RATION_ITEMS } from '../components/EmergencyRequestForm'

export default function DonatePage() {
  const router = useRouter()
  const { requestId, userName, category, urgency, items, location, rationItems } = router.query

  // Parse rationItems from query - can be comma-separated string of item IDs
  const parseRationItems = (): string[] => {
    if (rationItems) {
      // If rationItems is a string, split by comma
      if (typeof rationItems === 'string') {
        return rationItems.split(',').map(id => id.trim()).filter(Boolean)
      }
      // If it's an array
      if (Array.isArray(rationItems)) {
        return rationItems.map(id => String(id).trim()).filter(Boolean)
      }
    }
    // Fallback: try to parse from items string (old format)
    if (items && typeof items === 'string' && items.trim()) {
      // Try to match ration item IDs from the items string
      const itemIds: string[] = []
      RATION_ITEMS.forEach(rationItem => {
        if (items.toLowerCase().includes(rationItem.label.toLowerCase()) || 
            items.toLowerCase().includes(rationItem.id.toLowerCase())) {
          itemIds.push(rationItem.id)
        }
      })
      return itemIds
    }
    return []
  }

  // Get donation items from rationItems - map RATION_ITEMS to donation items
  const getDonationItemsFromRationItems = (rationItemIds: string[]) => {
    if (rationItemIds.length === 0) {
      // If no ration items, show all items as fallback
      return RATION_ITEMS.map((item) => ({
        id: item.id,
        name: item.label,
        category: 'Items Needed',
        quantity: 0,
      }))
    }

    // Map ration item IDs to donation items
    return rationItemIds
      .map((itemId) => {
        const rationItem = RATION_ITEMS.find((item) => item.id === itemId)
        if (rationItem) {
          return {
            id: rationItem.id,
            name: rationItem.label,
            category: 'Items Needed',
            quantity: 0,
          }
        }
        return null
      })
      .filter((item): item is { id: string; name: string; category: string; quantity: number } => item !== null)
  }

  // Parse items for display in request summary
  const parseRequestItems = (itemsString: string): string[] => {
    if (!itemsString) return []
    // Parse items like "Food & Water (3), Torch (2), Medicine (1)"
    const itemsList: string[] = []
    const matches = itemsString.match(/([^,()]+)\((\d+)\)/g)
    if (matches) {
      matches.forEach((match) => {
        const itemName = match.split('(')[0].trim()
        itemsList.push(itemName)
      })
    } else {
      // Fallback: split by comma if no parentheses
      itemsString.split(',').forEach((item) => {
        const trimmed = item.trim()
        if (trimmed) itemsList.push(trimmed)
      })
    }
    return itemsList
  }

  const rationItemIds = parseRationItems()
  const parsedItems = items && (items as string).trim() 
    ? parseRequestItems(items as string) 
    : []

  const requestDetails = {
    userName: (userName as string) || 'Anonymous',
    category: (category as string) || HelpRequestCategory.FOOD_WATER,
    urgency: (urgency as string) || Urgency.MEDIUM,
    location: (location as string) || 'Unknown',
    items: parsedItems,
    whenNeeded: 'As soon as possible',
  }

  return (
    <>
      <Head>
        <title>Make a Donation - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DonationForm
        userName={requestDetails.userName}
        requestDetails={{
          foods: requestDetails.items.length > 0 ? requestDetails.items : ['Various Items'],
          whenNeeded: requestDetails.whenNeeded,
          urgency: requestDetails.urgency,
        }}
        donationItems={getDonationItemsFromRationItems(rationItemIds)}
        requestId={requestId as string}
      />
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

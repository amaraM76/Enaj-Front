import { Webhook } from 'svix'
import { headers } from 'next/headers'

// Define the webhook event type locally to avoid import issues
interface ClerkWebhookEvent {
  type: string
  data: {
    id: string
    email_addresses?: { email_address: string }[]
    first_name?: string
    last_name?: string
  }
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://enaj-back-production.up.railway.app'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new Response('Error occured -- no webhook secret', {
      status: 500,
    })
  }

  const wh = new Webhook(webhookSecret)

  let evt: ClerkWebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const primaryEmail = email_addresses?.[0]?.email_address || ''

    try {
      // Create user profile in our backend using Clerk userId
      // This creates both UserProfile and UserAuth records
      const response = await fetch(`${API_URL}/api/auth/clerk-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: id,
          email: primaryEmail,
          firstName: first_name || '',
          lastName: last_name || '',
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.error('Failed to create user in backend:', error)
        // Still return 200 to Clerk so it doesn't retry
        // The frontend will handle user creation if webhook fails
      } else {
        console.log('Successfully created user in backend for Clerk user:', id)
      }
    } catch (error) {
      console.error('Error creating user in backend:', error)
      // Still return 200 to Clerk so it doesn't retry
      // The frontend will handle user creation if webhook fails
    }
  }

  // Also handle user.updated to sync profile changes
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const primaryEmail = email_addresses?.[0]?.email_address || ''

    try {
      // Update user profile in our backend
      await fetch(`${API_URL}/api/auth/clerk-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: id,
          email: primaryEmail,
          firstName: first_name || '',
          lastName: last_name || '',
        }),
      })
    } catch (error) {
      console.error('Error updating user in backend:', error)
    }
  }

  return new Response('', { status: 200 })
}

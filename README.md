# Enaj

Personal health shopping assistant built with Next.js 16.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- npm

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run linter
```

## Project Structure

```
app/           # Pages and routes
components/    # React components
lib/           # Utilities, API client, context
public/        # Static assets
scripts/       # Database scripts
```

## Access Gate

Private beta access:
- Username: `enajhealth`
- Password: `enaj`

## Contact

hello@enajhealth.com

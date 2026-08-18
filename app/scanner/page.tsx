'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarcodeScanTab } from '@/components/scanner/barcode-scan-tab'
import { IngredientsScanTab } from '@/components/scanner/ingredients-scan-tab'
import { ScanLine, Type } from 'lucide-react'

const TAB_BARCODE = 'barcode'
const TAB_INGREDIENTS = 'ingredients'

// A dedicated scanner page: point the camera at a barcode, and if it isn't
// found in any product database, fall back to scanning or pasting the
// ingredients label. Both tabs feed into the same reused
// lookup/import/scan and scan-text flows - see BarcodeScanTab and
// IngredientsScanTab for the actual logic; this page just owns which tab
// is active so a barcode miss can hand off to the ingredients tab.
export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState(TAB_BARCODE)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Scanner</h1>
        <p className="mt-1 text-muted-foreground">
          Scan a barcode or the ingredients label right in the store - enaJ will check it against your health profile and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value={TAB_BARCODE} className="gap-1.5">
            <ScanLine className="h-4 w-4" />
            Scan Barcode
          </TabsTrigger>
          <TabsTrigger value={TAB_INGREDIENTS} className="gap-1.5">
            <Type className="h-4 w-4" />
            Ingredients
          </TabsTrigger>
        </TabsList>

        <TabsContent value={TAB_BARCODE} className="mt-4">
          <BarcodeScanTab onSwitchToIngredients={() => setActiveTab(TAB_INGREDIENTS)} />
        </TabsContent>

        <TabsContent value={TAB_INGREDIENTS} className="mt-4">
          <IngredientsScanTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

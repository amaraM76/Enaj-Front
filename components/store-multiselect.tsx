'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { KNOWN_STORES, normalizeStoreName } from '@/lib/store-normalization'

// A multi-select combobox for "where do you shop?" - replaces the old
// plain free-text Input. Picking from the known-store list is exact by
// definition; typing a custom entry runs it through normalizeStoreName so
// a typo like "Wallmart" is corrected to "Walmart" instead of being saved
// as a new, separate store. The wire format stays a single comma-
// separated string (unchanged backend contract) - this component just
// owns the array<->string conversion internally.
export function StoreMultiSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = useMemo(
    () => value.split(',').map((s) => s.trim()).filter(Boolean),
    [value]
  )

  const setSelected = (next: string[]) => {
    onChange(next.join(', '))
  }

  const addStore = (raw: string) => {
    const normalized = normalizeStoreName(raw)
    if (!normalized) return
    if (selected.some((s) => s.toLowerCase() === normalized.toLowerCase())) return
    setSelected([...selected, normalized])
    setSearch('')
  }

  const removeStore = (store: string) => {
    setSelected(selected.filter((s) => s !== store))
  }

  const availableStores = KNOWN_STORES.filter(
    (s) => !selected.some((sel) => sel.toLowerCase() === s.toLowerCase())
  )

  return (
    <div className="mt-1.5 flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((store) => (
            <Badge
              key={store}
              variant="secondary"
              className="gap-1 bg-primary/10 text-primary hover:bg-primary/15"
            >
              {store}
              <button
                type="button"
                onClick={() => removeStore(store)}
                aria-label={`Remove ${store}`}
                className="ml-0.5 rounded-full hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-card border-border font-normal text-muted-foreground hover:text-foreground"
          >
            {selected.length > 0 ? 'Add another store...' : 'Select or type where you shop...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-card border-border">
          <Command shouldFilter>
            <CommandInput
              placeholder="Search or type a store name..."
              value={search}
              onValueChange={setSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim() && availableStores.every(
                  (s) => s.toLowerCase() !== search.trim().toLowerCase()
                )) {
                  e.preventDefault()
                  addStore(search)
                }
              }}
            />
            <CommandList>
              <CommandEmpty>
                {search.trim() ? (
                  <button
                    type="button"
                    onClick={() => addStore(search)}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add &quot;{search.trim()}&quot;
                  </button>
                ) : (
                  'No stores found.'
                )}
              </CommandEmpty>
              <CommandGroup>
                {availableStores.map((store) => (
                  <CommandItem
                    key={store}
                    value={store}
                    onSelect={() => {
                      addStore(store)
                      setOpen(true)
                    }}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    {store}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

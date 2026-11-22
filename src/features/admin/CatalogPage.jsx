import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { errorMessage } from '@/api/errors'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useApiData from '@/hooks/useApiData'
import { adminApi } from './api'
import { CategoryDialog, PickupLocationDialog, VehicleModelDialog, VehicleTypeDialog } from './CatalogForms'

const activeLabels = { Active: 'Active', Inactive: 'Inactive' }
const activeValue = (isActive) => (isActive ? 'Active' : 'Inactive')
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

// Inserts or replaces a saved row by id.
const upsert = (idKey) => (saved) => (rows) =>
  rows.some((r) => r[idKey] === saved[idKey]) ? rows.map((r) => (r[idKey] === saved[idKey] ? saved : r)) : [...rows, saved]

function Section({ state, columns, renderRow, empty }) {
  if (state.error) return <p className="py-6 text-sm text-destructive">{errorMessage(state.error)}</p>
  if (!state.data) return <p className="py-6 text-sm text-muted-foreground">Loading…</p>
  if (state.data.length === 0) return <p className="py-6 text-sm text-muted-foreground">{empty}</p>
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={c} className={c === '' ? 'w-0' : undefined}>
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{state.data.map(renderRow)}</TableBody>
    </Table>
  )
}

function EditButton({ onClick }) {
  return (
    <Button size="sm" variant="ghost" onClick={onClick}>
      Edit
    </Button>
  )
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'types'
  const [editing, setEditing] = useState({ kind: null, item: null })

  const types = useApiData(adminApi.listVehicleTypes)
  const models = useApiData(adminApi.listVehicleModels)
  const categories = useApiData(adminApi.listCategories)
  const locations = useApiData(adminApi.listPickupLocations)

  const open = (kind, item = {}) => setEditing({ kind, item })
  const dialogProps = (kind) => ({
    item: editing.kind === kind ? editing.item : null,
    onOpenChange: (isOpen) => !isOpen && setEditing({ kind: null, item: null }),
  })

  const addButton = {
    types: <Button onClick={() => open('type')}><Plus /> Vehicle type</Button>,
    models: <Button onClick={() => open('model')}><Plus /> Vehicle model</Button>,
    categories: <Button onClick={() => open('category')}><Plus /> Category</Button>,
    locations: <Button onClick={() => open('location')}><Plus /> Pickup location</Button>,
  }[tab]

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
      <PageHeader
        title="Catalog"
        description="What customers can book, and where they can pick it up."
        actions={addButton}
      />

      <Tabs value={tab} onValueChange={(value) => setSearchParams({ tab: value }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="types">Vehicle types</TabsTrigger>
          <TabsTrigger value="models">Vehicle models</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Pickup locations</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto">
              <Section
                state={types}
                empty="No vehicle types yet."
                columns={['Name', 'Category', 'Seats', 'Status', '']}
                renderRow={(t) => (
                  <TableRow key={t.vehicleTypeId}>
                    <TableCell>
                      <div className="font-medium">{t.name}</div>
                      {t.description && <div className="max-w-md truncate text-xs text-muted-foreground">{t.description}</div>}
                    </TableCell>
                    <TableCell>{t.categoryName}</TableCell>
                    <TableCell className="tabular-nums">{t.seatingCapacity ?? '—'}</TableCell>
                    <TableCell>
                      <StatusBadge value={t.status} labels={activeLabels} />
                    </TableCell>
                    <TableCell>
                      <EditButton onClick={() => open('type', t)} />
                    </TableCell>
                  </TableRow>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto">
              <Section
                state={models}
                empty="No vehicle models yet."
                columns={['Make', 'Model', 'Type', 'Status', '']}
                renderRow={(m) => (
                  <TableRow key={m.vehicleId}>
                    <TableCell className="font-medium">{m.make}</TableCell>
                    <TableCell>{m.model}</TableCell>
                    <TableCell>
                      {m.vehicleTypeName} <span className="text-xs text-muted-foreground">· {m.categoryName}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={activeValue(m.isActive)} labels={activeLabels} />
                    </TableCell>
                    <TableCell>
                      <EditButton onClick={() => open('model', m)} />
                    </TableCell>
                  </TableRow>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto">
              <Section
                state={categories}
                empty="No categories yet."
                columns={['Name', 'Vehicle types', 'Status', '']}
                renderRow={(c) => (
                  <TableRow key={c.vehicleCategoryId}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="tabular-nums">{c.vehicleTypeCount}</TableCell>
                    <TableCell>
                      <StatusBadge value={activeValue(c.isActive)} labels={activeLabels} />
                    </TableCell>
                    <TableCell>
                      <EditButton onClick={() => open('category', c)} />
                    </TableCell>
                  </TableRow>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto">
              <Section
                state={locations}
                empty="No pickup locations yet."
                columns={['Name', 'Address', 'Delivery fee', 'Status', '']}
                renderRow={(l) => (
                  <TableRow key={l.pickupLocationId}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="max-w-sm truncate text-muted-foreground">{l.address}</TableCell>
                    <TableCell className="tabular-nums">{rupees.format(l.customerDeliveryFee)}</TableCell>
                    <TableCell>
                      <StatusBadge value={activeValue(l.isActive)} labels={activeLabels} />
                    </TableCell>
                    <TableCell>
                      <EditButton onClick={() => open('location', l)} />
                    </TableCell>
                  </TableRow>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <VehicleTypeDialog
        {...dialogProps('type')}
        categories={categories.data ?? []}
        onSaved={(saved) => {
          types.setData(upsert('vehicleTypeId')(saved))
          models.reload() // type names show on the models tab
        }}
      />
      <VehicleModelDialog
        {...dialogProps('model')}
        types={types.data ?? []}
        onSaved={(saved) => models.setData(upsert('vehicleId')(saved))}
      />
      <CategoryDialog
        {...dialogProps('category')}
        onSaved={(saved) => {
          categories.setData(upsert('vehicleCategoryId')(saved))
          types.reload() // category names / availability show on the types tab
        }}
      />
      <PickupLocationDialog {...dialogProps('location')} onSaved={(saved) => locations.setData(upsert('pickupLocationId')(saved))} />
    </section>
  )
}

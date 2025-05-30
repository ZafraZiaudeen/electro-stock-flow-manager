"use client"

import { useState } from "react"
import { CalendarIcon, Search, Upload, Plus, Trash2, Save, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data for existing GRN entries
const existingGRNs = [
  {
    grnNumber: "GRN-2024-001",
    poNumber: "PO-2024-001",
    date: "2024-01-15",
    supplier: "Schneider Electric",
    totalItems: 5,
    totalValue: 15750.0,
    status: "Completed",
  },
  {
    grnNumber: "GRN-2024-002",
    poNumber: "PO-2024-002",
    date: "2024-01-14",
    supplier: "ABB Ltd",
    totalItems: 3,
    totalValue: 8500.0,
    status: "Completed",
  },
]

export default function PurchaseEntry() {
  const [poNumber, setPONumber] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(new Date())
  const [searchPO, setSearchPO] = useState("")
  const [showExistingGRNs, setShowExistingGRNs] = useState(false)
  const [filteredGRNs, setFilteredGRNs] = useState([])

  // New GRN Entry state
  const [grnItems, setGrnItems] = useState([
    {
      id: 1,
      partNumber: "",
      makeCompany: "",
      description: "",
      unit: "Pieces",
      packing: "1",
      unitPrice: "",
      quantity: "",
    },
  ])

  const unitOptions = ["Pieces", "Each", "Box", "Packets", "Rolls", "Meters", "Kg", "Liters"]

  const addNewRow = () => {
    const newId = Math.max(...grnItems.map((item) => item.id)) + 1
    setGrnItems([
      ...grnItems,
      {
        id: newId,
        partNumber: "",
        makeCompany: "",
        description: "",
        unit: "Pieces",
        packing: "1",
        unitPrice: "",
        quantity: "",
      },
    ])
  }

  const removeRow = (id) => {
    if (grnItems.length > 1) {
      setGrnItems(grnItems.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id, field, value) => {
    setGrnItems(grnItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSearch = () => {
    if (searchPO.trim()) {
      const filtered = existingGRNs.filter((grn) => grn.poNumber.toLowerCase().includes(searchPO.toLowerCase()))
      setFilteredGRNs(filtered)
      setShowExistingGRNs(true)
    } else {
      setFilteredGRNs([])
      setShowExistingGRNs(false)
    }
  }

  const calculateTotal = () => {
    return grnItems.reduce((total, item) => {
      const unitPrice = Number.parseFloat(item.unitPrice) || 0
      const quantity = Number.parseFloat(item.quantity) || 0
      return total + unitPrice * quantity
    }, 0)
  }

  const handleCreateGRN = () => {
    // Validate required fields
    const hasValidItems = grnItems.some(
      (item) =>
        item.partNumber.trim() && item.makeCompany.trim() && item.description.trim() && item.unitPrice && item.quantity,
    )

    if (!poNumber.trim()) {
      alert("Please enter PO Number")
      return
    }

    if (!hasValidItems) {
      alert("Please fill at least one complete item row")
      return
    }

    // Generate GRN number
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(existingGRNs.length + 1).padStart(3, "0")}`

    alert(`GRN Created Successfully!\nGRN Number: ${grnNumber}\nTotal Value: ₹${calculateTotal().toFixed(2)}`)

    // Reset form
    setPONumber("")
    setPurchaseDate(new Date())
    setGrnItems([
      {
        id: 1,
        partNumber: "",
        makeCompany: "",
        description: "",
        unit: "Pieces",
        packing: "1",
        unitPrice: "",
        quantity: "",
      },
    ])
  }

  const handleImportFromExcel = () => {
    alert("Excel import functionality would be implemented here")
  }

  return (
    <div className="space-y-4">
      {/* Top Section - PO Number and Date */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Information</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="po-number">PO Number:</Label>
                <Input
                  id="po-number"
                  placeholder="Enter PO Number"
                  value={poNumber}
                  onChange={(e) => setPONumber(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>Purchase Date:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-48 justify-start text-left font-normal",
                        !purchaseDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {purchaseDate ? format(purchaseDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={purchaseDate} onSelect={setPurchaseDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* All Purchase Entries Section */}
      <Card>
        <CardHeader>
          <CardTitle>All Purchase Entries (GRN-wise)</CardTitle>
          <CardDescription>View and manage existing purchase entries</CardDescription>
        </CardHeader>
        <CardContent>
          {!showExistingGRNs ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No purchase entries found. Create your first GRN below.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GRN Number</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGRNs.map((grn) => (
                    <TableRow key={grn.grnNumber}>
                      <TableCell className="font-medium">{grn.grnNumber}</TableCell>
                      <TableCell>{grn.poNumber}</TableCell>
                      <TableCell>{grn.date}</TableCell>
                      <TableCell>{grn.supplier}</TableCell>
                      <TableCell>{grn.totalItems}</TableCell>
                      <TableCell>₹{grn.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{grn.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search by PO Number</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter PO Number to search"
                value={searchPO}
                onChange={(e) => setSearchPO(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={handleImportFromExcel}>
              <Upload className="h-4 w-4 mr-2" />
              Import from Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New GRN Entry Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>New GRN Entry</CardTitle>
              <CardDescription>GRN will be auto-generated</CardDescription>
            </div>
            {calculateTotal() > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{calculateTotal().toFixed(2)}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Part Number</TableHead>
                    <TableHead className="w-[140px]">Make Company</TableHead>
                    <TableHead className="w-[200px]">Description</TableHead>
                    <TableHead className="w-[100px]">Unit</TableHead>
                    <TableHead className="w-[80px]">Packing</TableHead>
                    <TableHead className="w-[100px]">Unit Price</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grnItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          placeholder="Part No."
                          value={item.partNumber}
                          onChange={(e) => updateItem(item.id, "partNumber", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Company"
                          value={item.makeCompany}
                          onChange={(e) => updateItem(item.id, "makeCompany", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={item.unit} onValueChange={(value) => updateItem(item.id, "unit", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {unitOptions.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="1"
                          value={item.packing}
                          onChange={(e) => updateItem(item.id, "packing", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRow(item.id)}
                          disabled={grnItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={addNewRow}>
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
              <Button onClick={handleCreateGRN} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Create GRN
              </Button>
            </div>

            {/* Validation Alert */}
            {!poNumber.trim() && (
              <Alert>
                <AlertDescription>Please enter a PO Number before creating the GRN.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
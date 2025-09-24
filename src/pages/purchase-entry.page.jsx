"use client"

import { useState } from "react"
import {
  CalendarIcon,
  Search,
  Plus,
  Trash2,
  Save,
  FileText,
  X,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  useGetAllPurchaseEntriesQuery,
  useCreatePurchaseEntryMutation,
  useUpdatePurchaseEntryMutation,
  useDeletePurchaseEntryMutation,
} from "../lib/api"
import * as XLSX from "xlsx"

export default function PurchaseEntry() {
  const [activeTab, setActiveTab] = useState("create")
  const [poNumber, setPONumber] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("poNumber")
  const [showSearchResults, setShowSearchResults] = useState(false)
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
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedGRNs, setExpandedGRNs] = useState({})
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedGRN, setSelectedGRN] = useState(null)
  const [editingGRN, setEditingGRN] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [grnToDelete, setGrnToDelete] = useState(null)

  const itemsPerPage = 5
  const unitOptions = ["Box", "Packets", "EA", "Roll", "Pieces", "Nos", "Meters", "Lot"]

  const { data: purchaseEntries = [], isLoading: isEntriesLoading } = useGetAllPurchaseEntriesQuery()
  const [createPurchaseEntry, { isLoading: isCreating, isError, error }] = useCreatePurchaseEntryMutation()
  const [updatePurchaseEntry, { isLoading: isUpdating }] = useUpdatePurchaseEntryMutation()
  const [deletePurchaseEntry, { isLoading: isDeleting }] = useDeletePurchaseEntryMutation()

  const addNewRow = () => {
    const newId = Math.max(...grnItems.map((item) => item.id), 0) + 1
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
    if (searchTerm.trim()) {
      setShowSearchResults(true)
    }
  }

  const closeSearchResults = () => {
    setShowSearchResults(false)
    setSearchTerm("")
  }

  const calculateSearchResultsTotal = () => {
    const filteredEntries = purchaseEntries.filter((entry) => {
      if (searchType === "poNumber") {
        return entry.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return entry.items.some((item) => item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      }
    })
    return filteredEntries.reduce((total, entry) => total + (entry.totalValue || 0), 0)
  }

  const calculateTotal = () => {
    return grnItems.reduce((total, item) => {
      const unitPrice = Number.parseFloat(item.unitPrice) || 0
      const quantity = Number.parseFloat(item.quantity) || 0
      return total + unitPrice * quantity
    }, 0)
  }

  const handleCreateGRN = async () => {
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

    const grnData = {
      poNumber,
      purchaseDate,
      grn: `GRN-${new Date().getFullYear()}-${String(purchaseEntries.length + 1).padStart(3, "0")}`,
      totalValue: calculateTotal(),
      items: grnItems.map((item) => ({
        partNumber: item.partNumber,
        makeCompany: item.makeCompany,
        description: item.description,
        unit: item.unit,
        packing: Number.parseFloat(item.packing) || 1,
        unitPrice: Number.parseFloat(item.unitPrice) || 0,
        quantity: Number.parseFloat(item.quantity) || 0,
      })),
    }

    try {
      await createPurchaseEntry(grnData).unwrap()
      setSuccessMessage(
        `GRN Created Successfully!\nGRN Number: ${grnData.grn}\nTotal Value: ريال ${grnData.totalValue.toFixed(2)}`,
      )
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
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
    } catch (err) {
      const errorMessage = err?.data?.message || err?.error || "Unknown error"
      alert(`Failed to create GRN: ${errorMessage}`)
    }
  }

  const handleEditGRN = (entry) => {
    setEditingGRN(entry)
    setPONumber(entry.poNumber)
    setPurchaseDate(new Date(entry.purchaseDate))
    setGrnItems(
      entry.items.map((item, index) => ({
        id: index + 1,
        partNumber: item.partNumber,
        makeCompany: item.makeCompany,
        description: item.description,
        unit: item.unit,
        packing: String(item.packing),
        unitPrice: String(item.unitPrice),
        quantity: String(item.quantity),
      })),
    )
    setActiveTab("create")
  }

  const handleUpdateGRN = async () => {
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

    const grnData = {
      poNumber,
      purchaseDate,
      grn: editingGRN.grn,
      totalValue: calculateTotal(),
      items: grnItems.map((item) => ({
        partNumber: item.partNumber,
        makeCompany: item.makeCompany,
        description: item.description,
        unit: item.unit,
        packing: Number.parseFloat(item.packing) || 1,
        unitPrice: Number.parseFloat(item.unitPrice) || 0,
        quantity: Number.parseFloat(item.quantity) || 0,
      })),
    }

    try {
      await updatePurchaseEntry({ id: editingGRN._id, ...grnData }).unwrap()
      setSuccessMessage(
        `GRN Updated Successfully!\nGRN Number: ${grnData.grn}\nTotal Value: ريال ${grnData.totalValue.toFixed(2)}`,
      )
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      setEditingGRN(null)
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
    } catch (err) {
      const errorMessage = err?.data?.message || err?.error || "Unknown error"
      alert(`Failed to update GRN: ${errorMessage}`)
    }
  }

  const handleDeleteGRN = (entry) => {
    setGrnToDelete(entry)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      await deletePurchaseEntry(grnToDelete._id).unwrap()
      setSuccessMessage(`GRN ${grnToDelete.grn} deleted successfully`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      setShowDeleteConfirm(false)
      setGrnToDelete(null)
    } catch (err) {
      const errorMessage = err?.data?.message || err?.error || "Unknown error"
      alert(`Failed to delete GRN: ${errorMessage}`)
    }
  }

  const cancelEdit = () => {
    setEditingGRN(null)
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

  const handleImportFromExcel = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      alert("Please select a file to import.")
      return
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ]
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid Excel file (.xlsx or .xls)")
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    try {
      const arrayBuffer = await file.arrayBuffer()
      setImportProgress(25)

      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      setImportProgress(50)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (!jsonData || jsonData.length < 2) {
        alert("The Excel file is empty or invalid.")
        setIsImporting(false)
        return
      }

      setImportProgress(75)
      const headers = jsonData[0] || []

      const headerMapping = {
        "Part Number": "partNumber",
        PartNumber: "partNumber",
        Part_Number: "partNumber",
        "Make Company": "makeCompany",
        MakeCompany: "makeCompany",
        Make_Company: "makeCompany",
        Manufacturer: "makeCompany",
        Description: "description",
        Unit: "unit",
        Packing: "packing",
        "Unit Price": "unitPrice",
        UnitPrice: "unitPrice",
        Unit_Price: "unitPrice",
        Price: "unitPrice",
        Quantity: "quantity",
        Qty: "quantity",
      }

      const items = jsonData.slice(1).map((row) => {
        const item = {}
        headers.forEach((header, index) => {
          const mappedField = headerMapping[header] || header.toLowerCase().replace(/\s+/g, "")
          if (mappedField && row[index] !== undefined) {
            item[mappedField] = row[index]
          }
        })
        return item
      })

      const validItems = items
        .filter((item) => item.partNumber && item.makeCompany && item.description && item.unitPrice && item.quantity)
        .map((item, index) => ({
          id: grnItems.length + index + 1,
          partNumber: String(item.partNumber || ""),
          makeCompany: String(item.makeCompany || ""),
          description: String(item.description || ""),
          unit: unitOptions.includes(item.unit) ? item.unit : "Pieces",
          packing: String(item.packing || "1"),
          unitPrice: String(item.unitPrice || ""),
          quantity: String(item.quantity || ""),
        }))

      setImportProgress(100)

      if (validItems.length > 0) {
        setGrnItems((prev) => [...prev, ...validItems])
        setSuccessMessage(`${validItems.length} items imported successfully from Excel file`)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        alert(
          "No valid items found in the Excel file. Please ensure your file has the following columns: Part Number, Make Company, Description, Unit, Packing, Unit Price, Quantity",
        )
      }
    } catch (error) {
      console.error("Error processing Excel file:", error)
      alert("An error occurred while importing the Excel file. Please check the file format and try again.")
    } finally {
      setIsImporting(false)
      setImportProgress(0)
      event.target.value = ""
    }
  }

  const exportGRN = (entry) => {
    const headers = [
      "Part Number",
      "Make Company",
      "Description",
      "Unit",
      "Packing",
      "Unit Price",
      "Quantity",
      "Total Value",
      "GRN Number",
      "PO Number",
      "Date",
    ]
    const csvContent = [
      headers.join(","),
      ...entry.items.map((item) =>
        [
          item.partNumber,
          item.makeCompany,
          `"${item.description}"`,
          item.unit,
          item.packing,
          item.unitPrice,
          item.quantity,
          item.unitPrice * item.quantity,
          entry.grn,
          entry.poNumber,
          format(new Date(entry.purchaseDate), "yyyy-MM-dd"),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `GRN_${entry.grn}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportSearchResults = () => {
    const filteredEntries = purchaseEntries.filter((entry) => {
      if (searchType === "poNumber") {
        return entry.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return entry.items.some((item) => item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      }
    })
    if (filteredEntries.length > 0) {
      const headers = [
        "Part Number",
        "Make Company",
        "Description",
        "Unit",
        "Packing",
        "Unit Price",
        "Quantity",
        "Total Value",
        "GRN Number",
        "PO Number",
        "Date",
      ]
      const csvContent = [
        headers.join(","),
        ...filteredEntries.flatMap((entry) =>
          entry.items.map((item) =>
            [
              item.partNumber,
              item.makeCompany,
              `"${item.description}"`,
              item.unit,
              item.packing,
              item.unitPrice,
              item.quantity,
              item.unitPrice * item.quantity,
              entry.grn,
              entry.poNumber,
              format(new Date(entry.purchaseDate), "yyyy-MM-dd"),
            ].join(","),
          ),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Search_Results_${searchType}_${searchTerm}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      alert("No items to export")
    }
  }

  const toggleExpand = (grn) => {
    setExpandedGRNs((prev) => ({
      ...prev,
      [grn]: !prev[grn],
    }))
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentEntries = purchaseEntries.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(purchaseEntries.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="space-y-4">
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create GRN
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Purchase History
          </TabsTrigger>
        </TabsList>

        {/* Create GRN Tab */}
        <TabsContent value="create" className="space-y-4">
          {/* Purchase Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Purchase Information</CardTitle>
              <CardDescription>Enter basic purchase details to create a new GRN</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po-number">
                    PO Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="po-number"
                    placeholder="Enter PO Number"
                    value={poNumber}
                    onChange={(e) => setPONumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !purchaseDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {purchaseDate ? format(purchaseDate, "MMMM d, yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={purchaseDate} onSelect={setPurchaseDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Entry */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {editingGRN ? `Edit GRN: ${editingGRN.grn}` : "New GRN Entry"}
                  </CardTitle>
                  <CardDescription>
                    {editingGRN ? "Update existing GRN details" : "GRN will be auto-generated"}
                  </CardDescription>
                </div>
                {calculateTotal() > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">ريال {calculateTotal().toFixed(2)}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Importing Excel file...</span>
                      <span className="text-sm text-muted-foreground">{importProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${importProgress}%` }}></div>
                    </div>
                  </div>
                )}
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
                        <TableHead className="w-[100px]">Total</TableHead>
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
                            <div className="font-medium">
                              ريال{" "}
                              {(
                                (Number.parseFloat(item.unitPrice) || 0) * (Number.parseFloat(item.quantity) || 0)
                              ).toFixed(2)}
                            </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={addNewRow}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Row
                    </Button>
                    <label htmlFor="excel-import" className="cursor-pointer">
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        id="excel-import"
                        onChange={handleImportFromExcel}
                        disabled={isImporting}
                      />
                      <Button variant="outline" disabled={isImporting}>
                        <Upload className="h-4 w-4 mr-2" />
                        {isImporting ? "Importing..." : "Import Excel"}
                      </Button>
                    </label>
                    {editingGRN && (
                      <Button variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={editingGRN ? handleUpdateGRN : handleCreateGRN}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isCreating || isUpdating}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingGRN
                      ? isUpdating
                        ? "Updating..."
                        : "Update GRN"
                      : isCreating
                        ? "Creating..."
                        : "Create GRN"}
                  </Button>
                </div>
                {!poNumber.trim() && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please enter a PO Number before creating the GRN.</AlertDescription>
                  </Alert>
                )}
                {isError && (
                  <Alert variant="destructive">
                    <AlertDescription>{error?.message || "Failed to create GRN"}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search & Import Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Search by PO Number or Part Number</CardTitle>
              <CardDescription>Select search type and enter the corresponding value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poNumber">PO Number</SelectItem>
                      <SelectItem value="partNumber">Part Number</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={searchType === "poNumber" ? "Enter PO Number" : "Enter Part Number"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={closeSearchResults}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
          {showSearchResults && (
            <Card className="bg-gray-50 border-2 border-blue-200">
              <CardHeader className="bg-white border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Search Results for {searchType === "poNumber" ? "PO" : "Part"}: {searchTerm}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={closeSearchResults}>
                      <X className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                    <Button onClick={exportSearchResults} className="bg-blue-500 hover:bg-blue-600">
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {purchaseEntries.filter((entry) => {
                  if (searchType === "poNumber") {
                    return entry.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
                  } else {
                    return entry.items.some((item) => item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                  }
                }).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No items found for this {searchType === "poNumber" ? "PO number" : "part number"}.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Found{" "}
                        {purchaseEntries
                          .filter((entry) => {
                            if (searchType === "poNumber") {
                              return entry.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
                            } else {
                              return entry.items.some((item) =>
                                item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()),
                              )
                            }
                          })
                          .reduce((sum, entry) => sum + entry.items.length, 0)}{" "}
                        item(s)
                      </p>
                      <p className="text-lg font-semibold">
                        Total Value: ريال {calculateSearchResultsTotal().toLocaleString()}
                      </p>
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>GRN Number</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total Value</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchaseEntries
                            .filter((entry) => {
                              if (searchType === "poNumber") {
                                return entry.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
                              } else {
                                return entry.items.some((item) =>
                                  item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()),
                                )
                              }
                            })
                            .map((entry) => (
                              <TableRow key={entry.grn}>
                                <TableCell className="font-medium">{entry.grn}</TableCell>
                                <TableCell>{format(new Date(entry.purchaseDate), "MMMM d, yyyy")}</TableCell>
                                <TableCell>{entry.items.length}</TableCell>
                                <TableCell>ريال {entry.totalValue.toLocaleString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedGRN(entry)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleEditGRN(entry)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteGRN(entry)}>
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Purchase History Tab */}
        <TabsContent value="history" className="space-y-4 relative">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">All Purchase Entries (GRN-wise)</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                View and manage existing purchase entries
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] relative pb-16">
              {isEntriesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Loading purchase entries...</p>
                </div>
              ) : purchaseEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No purchase entries found. Create your first GRN below.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentEntries.map((entry) => (
                    <Card key={entry.grn} className="border hover:shadow-md transition-shadow duration-200">
                      <CardHeader
                        className="flex flex-row items-center justify-between cursor-pointer p-4 bg-gray-50 hover:bg-gray-100"
                        onClick={() => toggleExpand(entry.grn)}
                      >
                        <div>
                          <CardTitle className="text-base font-medium text-gray-900">
                            GRN: {entry.grn} ({format(new Date(entry.purchaseDate), "M/d/yyyy")})
                          </CardTitle>
                          <CardDescription className="text-xs text-gray-500">
                            PO Number: {entry.poNumber} | {entry.items.length} item(s)
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditGRN(entry)
                            }}
                            className="text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              exportGRN(entry)
                            }}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteGRN(entry)
                            }}
                            className="text-xs"
                          >
                            <Trash className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                          {expandedGRNs[entry.grn] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </CardHeader>
                      {expandedGRNs[entry.grn] && (
                        <CardContent className="p-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Part Number</TableHead>
                                <TableHead>Make Company</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Packing</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total Value</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {entry.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.partNumber}</TableCell>
                                  <TableCell>{item.makeCompany}</TableCell>
                                  <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                                  <TableCell>{item.unit}</TableCell>
                                  <TableCell>{item.packing}</TableCell>
                                  <TableCell>ريال {item.unitPrice.toFixed(2)}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>ريال {(item.unitPrice * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg flex items-center gap-2 justify-end z-10">
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="text-sm px-3 py-1"
                >
                  &lt; Previous
                </Button>
                {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                  const page = i + 1
                  if (page <= totalPages) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => paginate(page)}
                        className="w-8 h-8 text-sm"
                        style={{
                          backgroundColor: currentPage === page ? "#0078d4" : "",
                          color: currentPage === page ? "#fff" : "#333",
                        }}
                      >
                        {page}
                      </Button>
                    )
                  }
                  return null
                })}
                {totalPages > 4 && currentPage < totalPages - 2 && (
                  <span className="text-sm text-gray-500 px-2">...</span>
                )}
                {totalPages > 4 && currentPage !== totalPages && (
                  <Button
                    variant="outline"
                    onClick={() => paginate(totalPages)}
                    className="w-8 h-8 text-sm flex items-center justify-center"
                  >
                    {totalPages}
                    <span className="ml-1 text-gray-400">👆</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="text-sm px-3 py-1"
                >
                  Next &gt;
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* GRN Details Dialog */}
      <Dialog open={!!selectedGRN} onOpenChange={() => setSelectedGRN(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>GRN Details: {selectedGRN?.grn}</DialogTitle>
          </DialogHeader>
          {selectedGRN && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">PO Number</p>
                  <p>{selectedGRN.poNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p>{format(new Date(selectedGRN.purchaseDate), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Items</p>
                  <p>{selectedGRN.items.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Value</p>
                  <p>ريال {selectedGRN.totalValue.toLocaleString()}</p>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Make Company</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Packing</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGRN.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.partNumber}</TableCell>
                        <TableCell>{item.makeCompany}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.packing}</TableCell>
                        <TableCell>ريال {item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>ريال {(item.unitPrice * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleEditGRN(selectedGRN)
                    setSelectedGRN(null)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit GRN
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteGRN(selectedGRN)
                    setSelectedGRN(null)
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete GRN
                </Button>
                <Button onClick={() => exportGRN(selectedGRN)} className="bg-blue-500 hover:bg-blue-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export GRN
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete GRN: <strong>{grnToDelete?.grn}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. All items in this GRN will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete GRN"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
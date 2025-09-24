"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Save,
  CalendarIcon,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock GRN data
const initialMockGRNs = [
  {
    id: 1,
    grnNumber: "GRN-2024-001",
    poNumber: "PO-2024-001",
    supplierName: "Schneider Electric India",
    receivedDate: "2024-01-15",
    createdBy: "John Doe",
    status: "Verified",
    totalItems: 5,
    totalValue: 15750.0,
    deliveryNote: "DN-SCH-001",
    items: [
      {
        partNumber: "EL-SW-001",
        description: "Circuit Breaker 30A",
        orderedQty: 20,
        receivedQty: 20,
        unitPrice: 78.5,
        totalValue: 1570.0,
        condition: "Good",
      },
      {
        partNumber: "EL-CB-002",
        description: "Contactor 40A",
        orderedQty: 15,
        receivedQty: 15,
        unitPrice: 65.75,
        totalValue: 986.25,
        condition: "Good",
      },
    ],
  },
  {
    id: 2,
    grnNumber: "GRN-2024-002",
    poNumber: "PO-2024-002",
    supplierName: "ABB Ltd",
    receivedDate: "2024-01-14",
    createdBy: "Sarah Smith",
    status: "Pending Verification",
    totalItems: 3,
    totalValue: 8500.0,
    deliveryNote: "DN-ABB-002",
    items: [
      {
        partNumber: "EL-WR-003",
        description: "2.5 sqmm Wire (100m)",
        orderedQty: 10,
        receivedQty: 8,
        unitPrice: 1250.0,
        totalValue: 10000.0,
        condition: "Damaged - 2 rolls",
      },
    ],
  },
  {
    id: 3,
    grnNumber: "GRN-2024-003",
    poNumber: "PO-2024-003",
    supplierName: "Havells India",
    receivedDate: "2024-01-13",
    createdBy: "Mike Johnson",
    status: "Received",
    totalItems: 8,
    totalValue: 12300.0,
    deliveryNote: "DN-HAV-003",
    items: [
      {
        partNumber: "EL-PL-005",
        description: "Power Socket",
        orderedQty: 100,
        receivedQty: 100,
        unitPrice: 12.5,
        totalValue: 1250.0,
        condition: "Good",
      },
    ],
  },
]

export default function GRNManagement() {
  const [mockGRNs, setMockGRNs] = useState(initialMockGRNs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedGRN, setSelectedGRN] = useState(null)
  const [showGRNDetails, setShowGRNDetails] = useState(false)
  const [showNewGRNDialog, setShowNewGRNDialog] = useState(false)
  const [showEditGRNDialog, setShowEditGRNDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)

  // New GRN state
  const [newGRN, setNewGRN] = useState({
    poNumber: "",
    supplierName: "",
    receivedDate: new Date(),
    deliveryNote: "",
    createdBy: "Admin User",
    status: "Received", // Default status for new GRN
  })

  // Edit GRN state
  const [editGRN, setEditGRN] = useState(null)

  // Filter state
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [supplierFilter, setSupplierFilter] = useState("")

  // Available statuses
  const statuses = ["Received", "Pending Verification", "Verified"]

  // Filter GRNs based on search, status, and additional filters
  const filteredGRNs = mockGRNs.filter((grn) => {
    const matchesSearch =
      grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.items.some((item) => item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || grn.status.toLowerCase().replace(" ", "-") === statusFilter

    const matchesDate =
      (!dateRange.from || new Date(grn.receivedDate) >= new Date(dateRange.from)) &&
      (!dateRange.to || new Date(grn.receivedDate) <= new Date(dateRange.to))

    const matchesSupplier = !supplierFilter || grn.supplierName.toLowerCase().includes(supplierFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesDate && matchesSupplier
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case "Verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Pending Verification":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Received":
        return <Package className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800"
      case "Pending Verification":
        return "bg-yellow-100 text-yellow-800"
      case "Received":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewGRN = (grn) => {
    setSelectedGRN(grn)
    setShowGRNDetails(true)
  }

  const handlePrintGRN = (grn) => {
    alert(`Printing GRN: ${grn.grnNumber}`)
  }

  const handleExportGRNs = () => {
    const headers = [
      "GRN Number",
      "PO Number",
      "Supplier",
      "Received Date",
      "Status",
      "Total Items",
      "Total Value",
      "Created By",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredGRNs.map((grn) =>
        [
          grn.grnNumber,
          grn.poNumber,
          `"${grn.supplierName}"`,
          grn.receivedDate,
          grn.status,
          grn.totalItems,
          grn.totalValue,
          grn.createdBy,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `GRN_Report_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const updateGRNStatus = (grnId, newStatus) => {
    setMockGRNs(
      mockGRNs.map((grn) =>
        grn.id === grnId ? { ...grn, status: newStatus } : grn
      )
    )
    alert(`GRN status updated to: ${newStatus}`)
  }

  const handleNewGRN = () => {
    if (!newGRN.poNumber || !newGRN.supplierName || !newGRN.deliveryNote || !newGRN.status) {
      alert("Please fill in all required fields")
      return
    }

    const newId = Math.max(...mockGRNs.map((grn) => grn.id)) + 1
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(newId).padStart(3, "0")}`
    const newGRNData = {
      id: newId,
      grnNumber,
      poNumber: newGRN.poNumber,
      supplierName: newGRN.supplierName,
      receivedDate: format(newGRN.receivedDate, "yyyy-MM-dd"),
      createdBy: newGRN.createdBy,
      status: newGRN.status,
      totalItems: 0,
      totalValue: 0,
      deliveryNote: newGRN.deliveryNote,
      items: [],
    }

    setMockGRNs([...mockGRNs, newGRNData])
    setShowNewGRNDialog(false)
    setNewGRN({
      poNumber: "",
      supplierName: "",
      receivedDate: new Date(),
      deliveryNote: "",
      createdBy: "Admin User",
      status: "Received",
    })
    alert(`New GRN created: ${grnNumber}`)
  }

  const handleEditGRN = (grn) => {
    setEditGRN({ ...grn })
    setShowEditGRNDialog(true)
  }

  const saveEditedGRN = () => {
    if (!editGRN.poNumber || !editGRN.supplierName || !editGRN.deliveryNote || !editGRN.status) {
      alert("Please fill in all required fields")
      return
    }

    setMockGRNs(
      mockGRNs.map((grn) =>
        grn.id === editGRN.id ? { ...editGRN, receivedDate: format(editGRN.receivedDate, "yyyy-MM-dd") } : grn
      )
    )
    setShowEditGRNDialog(false)
    setEditGRN(null)
    alert(`GRN ${editGRN.grnNumber} updated successfully`)
  }

  const handleRefresh = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateRange({ from: null, to: null })
    setSupplierFilter("")
    setMockGRNs(initialMockGRNs)
  }

  return (
    <>
      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search GRN, Part No, PO No..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="pending-verification">Pending Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowNewGRNDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New GRN
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportGRNs}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total GRNs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockGRNs.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {mockGRNs.filter((grn) => grn.status === "Pending Verification").length}
              </div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified GRNs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockGRNs.filter((grn) => grn.status === "Verified").length}
              </div>
              <p className="text-xs text-muted-foreground">Ready for inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{mockGRNs.reduce((sum, grn) => sum + grn.totalValue, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* GRN Table */}
        <Card>
          <CardHeader>
            <CardTitle>GRN Records</CardTitle>
            <CardDescription>Manage and track all goods received notes</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredGRNs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No GRNs found matching your search criteria.</p>
                <p className="text-sm">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GRN Number</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Received Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGRNs.map((grn) => (
                      <TableRow key={grn.id}>
                        <TableCell className="font-medium">{grn.grnNumber}</TableCell>
                        <TableCell>{grn.poNumber}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{grn.supplierName}</TableCell>
                        <TableCell>{grn.receivedDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(grn.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(grn.status)}
                              {grn.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{grn.totalItems}</TableCell>
                        <TableCell className="text-right">₹{grn.totalValue.toLocaleString()}</TableCell>
                        <TableCell>{grn.createdBy}</TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewGRN(grn)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintGRN(grn)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print GRN
                              </DropdownMenuItem>
                              {grn.status !== "Verified" && (
                                <DropdownMenuItem onClick={() => handleEditGRN(grn)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit GRN
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <Select onValueChange={(value) => updateGRNStatus(grn.id, value)}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Change Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* GRN Details Dialog */}
      <Dialog open={showGRNDetails} onOpenChange={setShowGRNDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>GRN Details - {selectedGRN?.grnNumber}</DialogTitle>
            <DialogDescription>Complete information about the goods received note</DialogDescription>
          </DialogHeader>

          {selectedGRN && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">GRN Details</TabsTrigger>
                <TabsTrigger value="items">Items Received</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">GRN Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">GRN Number:</span>
                        <span className="text-sm font-medium">{selectedGRN.grnNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">PO Number:</span>
                        <span className="text-sm font-medium">{selectedGRN.poNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Delivery Note:</span>
                        <span className="text-sm font-medium">{selectedGRN.deliveryNote}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Received Date:</span>
                        <span className="text-sm font-medium">{selectedGRN.receivedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(selectedGRN.status)}>{selectedGRN.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Supplier Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Supplier:</span>
                        <span className="text-sm font-medium">{selectedGRN.supplierName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Items:</span>
                        <span className="text-sm font-medium">{selectedGRN.totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Value:</span>
                        <span className="text-sm font-medium">₹{selectedGRN.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created By:</span>
                        <span className="text-sm font-medium">{selectedGRN.createdBy}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Ordered Qty</TableHead>
                      <TableHead>Received Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Condition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGRN.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.partNumber}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.orderedQty}</TableCell>
                        <TableCell>{item.receivedQty}</TableCell>
                        <TableCell>₹{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>₹{item.totalValue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={item.condition === "Good" ? "secondary" : "destructive"}>
                            {item.condition}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">GRN Created</p>
                      <p className="text-xs text-muted-foreground">
                        Created by {selectedGRN.createdBy} on {selectedGRN.receivedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Goods Received</p>
                      <p className="text-xs text-muted-foreground">Items received and logged into system</p>
                    </div>
                  </div>
                  {selectedGRN.status === "Verified" && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Verification Complete</p>
                        <p className="text-xs text-muted-foreground">GRN verified and ready for inventory update</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowGRNDetails(false)}>
              Close
            </Button>
            <Button onClick={() => handlePrintGRN(selectedGRN)}>
              <Printer className="h-4 w-4 mr-2" />
              Print GRN
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New GRN Dialog */}
      <Dialog open={showNewGRNDialog} onOpenChange={setShowNewGRNDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New GRN</DialogTitle>
            <DialogDescription>Enter the details to create a new Goods Received Note</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">PO Number</label>
                <Input
                  value={newGRN.poNumber}
                  onChange={(e) => setNewGRN({ ...newGRN, poNumber: e.target.value })}
                  placeholder="Enter PO Number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier Name</label>
                <Input
                  value={newGRN.supplierName}
                  onChange={(e) => setNewGRN({ ...newGRN, supplierName: e.target.value })}
                  placeholder="Enter Supplier Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Received Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newGRN.receivedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newGRN.receivedDate ? format(newGRN.receivedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newGRN.receivedDate}
                    onSelect={(date) => setNewGRN({ ...newGRN, receivedDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Note</label>
              <Input
                value={newGRN.deliveryNote}
                onChange={(e) => setNewGRN({ ...newGRN, deliveryNote: e.target.value })}
                placeholder="Enter Delivery Note"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newGRN.status}
                onValueChange={(value) => setNewGRN({ ...newGRN, status: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowNewGRNDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewGRN}>
              <Save className="h-4 w-4 mr-2" />
              Create GRN
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit GRN Dialog */}
      <Dialog open={showEditGRNDialog} onOpenChange={setShowEditGRNDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit GRN - {editGRN?.grnNumber}</DialogTitle>
            <DialogDescription>Update the details of the Goods Received Note</DialogDescription>
          </DialogHeader>
          {editGRN && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">PO Number</label>
                  <Input
                    value={editGRN.poNumber}
                    onChange={(e) => setEditGRN({ ...editGRN, poNumber: e.target.value })}
                    placeholder="Enter PO Number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Supplier Name</label>
                  <Input
                    value={editGRN.supplierName}
                    onChange={(e) => setEditGRN({ ...editGRN, supplierName: e.target.value })}
                    placeholder="Enter Supplier Name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Received Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editGRN.receivedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editGRN.receivedDate ? format(new Date(editGRN.receivedDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(editGRN.receivedDate)}
                      onSelect={(date) => setEditGRN({ ...editGRN, receivedDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Note</label>
                <Input
                  value={editGRN.deliveryNote}
                  onChange={(e) => setEditGRN({ ...editGRN, deliveryNote: e.target.value })}
                  placeholder="Enter Delivery Note"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editGRN.status}
                  onValueChange={(value) => setEditGRN({ ...editGRN, status: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditGRNDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedGRN}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* More Filters Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>More Filters</DialogTitle>
            <DialogDescription>Apply additional filters to refine your GRN search</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">From</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">To</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <Input
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                placeholder="Filter by supplier name"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
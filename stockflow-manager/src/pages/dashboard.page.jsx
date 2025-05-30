"use client"

import { useState } from "react"
import {
  Package,
  ShoppingCart,
  ArrowUpRight,
  BarChart3,
  Search,
  Filter,
  Download,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for inventory items
const inventoryData = [
  {
    serialNumber: "001",
    partNumber: "EL-SW-001",
    makeCompany: "Schneider Electric",
    description: "Circuit Breaker 30A",
    unitOfMeasurement: "Pieces",
    packing: "1",
    numberOfUnits: 45,
    unitPrice: 78.5,
    totalValue: 3532.5,
    status: "In Stock",
    lastUpdated: "2024-01-15",
  },
  {
    serialNumber: "002",
    partNumber: "EL-CB-002",
    makeCompany: "ABB",
    description: "Contactor 40A",
    unitOfMeasurement: "Pieces",
    packing: "1",
    numberOfUnits: 32,
    unitPrice: 65.75,
    totalValue: 2104.0,
    status: "In Stock",
    lastUpdated: "2024-01-14",
  },
  {
    serialNumber: "003",
    partNumber: "EL-WR-003",
    makeCompany: "Havells",
    description: "2.5 sqmm Wire (100m)",
    unitOfMeasurement: "Rolls",
    packing: "1",
    numberOfUnits: 15,
    unitPrice: 1250.0,
    totalValue: 18750.0,
    status: "Low Stock",
    lastUpdated: "2024-01-13",
  },
  {
    serialNumber: "004",
    partNumber: "NE-CT-001",
    makeCompany: "D-Link",
    description: "Cat6 Cable (305m)",
    unitOfMeasurement: "Boxes",
    packing: "1",
    numberOfUnits: 8,
    unitPrice: 3500.0,
    totalValue: 28000.0,
    status: "In Stock",
    lastUpdated: "2024-01-12",
  },
  {
    serialNumber: "005",
    partNumber: "EL-PL-005",
    makeCompany: "Legrand",
    description: "Power Socket",
    unitOfMeasurement: "Pieces",
    packing: "10",
    numberOfUnits: 120,
    unitPrice: 12.5,
    totalValue: 1500.0,
    status: "In Stock",
    lastUpdated: "2024-01-11",
  },
  {
    serialNumber: "006",
    partNumber: "EL-SW-007",
    makeCompany: "Siemens",
    description: "MCB 16A",
    unitOfMeasurement: "Pieces",
    packing: "1",
    numberOfUnits: 5,
    unitPrice: 45.0,
    totalValue: 225.0,
    status: "Low Stock",
    lastUpdated: "2024-01-10",
  },
  {
    serialNumber: "007",
    partNumber: "NE-SW-002",
    makeCompany: "Cisco",
    description: "8-Port Network Switch",
    unitOfMeasurement: "Pieces",
    packing: "1",
    numberOfUnits: 12,
    unitPrice: 1800.0,
    totalValue: 21600.0,
    status: "In Stock",
    lastUpdated: "2024-01-09",
  },
]

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: "purchase",
    description: "Received 20 units of Circuit Breaker 30A",
    timestamp: "Today, 10:30 AM",
    user: "John Doe",
    grn: "GRN-2024-0125",
    amount: "₹1,570",
  },
  {
    id: 2,
    type: "issue",
    description: "Issued 5 units of Cat6 Cable to Project Alpha",
    timestamp: "Today, 9:15 AM",
    user: "Sarah Smith",
    project: "PRJ-ALPHA-2024",
    amount: "₹17,500",
  },
  {
    id: 3,
    type: "purchase",
    description: "Received 50 units of Power Socket",
    timestamp: "Yesterday, 4:45 PM",
    user: "John Doe",
    grn: "GRN-2024-0124",
    amount: "₹625",
  },
  {
    id: 4,
    type: "issue",
    description: "Issued 10 units of MCB 16A to Project Beta",
    timestamp: "Yesterday, 2:30 PM",
    user: "Mike Johnson",
    project: "PRJ-BETA-2024",
    amount: "₹450",
  },
]

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  // Calculate summary metrics
  const totalItems = inventoryData.reduce((sum, item) => sum + item.numberOfUnits, 0)
  const totalValue = inventoryData.reduce((sum, item) => sum + item.totalValue, 0)
  const lowStockItems = inventoryData.filter((item) => item.status === "Low Stock").length
  const totalSKUs = inventoryData.length

  // Filter inventory data based on search term
  const filteredInventory = inventoryData.filter(
    (item) =>
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.makeCompany.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Summary Cards */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active SKUs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSKUs}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2 new
              </span>
              this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                Needs attention
              </span>
              Reorder required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Stock Overview Table */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Stock Overview</CardTitle>
                <CardDescription>Current inventory status and details</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.slice(0, 6).map((item) => (
                    <TableRow key={item.serialNumber}>
                      <TableCell className="font-medium">{item.partNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell>{item.makeCompany}</TableCell>
                      <TableCell className="text-right">
                        {item.numberOfUnits} {item.unitOfMeasurement}
                      </TableCell>
                      <TableCell className="text-right">₹{item.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "Low Stock" ? "destructive" : "secondary"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing {Math.min(6, filteredInventory.length)} of {filteredInventory.length} items
            </div>
          </CardFooter>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest inventory transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      activity.type === "purchase" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {activity.type === "purchase" ? (
                      <ShoppingCart className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.timestamp}</span>
                      <span>•</span>
                      <span>{activity.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.type === "purchase" ? activity.grn : activity.project}
                      </Badge>
                      <span className="text-xs font-medium">{activity.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
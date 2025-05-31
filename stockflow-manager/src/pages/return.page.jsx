import { useState } from "react";
import { Clock, Search, Download, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for projects and their issued items
const mockProjects = [
  { id: "PRJ-001", name: "Project Alpha", status: "Active" },
  { id: "PRJ-002", name: "Automation System B", status: "Active" },
  { id: "PRJ-003", name: "Control Panel C", status: "Completed" },
  { id: "PRJ-004", name: "Motor Drive D", status: "On Hold" },
];

// Mock data for issued items per project
const mockIssuedItems = {
  "Project Alpha": [
    {
      id: 1,
      partNumber: "SCHRACK-001",
      description: "SCHRACK Terminal Block",
      unit: "Pieces",
      issuedQuantity: 10,
      unitPrice: 25.0,
      issueDate: "2024-01-15",
    },
    {
      id: 2,
      partNumber: "EL-SW-001",
      description: "Circuit Breaker 30A",
      unit: "Pieces",
      issuedQuantity: 5,
      unitPrice: 78.5,
      issueDate: "2024-01-14",
    },
    {
      id: 3,
      partNumber: "EL-CB-002",
      description: "Contactor 40A",
      unit: "Pieces",
      issuedQuantity: 3,
      unitPrice: 65.75,
      issueDate: "2024-01-13",
    },
  ],
  "Automation System B": [
    {
      id: 4,
      partNumber: "NE-CT-001",
      description: "Cat6 Cable (305m)",
      unit: "Boxes",
      issuedQuantity: 2,
      unitPrice: 3500.0,
      issueDate: "2024-01-12",
    },
    {
      id: 5,
      partNumber: "EL-PL-005",
      description: "Power Socket",
      unit: "Pieces",
      issuedQuantity: 20,
      unitPrice: 12.5,
      issueDate: "2024-01-11",
    },
  ],
  "Control Panel C": [
    {
      id: 6,
      partNumber: "EL-WR-003",
      description: "2.5 sqmm Wire (100m)",
      unit: "Rolls",
      issuedQuantity: 4,
      unitPrice: 1250.0,
      issueDate: "2024-01-10",
    },
  ],
  "Motor Drive D": [
    {
      id: 7,
      partNumber: "EL-SW-007",
      description: "MCB 16A",
      unit: "Pieces",
      issuedQuantity: 8,
      unitPrice: 45.0,
      issueDate: "2024-01-09",
    },
  ],
};

const returnReasons = [
  "Project Cancelled",
  "Excess Quantity",
  "Defective Item",
  "Wrong Specification",
  "Project Completed",
  "Change in Requirements",
  "Quality Issues",
  "Other",
];

// Generate mock return history
const generateMockReturns = (count) => {
  const allReturns = [];

  for (let i = 1; i <= count; i++) {
    const projects = Object.keys(mockIssuedItems);
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    const projectItems = mockIssuedItems[randomProject];
    const randomItem = projectItems[Math.floor(Math.random() * projectItems.length)];

    const quantity = Math.floor(Math.random() * 3) + 1;
    const returnValue = randomItem.unitPrice * quantity;
    const reason = returnReasons[Math.floor(Math.random() * returnReasons.length)];
    const status = Math.random() > 0.7 ? "Pending Inspection" : "Processed";

    // Generate a date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    allReturns.push({
      id: `RET${174867590657031 + i}`,
      partNumber: randomItem.partNumber,
      description: randomItem.description,
      projectName: randomProject,
      quantity,
      unit: randomItem.unit,
      returnValue,
      returnReason: reason,
      returnedBy: Math.random() > 0.5 ? "John Doe" : Math.random() > 0.5 ? "Sarah Smith" : "Mike Johnson",
      returnDate: date.toISOString(),
      status,
    });
  }

  return allReturns.sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));
};

const mockRecentReturns = generateMockReturns(25);

export default function ReturnsManagement() {
  const [selectedProject, setSelectedProject] = useState("");
  const [returnItems, setReturnItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get issued items for selected project
  const issuedItems = selectedProject ? mockIssuedItems[selectedProject] || [] : [];

  // Filter recent returns
  const filteredReturns = mockRecentReturns.filter((returnItem) => {
    const matchesSearch =
      returnItem.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || returnItem.status.toLowerCase().replace(" ", "-") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get paginated data
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const paginatedReturns = filteredReturns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Get only 5 most recent returns for the Recent Returns section
  const recentReturns = mockRecentReturns.slice(0, 5);

  const addToReturn = (item) => {
    const existingItem = returnItems.find((returnItem) => returnItem.id === item.id);
    if (!existingItem) {
      setReturnItems([
        ...returnItems,
        {
          ...item,
          returnQuantity: 0,
          returnReason: "",
          maxQuantity: item.issuedQuantity,
        },
      ]);
    }
  };

  const removeFromReturn = (itemId) => {
    setReturnItems(returnItems.filter((item) => item.id !== itemId));
  };

  const updateReturnItem = (itemId, field, value) => {
    setReturnItems(returnItems.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  };

  const handleProcessReturns = async () => {
    // Validate return items
    const validItems = returnItems.filter((item) => item.returnQuantity > 0 && item.returnQuantity <= item.maxQuantity);

    if (validItems.length === 0) {
      alert("Please add items with valid return quantities");
      return;
    }

    setIsProcessing(true);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);

    // Reset form
    setReturnItems([]);
    setSelectedProject("");
    setIsProcessing(false);

    console.log("Returns processed:", validItems);
  };

  const calculateTotalReturnValue = () => {
    return returnItems.reduce((total, item) => {
      return total + item.unitPrice * (item.returnQuantity || 0);
    }, 0);
  };

  const exportReturns = () => {
    const headers = [
      "Return ID",
      "Part Number",
      "Description",
      "Project",
      "Quantity",
      "Unit",
      "Return Value",
      "Reason",
      "Returned By",
      "Return Date",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredReturns.map((item) =>
        [
          item.id,
          item.partNumber,
          `"${item.description}"`,
          `"${item.projectName}"`,
          item.quantity,
          item.unit,
          item.returnValue,
          `"${item.returnReason}"`,
          item.returnedBy,
          item.returnDate,
          item.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Returns_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Returns processed successfully! Items have been added back to inventory with current timestamp.
          </AlertDescription>
        </Alert>
      )}

      {/* Select Project Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Project</CardTitle>
              <CardDescription>Choose a project to view issued items and process returns</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportReturns}>
              <Download className="h-4 w-4 mr-2" />
              Export Returns
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-md">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map((project) => (
                  <SelectItem key={project.id} value={project.name}>
                    {project.name} ({project.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issued Items for Project Section */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Issued Items for Project</CardTitle>
            <CardDescription>Items that were issued to {selectedProject}</CardDescription>
          </CardHeader>
          <CardContent>
            {issuedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items have been issued to this project yet.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.partNumber}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.issuedQuantity}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => addToReturn(item)}
                            disabled={returnItems.some((returnItem) => returnItem.id === item.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {returnItems.some((returnItem) => returnItem.id === item.id)
                              ? "Added"
                              : "Add to Return"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Process Returns Section */}
      {returnItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Process Returns</CardTitle>
                <CardDescription>Specify quantities and reasons for return</CardDescription>
              </div>
              {calculateTotalReturnValue() > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Return Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{calculateTotalReturnValue().toFixed(2)}</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Return Quantity</TableHead>
                      <TableHead>Return Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.partNumber}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Input
                              type="number"
                              min="0"
                              max={item.maxQuantity}
                              value={item.returnQuantity || ""}
                              onChange={(e) =>
                                updateReturnItem(item.id, "returnQuantity", Number.parseInt(e.target.value) || 0)
                              }
                              placeholder="0"
                              className="w-20"
                            />
                            <p className="text-xs text-muted-foreground">(Max: {item.maxQuantity})</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.returnReason || ""}
                            onValueChange={(value) => updateReturnItem(item.id, "returnReason", value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Reason for return" />
                            </SelectTrigger>
                            <SelectContent>
                              {returnReasons.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                  {reason}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => removeFromReturn(item.id)}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleProcessReturns}
                  disabled={
                    isProcessing || returnItems.every((item) => !item.returnQuantity || item.returnQuantity === 0)
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? "Processing Returns..." : "Process Returns"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Returns and Returns History in a grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Returns */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Recent Returns</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
              >
                View All
              </Button>
            </div>
            <CardDescription>Latest return transactions (Top 5)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReturns.length > 0 ? (
                recentReturns.map((returnItem) => (
                  <div
                    key={returnItem.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{returnItem.partNumber}</div>
                        <Badge
                          variant={returnItem.status === "Processed" ? "secondary" : "outline"}
                          className="text-xs ml-2"
                        >
                          {returnItem.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">from {returnItem.projectName}</div>
                      <div className="text-xs text-muted-foreground">
                        {returnItem.quantity} {returnItem.unit} • ₹{returnItem.returnValue.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(returnItem.returnDate).toLocaleString()}
                      </div>
                      {returnItem.returnReason && (
                        <div className="text-xs text-muted-foreground">
                          Reason: {returnItem.returnReason}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent returns available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Returns History Table with Pagination */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Returns History</CardTitle>
                <CardDescription>Complete history of all return transactions</CardDescription>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-2 w-full lg:w-auto">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search returns..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 w-full"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="pending-inspection">Pending Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return ID</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Return Value</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReturns.length > 0 ? (
                    paginatedReturns.map((returnItem) => (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-medium">{returnItem.id}</TableCell>
                        <TableCell>{returnItem.partNumber}</TableCell>
                        <TableCell>{returnItem.projectName}</TableCell>
                        <TableCell>
                          {returnItem.quantity} {returnItem.unit}
                        </TableCell>
                        <TableCell className="text-green-600">₹{returnItem.returnValue.toFixed(2)}</TableCell>
                        <TableCell>{new Date(returnItem.returnDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={returnItem.status === "Processed" ? "secondary" : "outline"}>
                            {returnItem.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No returns found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {filteredReturns.length > 0 && (
            <CardFooter className="border-t pt-4">
              <div className="flex flex-col gap-4 w-full lg:flex-row lg:items-center lg:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredReturns.length)} of {filteredReturns.length} returns
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={`w-8 h-8 p-0 ${currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

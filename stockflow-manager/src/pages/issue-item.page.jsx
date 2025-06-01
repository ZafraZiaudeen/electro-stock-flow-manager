"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Package, FileText, X, Save } from "lucide-react";

// Mock stock data with entry dates for FIFO
const initialStockItems = [
  {
    partNumber: "EL-SW-001",
    makeCompany: "Schneider Electric",
    description: "Circuit Breaker 30A",
    unit: "Pieces",
    unitPrice: 78.5,
    quantity: 20,
    entryDate: "2024-01-10",
  },
  {
    partNumber: "EL-SW-001",
    makeCompany: "Schneider Electric",
    description: "Circuit Breaker 30A",
    unit: "Pieces",
    unitPrice: 78.5,
    quantity: 10,
    entryDate: "2024-02-15",
  },
  {
    partNumber: "EL-CB-002",
    makeCompany: "ABB Ltd",
    description: "Contactor 40A",
    unit: "Pieces",
    unitPrice: 65.75,
    quantity: 15,
    entryDate: "2024-01-14",
  },
];

// Mock list of projects
const projectsList = ["Project A", "Project B", "Project C"];

export default function IssueItems() {
  const [stockItems, setStockItems] = useState(initialStockItems);
  const [issuedItems, setIssuedItems] = useState([]);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [issueData, setIssueData] = useState({
    partNumber: "",
    totalUnits: 0,
    projects: [{ projectName: "", quantity: 0 }],
  });
  const [availableQty, setAvailableQty] = useState(60);
  const [availableValue, setAvailableValue] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState("");

  // Calculate available quantity and value for a part number
  const calculateAvailableStock = (partNumber) => {
    const matchingItems = stockItems
      .filter((item) => item.partNumber === partNumber)
      .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate)); // Sort by FIFO

    const totalQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
    const avgUnitPrice = matchingItems.length > 0 ? matchingItems[0].unitPrice : 0; // Use the price of the oldest item for simplicity
    const unit = matchingItems.length > 0 ? matchingItems[0].unit : "";
    setAvailableQty(totalQty);
    setAvailableValue(totalQty * avgUnitPrice);
    setSelectedUnit(unit);
  };

  // Handle part number change to auto-populate available quantity and value
  const handlePartNumberChange = (value) => {
    setIssueData({ ...issueData, partNumber: value });
    if (value) {
      calculateAvailableStock(value);
    } else {
      setAvailableQty(0);
      setAvailableValue(0);
      setSelectedUnit("");
    }
  };

  // Add a new project row
  const addProjectRow = () => {
    setIssueData({
      ...issueData,
      projects: [...issueData.projects, { projectName: "", quantity: 0 }],
    });
  };

  // Remove a project row
  const removeProjectRow = (index) => {
    const updatedProjects = issueData.projects.filter((_, i) => i !== index);
    setIssueData({ ...issueData, projects: updatedProjects });
  };

  // Handle project selection and quantity input
  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...issueData.projects];
    updatedProjects[index][field] = value;
    setIssueData({ ...issueData, projects: updatedProjects });
  };

  // Handle issuing items using FIFO
  const handleIssueItems = () => {
    const { partNumber, totalUnits, projects } = issueData;

    // Validation
    if (!partNumber || totalUnits <= 0) {
      alert("Please enter a valid Part Number and Total Units.");
      return;
    }
    if (availableQty < totalUnits) {
      alert("Insufficient stock available to issue the requested quantity.");
      return;
    }
    const totalProjectUnits = projects.reduce((sum, proj) => sum + proj.quantity, 0);
    if (totalProjectUnits !== totalUnits) {
      alert("The sum of units allocated to projects must equal the total units to issue.");
      return;
    }
    if (projects.some((proj) => !proj.projectName || proj.quantity <= 0)) {
      alert("Please specify a project and a valid quantity for each project allocation.");
      return;
    }

    // Issue items using FIFO
    let remainingUnits = totalUnits;
    const sortedStock = [...stockItems]
      .filter((item) => item.partNumber === partNumber)
      .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate)); // Sort by FIFO

    const updatedStock = [...stockItems];
    for (let i = 0; i < sortedStock.length && remainingUnits > 0; i++) {
      const stockIndex = updatedStock.findIndex(
        (item) => item.partNumber === partNumber && item.entryDate === sortedStock[i].entryDate
      );
      const available = updatedStock[stockIndex].quantity;
      const toDeduct = Math.min(remainingUnits, available);
      updatedStock[stockIndex].quantity -= toDeduct;
      remainingUnits -= toDeduct;
    }

    // Remove items with zero quantity
    const filteredStock = updatedStock.filter((item) => item.quantity > 0);
    setStockItems(filteredStock);

    // Record the issuance
    const issuedItem = {
      partNumber,
      quantity: totalUnits,
      projects,
      dateIssued: new Date().toISOString().split("T")[0], // Today's date
    };
    setIssuedItems([...issuedItems, issuedItem]);

    // Reset dialog state
    setIssueData({
      partNumber: "",
      totalUnits: 0,
      projects: [{ projectName: "", quantity: 0 }],
    });
    setAvailableQty(0);
    setAvailableValue(0);
    setSelectedUnit("");
    setShowIssueDialog(false);
    alert(`Successfully issued ${totalUnits} units of ${partNumber}.`);
  };

  // Calculate summary stats
  const totalItemsInStock = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalIssuedItems = issuedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalIssuedValue = issuedItems.reduce((sum, item) => {
    const unitPrice = stockItems.find((stock) => stock.partNumber === item.partNumber)?.unitPrice || 0;
    return sum + item.quantity * unitPrice;
  }, 0);

  return (
    <>
      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items in Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItemsInStock}</div>
              <p className="text-xs text-muted-foreground">Available for issuance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issued Items</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIssuedItems}</div>
              <p className="text-xs text-muted-foreground">Issued this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issued Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalIssuedValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Value of issued items</p>
            </CardContent>
          </Card>
        </div>

        {/* Issue Items Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowIssueDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Issue Items
            </Button>
          </CardContent>
        </Card>

        {/* Issued Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Issued Items History</CardTitle>
          </CardHeader>
          <CardContent>
            {issuedItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No items have been issued yet.</p>
                <p className="text-sm">Click "Issue Items" to start issuing stock.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Quantity Issued</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Date Issued</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuedItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.partNumber}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.projects.map((proj, i) => (
                            <div key={i}>
                              {proj.projectName}: {proj.quantity} units
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>{item.dateIssued}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issue Items Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Stock Items</DialogTitle>
            <DialogDescription>Enter the details to issue stock items to projects</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Part Number *</label>
              <Input
                value={issueData.partNumber}
                onChange={(e) => handlePartNumberChange(e.target.value)}
                placeholder="Enter Part Number"
              />
              {issueData.partNumber && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Available Quantity: {availableQty}</span>
                  <span>Value: ${availableValue.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit of Measurement</label>
              <Input value={selectedUnit} disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Number of Units to Issue *</label>
              <Input
                type="number"
                value={issueData.totalUnits}
                onChange={(e) =>
                  setIssueData({ ...issueData, totalUnits: parseInt(e.target.value) || 0 })
                }
                placeholder="Enter Total Units"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue to Projects *</label>
              {issueData.projects.map((project, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Select
                    value={project.projectName}
                    onValueChange={(value) => handleProjectChange(index, "projectName", value)}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectsList.map((proj) => (
                        <SelectItem key={proj} value={proj}>
                          {proj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={project.quantity}
                    onChange={(e) =>
                      handleProjectChange(index, "quantity", parseInt(e.target.value) || 0)
                    }
                    placeholder="Units"
                    className="w-1/4"
                  />
                  {issueData.projects.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProjectRow(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addProjectRow}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Project
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssueItems}>
              <Save className="h-4 w-4 mr-2" />
              Issue Items
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
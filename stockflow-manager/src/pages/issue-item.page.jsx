"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Package, FileText, X, Save, Search } from "lucide-react";

// Sample stock data with entry dates for FIFO
const initialStockItems = [
  {
    partNumber: "BL001",
    makeCompany: "GOOGLE",
    description: "Blade",
    unit: "Pieces",
    unitPrice: 50.0,
    quantity: 50,
    entryDate: "2025-05-01",
  },
  {
    partNumber: "BL001",
    makeCompany: "GOOGLE",
    description: "Blade",
    unit: "Pieces",
    unitPrice: 50.0,
    quantity: 50,
    entryDate: "2025-06-01",
  },
  {
    partNumber: "CB002",
    makeCompany: "ABB Ltd",
    description: "Contactor 40A",
    unit: "Pieces",
    unitPrice: 65.75,
    quantity: 30,
    entryDate: "2025-05-15",
  },
];

// Mock list of projects
const projectsList = ["Project Alpha", "Project Beta", "Project Gamma"];

export default function IssueItems() {
  const [stockItems, setStockItems] = useState(initialStockItems);
  const [issuedItems, setIssuedItems] = useState([]);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [issueData, setIssueData] = useState({
    partNumber: "",
    totalUnits: 0,
    projects: [{ projectName: "", quantity: 0 }],
  });
  const [availableQty, setAvailableQty] = useState(0);
  const [availableValue, setAvailableValue] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Find item and calculate available stock
  const handleFindItem = (value) => {
    setSearchTerm(value);
    const matchingItems = stockItems.filter((item) => item.partNumber === value);
    if (matchingItems.length > 0) {
      const sortedItems = matchingItems.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
      const totalQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
      const avgUnitPrice = sortedItems[0].unitPrice;
      const unit = sortedItems[0].unit;
      setIssueData({ ...issueData, partNumber: value });
      setAvailableQty(totalQty);
      setAvailableValue(totalQty * avgUnitPrice);
      setSelectedUnit(unit);
    } else {
      setIssueData({ ...issueData, partNumber: value });
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

    let remainingUnits = totalUnits;
    const sortedStock = [...stockItems]
      .filter((item) => item.partNumber === partNumber)
      .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));

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

    const filteredStock = updatedStock.filter((item) => item.quantity > 0);
    setStockItems(filteredStock);

    const issuedItem = {
      partNumber,
      quantity: totalUnits,
      projects,
      dateIssued: new Date().toISOString().split("T")[0],
    };
    setIssuedItems([...issuedItems, issuedItem]);

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

  return (
    <div className="p-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Find Item"
                value={searchTerm}
                onChange={(e) => handleFindItem(e.target.value)}
                className="w-1/3"
              />
              <Button onClick={() => handleFindItem(searchTerm)}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {issueData.partNumber && (
              <div>
                <p>Description: {stockItems.find((item) => item.partNumber === issueData.partNumber)?.description || "N/A"}</p>
                <p>Make Company: {stockItems.find((item) => item.partNumber === issueData.partNumber)?.makeCompany || "N/A"}</p>
                <p>Unit: {selectedUnit}</p>
                <p>Available Quantity: {availableQty} {selectedUnit}</p>
              </div>
            )}
            <div>
              <label>Total Quantity to Issue</label>
              <Input
                type="number"
                value={issueData.totalUnits}
                onChange={(e) => setIssueData({ ...issueData, totalUnits: parseInt(e.target.value) || 0 })}
                placeholder="Enter Total Quantity"
              />
            </div>
            <div>
              <h3>Project Allocations</h3>
              {issueData.projects.map((project, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Select
                    value={project.projectName}
                    onValueChange={(value) => handleProjectChange(index, "projectName", value)}
                  >
                    <SelectTrigger className="w-1/3">
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
                    onChange={(e) => handleProjectChange(index, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="Quantity"
                    className="w-1/6"
                  />
                  {index > 0 && (
                    <Button variant="destructive" size="sm" onClick={() => removeProjectRow(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addProjectRow} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
            <Button onClick={handleIssueItems} disabled={!issueData.partNumber || issueData.totalUnits <= 0 || availableQty < issueData.totalUnits}>
              <Save className="h-4 w-4 mr-2" />
              Issue Items
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
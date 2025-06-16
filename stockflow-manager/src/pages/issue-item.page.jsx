// src/app/issue-item/page.jsx
"use client";

import { useState } from "react";
import { useGetPurchaseEntryByPartNumberQuery } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X, Save, Search } from "lucide-react";

// Mock list of projects
const projectsList = ["Project Alpha", "Project Beta", "Project Gamma"];

export default function IssueItems() {
  const [partNumber, setPartNumber] = useState("");
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

  // Fetch purchase entry by part number
  const { data: purchaseEntry, error, isLoading } = useGetPurchaseEntryByPartNumberQuery(partNumber, {
    skip: !partNumber, // Only fetch if partNumber is provided
  });

  // Find item and set available stock (based on purchase entry for now)
  const handleFindItem = (partNumber) => {
    setIssueData((prev) => ({ ...prev, partNumber }));
    if (purchaseEntry?.items) {
      const matchingItem = purchaseEntry.items.find((item) => item.partNumber === partNumber);
      if (matchingItem) {
        setAvailableQty(matchingItem.quantity); // Use quantity from purchase entry as available qty
        setAvailableValue(matchingItem.quantity * matchingItem.unitPrice);
        setSelectedUnit(matchingItem.unit);
      } else {
        setAvailableQty(0);
        setAvailableValue(0);
        setSelectedUnit("");
      }
    } else {
      setAvailableQty(0);
      setAvailableValue(0);
      setSelectedUnit("");
    }
  };

  // Add a new project row
  const addProjectRow = () => {
    setIssueData((prev) => ({
      ...prev,
      projects: [...prev.projects, { projectName: "", quantity: 0 }],
    }));
  };

  // Remove a project row
  const removeProjectRow = (index) => {
    setIssueData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  // Handle project selection and quantity input
  const handleProjectChange = (index, field, value) => {
    setIssueData((prev) => {
      const updatedProjects = [...prev.projects];
      updatedProjects[index][field] = value;
      return { ...prev, projects: updatedProjects };
    });
  };

  // Handle issuing items (simulated for now, no backend update)
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

    // Simulate issuing by updating local state (to be replaced with backend call)
    const issuedItem = {
      partNumber,
      quantity: totalUnits,
      projects,
      dateIssued: new Date().toISOString().split("T")[0],
    };
    setIssuedItems((prev) => [...prev, issuedItem]);

    // Update available quantity locally (for demo purposes)
    if (purchaseEntry?.items) {
      const updatedItems = purchaseEntry.items.map((item) =>
        item.partNumber === partNumber ? { ...item, quantity: item.quantity - totalUnits } : item
      );
      // This is a local simulation; in reality, you'd update the backend
      setAvailableQty((prev) => prev - totalUnits);
    }

    setIssueData({
      partNumber: "",
      totalUnits: 0,
      projects: [{ projectName: "", quantity: 0 }],
    });
    setAvailableValue(0);
    setSelectedUnit("");
    setShowIssueDialog(false);
    alert(`Successfully issued ${totalUnits} units of ${partNumber}.`);
  };

  // Handle part number search
  const handlePartSearch = () => {
    if (!partNumber) {
      alert("Please enter a Part Number to search.");
      return;
    }
    handleFindItem(partNumber); // Directly use the entered part number
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Issue Items</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Part Number"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-1/3"
              />
              <Button onClick={handlePartSearch} disabled={isLoading}>
                <Search className="h-4 w-4" />
                {isLoading && " Loading..."}
              </Button>
            </div>
            {error && <p className="text-red-500">Error: {error.message}</p>}
            {purchaseEntry && (
              <div>
                <h3 className="text-lg font-semibold">Purchase Entry Details</h3>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseEntry.items
                      .filter((item) => item.partNumber === partNumber)
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.partNumber}</TableCell>
                          <TableCell>{item.makeCompany}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.packing}</TableCell>
                          <TableCell>{item.unitPrice}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {issueData.partNumber && (
              <div>
                <p>Description: {purchaseEntry?.items.find((item) => item.partNumber === issueData.partNumber)?.description || "N/A"}</p>
                <p>Make Company: {purchaseEntry?.items.find((item) => item.partNumber === issueData.partNumber)?.makeCompany || "N/A"}</p>
                <p>Unit: {selectedUnit}</p>
                <p>Available Quantity: {availableQty} {selectedUnit}</p>
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
                <Button
                  onClick={() => setShowIssueDialog(true)}
                  disabled={!issueData.partNumber || issueData.totalUnits <= 0 || availableQty < issueData.totalUnits}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Issue Items
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Issue</DialogTitle>
            <DialogDescription>
              Are you sure you want to issue {issueData.totalUnits} units of {issueData.partNumber}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>Allocated to Projects:</p>
            {issueData.projects.map((project, index) => (
              project.projectName && (
                <p key={index}>
                  {project.projectName}: {project.quantity} units
                </p>
              )
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssueItems}>
              <Save className="h-4 w-4 mr-2" />
              Confirm Issue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
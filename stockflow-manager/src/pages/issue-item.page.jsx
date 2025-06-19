// src/app/issue-item/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  useGetAvailableInventoryByPartNumberQuery,
  useCreateIssueMutation,
  useGetAllIssuesQuery,
  useGetAllProjectsQuery,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X, Save, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IssueItems() {
  const [partNumber, setPartNumber] = useState("");
  const [issuedItems, setIssuedItems] = useState([]);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [issueData, setIssueData] = useState({
    partNumber: "",
    totalUnits: 0,
    projects: [{ projectName: "", quantity: 0 }],
  });
  const [availableInventory, setAvailableInventory] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [activeTab, setActiveTab] = useState("issue");
  const [newProject, setNewProject] = useState({ projectName: "", projectNumber: "", description: "", status: "active" });
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  // API Queries and Mutations
  const { data: inventoryData, error, isLoading } = useGetAvailableInventoryByPartNumberQuery(partNumber, { skip: !partNumber });
  const { data: issues = [] } = useGetAllIssuesQuery();
  const { data: projects = [], refetch: refetchProjects } = useGetAllProjectsQuery();
  const [createIssue] = useCreateIssueMutation();

  // Load projects
  const [projectsList, setProjectsList] = useState([]);
  useEffect(() => {
    if (projects.length > 0) {
      setProjectsList(projects.map((p) => p.projectName));
    }
  }, [projects]);

  // Find item and set available inventory
  const handleFindItem = () => {
    setIssueData((prev) => ({ ...prev, partNumber }));
    if (inventoryData) {
      setAvailableInventory(inventoryData);
      // Set the first unit as default (all should be the same for a part number)
      if (inventoryData.length > 0) {
        setSelectedUnit(inventoryData[0].unit);
      }
    } else {
      setAvailableInventory([]);
      setSelectedUnit("");
    }
  };

  // Add/remove project row
  const addProjectRow = () => {
    setIssueData((prev) => ({
      ...prev,
      projects: [...prev.projects, { projectName: "", quantity: 0 }],
    }));
  };

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

  // Handle issuing items with FIFO (handled by backend)
  const handleIssueItems = async () => {
    const { partNumber, totalUnits, projects } = issueData;

    if (!partNumber || totalUnits <= 0) {
      alert("Please enter a valid Part Number and Total Units.");
      return;
    }
    const totalAvailable = availableInventory.reduce((sum, item) => sum + item.quantity, 0);
    if (totalAvailable < totalUnits) {
      alert(`Insufficient stock available. Total available: ${totalAvailable} ${selectedUnit}`);
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

    try {
      const purchaseEntry = await fetch(`http://localhost:8000/api/purchase-entries/part/${partNumber}`).then((res) => res.json());
      await createIssue({
        partNumber,
        quantity: totalUnits,
        projects,
        poNumber: purchaseEntry?.poNumber || availableInventory[0]?.poNumber,
      }).unwrap();

      const issuedItem = {
        partNumber,
        quantity: totalUnits,
        projects,
        dateIssued: new Date().toISOString().split("T")[0],
      };
      setIssuedItems((prev) => [...prev, issuedItem]);
      setAvailableInventory((prev) => {
        let remaining = totalUnits;
        return prev.map((item) => {
          if (remaining <= 0) return item;
          const qtyToDeduct = Math.min(remaining, item.quantity);
          remaining -= qtyToDeduct;
          return { ...item, quantity: item.quantity - qtyToDeduct };
        }).filter((item) => item.quantity > 0);
      });
      setIssueData({
        partNumber: "",
        totalUnits: 0,
        projects: [{ projectName: "", quantity: 0 }],
      });
      setShowIssueDialog(false);
      alert(`Successfully issued ${totalUnits} units of ${partNumber}.`);
    } catch (err) {
      alert(`Failed to issue items: ${err?.data?.message || err?.error || "Unknown error"}`);
    }
  };

  // Handle part number search
  const handlePartSearch = () => {
    if (!partNumber) {
      alert("Please enter a Part Number to search.");
      return;
    }
    handleFindItem();
  };

  // Handle new project creation
  const handleCreateProject = async () => {
    if (!newProject.projectName || !newProject.projectNumber || !newProject.description || !newProject.status) {
      alert("All project fields are required.");
      return;
    }

    try {
      await fetch("http://localhost:8000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      setNewProject({ projectName: "", projectNumber: "", description: "", status: "active" });
      setShowProjectDialog(false);
      refetchProjects();
      alert("Project created successfully!");
    } catch (err) {
      alert(`Failed to create project: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="issue">Issue Items</TabsTrigger>
          <TabsTrigger value="history">Issue History</TabsTrigger>
        </TabsList>

        {/* Issue Items Tab */}
        <TabsContent value="issue">
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
                {availableInventory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold">Available Inventory for {partNumber}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Make Company</TableHead>
                          <TableHead>Purchase Date</TableHead>
                          <TableHead>PO Number</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableInventory.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.makeCompany}</TableCell>
                            <TableCell>{new Date(item.purchaseDate).toLocaleDateString()}</TableCell>
                            <TableCell>{item.poNumber}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <p>Total Available: {availableInventory.reduce((sum, item) => sum + item.quantity, 0)} {selectedUnit}</p>
                  </div>
                )}
                {issueData.partNumber && (
                  <div>
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
                      <Button variant="outline" size="sm" onClick={() => setShowProjectDialog(true)} className="mt-2 ml-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Project
                      </Button>
                    </div>
                    <Button
                      onClick={() => setShowIssueDialog(true)}
                      disabled={!issueData.partNumber || issueData.totalUnits <= 0 || availableInventory.reduce((sum, item) => sum + item.quantity, 0) < issueData.totalUnits}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Issue Items
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Create Project Dialog */}
          <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Project Name"
                  value={newProject.projectName}
                  onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                />
                <Input
                  placeholder="Project Number"
                  value={newProject.projectNumber}
                  onChange={(e) => setNewProject({ ...newProject, projectNumber: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowProjectDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Issue Confirmation Dialog */}
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
                {issueData.projects.map((project, index) =>
                  project.projectName ? (
                    <p key={index}>
                      {project.projectName}: {project.quantity} units
                    </p>
                  ) : null
                )}
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
        </TabsContent>

        {/* Issue History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Issue History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Quantity Issued</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead>PO Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue, index) => (
                    <TableRow key={index}>
                      <TableCell>{issue.partNumber}</TableCell>
                      <TableCell>{issue.quantity}</TableCell>
                      <TableCell>
                        {issue.projects.map((proj, idx) => (
                          <p key={idx}>{`${proj.projectName}: ${proj.quantity} units`}</p>
                        ))}
                      </TableCell>
                      <TableCell>{new Date(issue.dateIssued).toLocaleDateString()}</TableCell>
                      <TableCell>{issue.poNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
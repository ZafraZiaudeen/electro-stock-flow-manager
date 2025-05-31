"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  CalendarIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data for projects
const mockProjects = [
  {
    id: "PRJ001",
    name: "Project Alpha",
    description: "First test project for automation system implementation",
    status: "Active",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    budget: 50000.0,
    totalCost: 25000.0,
    itemsIssued: 45,
    itemsReturned: 3,
    progress: 65,
    manager: "John Doe",
    client: "ABC Manufacturing",
    priority: "High",
  },
  {
    id: "PRJ002",
    name: "Project Beta",
    description: "Second test project for control panel upgrade",
    status: "Active",
    startDate: "2024-02-01",
    endDate: "2024-07-01",
    budget: 75000.0,
    totalCost: 32000.0,
    itemsIssued: 67,
    itemsReturned: 5,
    progress: 45,
    manager: "Sarah Smith",
    client: "XYZ Industries",
    priority: "Medium",
  },
  {
    id: "PRJ003",
    name: "Project Gamma",
    description: "Third test project for network infrastructure",
    status: "Completed",
    startDate: "2023-11-01",
    endDate: "2024-03-01",
    budget: 30000.0,
    totalCost: 28500.0,
    itemsIssued: 89,
    itemsReturned: 12,
    progress: 100,
    manager: "Mike Johnson",
    client: "Tech Solutions Ltd",
    priority: "Low",
  },
  {
    id: "PRJ004",
    name: "Motor Drive System",
    description: "Industrial motor drive control system installation",
    status: "On Hold",
    startDate: "2024-03-01",
    endDate: "2024-08-01",
    budget: 40000.0,
    totalCost: 8000.0,
    itemsIssued: 23,
    itemsReturned: 1,
    progress: 20,
    manager: "Emily Davis",
    client: "Industrial Corp",
    priority: "High",
  },
  {
    id: "PRJ005",
    name: "Smart Building Integration",
    description: "IoT and automation system for smart building management",
    status: "Planning",
    startDate: "2024-06-01",
    endDate: "2024-12-01",
    budget: 120000.0,
    totalCost: 0.0,
    itemsIssued: 0,
    itemsReturned: 0,
    progress: 5,
    manager: "Alex Wilson",
    client: "Smart Properties Inc",
    priority: "Medium",
  },
]

const projectStatuses = ["Active", "Completed", "On Hold", "Planning", "Cancelled"]
const priorities = ["Low", "Medium", "High", "Critical"]

export default function ProjectsManagement() {
  const [projects, setProjects] = useState(mockProjects)
  const [showAddProject, setShowAddProject] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Add Project Form State
  const [newProject, setNewProject] = useState({
    name: "",
    number: "",
    description: "",
    status: "Planning",
    startDate: null,
    endDate: null,
    budget: "",
    manager: "",
    client: "",
    priority: "Medium",
  })

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter

    const projectStartDate = new Date(project.startDate)
    const matchesDateRange = (!startDate || projectStartDate >= startDate) && (!endDate || projectStartDate <= endDate)

    return matchesSearch && matchesStatus && matchesPriority && matchesDateRange
  })

  // Calculate summary statistics
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === "Active").length
  const completedProjects = projects.filter((p) => p.status === "Completed").length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalCost = projects.reduce((sum, p) => sum + p.totalCost, 0)

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "On Hold":
        return "bg-yellow-100 text-yellow-800"
      case "Planning":
        return "bg-purple-100 text-purple-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddProject = () => {
    if (!newProject.name || !newProject.number) {
      alert("Please fill in required fields")
      return
    }

    const project = {
      id: newProject.number,
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      startDate: newProject.startDate ? format(newProject.startDate, "yyyy-MM-dd") : null,
      endDate: newProject.endDate ? format(newProject.endDate, "yyyy-MM-dd") : null,
      budget: Number.parseFloat(newProject.budget) || 0,
      totalCost: 0,
      itemsIssued: 0,
      itemsReturned: 0,
      progress: newProject.status === "Planning" ? 0 : 5,
      manager: newProject.manager,
      client: newProject.client,
      priority: newProject.priority,
    }

    setProjects([...projects, project])
    setNewProject({
      name: "",
      number: "",
      description: "",
      status: "Planning",
      startDate: null,
      endDate: null,
      budget: "",
      manager: "",
      client: "",
      priority: "Medium",
    })
    setShowAddProject(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleViewProject = (project) => {
    setSelectedProject(project)
    setShowProjectDetails(true)
  }

  const handleDeleteProject = (projectId) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((p) => p.id !== projectId))
    }
  }

  const applyDateFilter = () => {
    // Date filter is applied automatically through filteredProjects
    console.log("Date filter applied:", { startDate, endDate })
  }

  const clearDateFilter = () => {
    setStartDate(null)
    setEndDate(null)
  }

  const exportProjects = () => {
    const headers = [
      "Project ID",
      "Name",
      "Description",
      "Status",
      "Priority",
      "Start Date",
      "End Date",
      "Budget",
      "Total Cost",
      "Progress",
      "Manager",
      "Client",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredProjects.map((project) =>
        [
          project.id,
          `"${project.name}"`,
          `"${project.description}"`,
          project.status,
          project.priority,
          project.startDate,
          project.endDate,
          project.budget,
          project.totalCost,
          project.progress,
          project.manager,
          `"${project.client}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Projects_Report_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Project added successfully!</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">All projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedProjects}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Allocated budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0 ? `${((totalCost / totalBudget) * 100).toFixed(1)}% of budget` : "No budget set"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Date Range Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button onClick={applyDateFilter} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Apply Filter
              </Button>
              <Button variant="outline" onClick={clearDateFilter}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Manage and track all your projects</CardDescription>
              </div>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-64"
                  />
                </div>
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {projectStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => setShowAddProject(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Priority</TableHead>
                    <TableHead className="hidden sm:table-cell">Progress</TableHead>
                    <TableHead className="hidden sm:table-cell">Total Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.id}</TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell className="hidden sm:table-cell max-w-[200px] truncate">{project.description}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">₹{project.totalCost.toLocaleString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <div className="h-4 w-4">⋯</div>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewProject(project)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteProject(project.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No projects found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Create a new project to track inventory and costs</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectNumber">
                Project Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectNumber"
                placeholder="Enter project number"
                value={newProject.number}
                onChange={(e) => setNewProject({ ...newProject, number: e.target.value })}
              />
            </div>

            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={newProject.status}
                onValueChange={(value) => setNewProject({ ...newProject, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={newProject.priority}
                onValueChange={(value) => setNewProject({ ...newProject, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newProject.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newProject.startDate ? format(newProject.startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newProject.startDate}
                    onSelect={(date) => setNewProject({ ...newProject, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newProject.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newProject.endDate ? format(newProject.endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newProject.endDate}
                    onSelect={(date) => setNewProject({ ...newProject, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Enter budget amount"
                value={newProject.budget}
                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Project Manager</Label>
              <Input
                id="manager"
                placeholder="Enter manager name"
                value={newProject.manager}
                onChange={(e) => setNewProject({ ...newProject, manager: e.target.value })}
              />
            </div>

            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                placeholder="Enter client name"
                value={newProject.client}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddProject(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProject} className="bg-blue-600 hover:bg-blue-700">
              Add Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details - {selectedProject?.name}</DialogTitle>
            <DialogDescription>Complete information about the project</DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Project Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Project ID:</span>
                        <span className="text-sm font-medium">{selectedProject.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="text-sm font-medium">{selectedProject.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(selectedProject.status)}>{selectedProject.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Priority:</span>
                        <Badge className={getPriorityColor(selectedProject.priority)}>
                          {selectedProject.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Progress:</span>
                        <span className="text-sm font-medium">{selectedProject.progress}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Team & Client</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Manager:</span>
                        <span className="text-sm font-medium">{selectedProject.manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Client:</span>
                        <span className="text-sm font-medium">{selectedProject.client}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Start Date:</span>
                        <span className="text-sm font-medium">{selectedProject.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">End Date:</span>
                        <span className="text-sm font-medium">{selectedProject.endDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedProject.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{selectedProject.budget.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Allocated budget</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        ₹{selectedProject.totalCost.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Total expenses</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Remaining</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ₹{(selectedProject.budget - selectedProject.totalCost).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Available budget</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Items Issued</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedProject.itemsIssued}</div>
                      <p className="text-xs text-muted-foreground">Total items issued to project</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Items Returned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedProject.itemsReturned}</div>
                      <p className="text-xs text-muted-foreground">Items returned from project</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Project Created</p>
                      <p className="text-xs text-muted-foreground">Project was created and initialized</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Project Started</p>
                      <p className="text-xs text-muted-foreground">Work began on {selectedProject.startDate}</p>
                    </div>
                  </div>
                  {selectedProject.status === "Completed" && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Project Completed</p>
                        <p className="text-xs text-muted-foreground">Project finished successfully</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowProjectDetails(false)}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
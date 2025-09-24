"use client"

import { useState } from "react"
import {
  Users,
  UserPlus,
  Shield,
  Warehouse,
  Eye,
  Search,
  MoreHorizontal,
  Mail,
  AlertCircle,
  CheckCircle,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data for users (removed Project Manager)
const mockUsers = [
  {
    id: "user_1",
    name: "System Administrator",
    email: "admin@inventifyflow.com",
    username: "@admin",
    role: "admin",
    status: "active",
    lastLogin: "2024-05-31",
    createdAt: "2023-01-15",
  },
  {
    id: "user_2",
    name: "Warehouse Manager",
    email: "warehouse@inventifyflow.com",
    username: "@warehouse",
    role: "warehouse",
    status: "active",
    lastLogin: "2024-05-31",
    createdAt: "2023-02-10",
  },
  {
    id: "user_3",
    name: "Inventory Viewer",
    email: "viewer@inventifyflow.com",
    username: "@viewer",
    role: "viewer",
    status: "active",
    lastLogin: "2024-05-31",
    createdAt: "2023-03-05",
  },
]

// Role definitions with permissions (removed Project Manager)
const roles = [
  {
    id: "admin",
    name: "Admin",
    icon: <Shield className="h-5 w-5" />,
    permissions: [
      "Full system access",
      "User management",
      "All operations",
      "System configuration",
      "Project management",
      "Financial reports",
    ],
  },
  {
    id: "warehouse",
    name: "Warehouse",
    icon: <Warehouse className="h-5 w-5" />,
    permissions: [
      "Inventory management",
      "Purchase entry",
      "Issue/Return items",
      "View reports",
      "Barcode scanning",
      "Stock adjustments",
    ],
  },
  {
    id: "viewer",
    name: "Viewer",
    icon: <Eye className="h-5 w-5" />,
    permissions: ["View inventory", "View reports", "Export data", "Read-only access"],
  },
]

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditPermissions, setShowEditPermissions] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination settings
  const usersPerPage = 6
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "viewer",
    sendInvite: true,
  })

  // Calculate user statistics
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === "active").length
  const adminUsers = users.filter((user) => user.role === "admin").length
  const warehouseUsers = users.filter((user) => user.role === "warehouse").length
  const viewerUsers = users.filter((user) => user.role === "viewer").length

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "warehouse":
        return "bg-blue-100 text-blue-800"
      case "viewer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.name : roleId
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      alert("Please fill in all required fields")
      return
    }

    const newUserId = `user_${users.length + 1}`
    const username = `@${newUser.name.toLowerCase().replace(/\s+/g, "")}`

    const user = {
      id: newUserId,
      name: newUser.name,
      email: newUser.email,
      username: username,
      role: newUser.role,
      status: "active",
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setUsers([...users, user])
    setNewUser({
      name: "",
      email: "",
      role: "viewer",
      sendInvite: true,
    })
    setShowAddUser(false)
    setSuccessMessage(
      `User ${newUser.name} has been added successfully${newUser.sendInvite ? " and invited via email" : ""}`,
    )
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditPermissions(true)
  }

  const handleUpdateUserRole = (role) => {
    if (!selectedUser) return

    const updatedUsers = users.map((user) => (user.id === selectedUser.id ? { ...user, role } : user))
    setUsers(updatedUsers)
    setShowEditPermissions(false)
    setSuccessMessage(`User ${selectedUser.name}'s role has been updated to ${getRoleName(role)}`)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handleToggleUserStatus = (userId) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user,
    )

    const targetUser = users.find((user) => user.id === userId)
    const newStatus = targetUser.status === "active" ? "inactive" : "active"

    setUsers(updatedUsers)
    setSuccessMessage(`User ${targetUser.name} has been ${newStatus === "active" ? "activated" : "deactivated"}`)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = () => {
    if (!selectedUser) return

    setUsers(users.filter((user) => user.id !== selectedUser.id))
    setShowDeleteConfirm(false)
    setSuccessMessage(`User ${selectedUser.name} has been deleted`)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handleResendInvite = (user) => {
    setSuccessMessage(`Invitation has been resent to ${user.email}`)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* User Statistics and Role Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Statistics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>User Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Users</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                {totalUsers}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Users</span>
              <Badge variant="outline" className="bg-green-50 text-green-800">
                {activeUsers}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Admins</span>
              <Badge variant="outline" className="bg-red-50 text-red-800">
                {adminUsers}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Warehouse Staff</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                {warehouseUsers}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Viewers</span>
              <Badge variant="outline" className="bg-green-50 text-green-800">
                {viewerUsers}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Role Permissions</CardTitle>
            </div>
            <CardDescription>What each role can do in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3">
                {roles.map((role) => (
                  <TabsTrigger key={role.id} value={role.id} className="flex items-center gap-2">
                    {role.icon}
                    <span className="hidden sm:inline">{role.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {roles.map((role) => (
                <TabsContent key={role.id} value={role.id} className="space-y-4 mt-4">
                  <div className="flex items-center gap-2">
                    {role.icon}
                    <h3 className="font-medium">{role.name}</h3>
                  </div>
                  <ul className="space-y-2">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* System Users */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>System Users</CardTitle>
              </div>
              <CardDescription>Manage user accounts and access</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowAddUser(true)}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter} className="w-40">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter} className="w-40">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">{user.username}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>{getRoleName(user.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "active" ? "default" : "outline"}
                          className={getStatusBadgeColor(user.status)}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {user.lastLogin === "Never" ? "Never" : user.lastLogin}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                              {user.status === "active" ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            {user.lastLogin === "Never" && (
                              <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Resend Invite
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
          {filteredUsers.length > usersPerPage && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(index + 1)}
                    className={currentPage === index + 1 ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New User
            </DialogTitle>
            <DialogDescription>
              Create a new user account. An invitation will be sent to their email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter user's full name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter user's email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        {role.icon}
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                This determines what the user can access in the system
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendInvite"
                checked={newUser.sendInvite}
                onCheckedChange={(checked) => setNewUser({ ...newUser, sendInvite: !!checked })}
              />
              <Label htmlFor="sendInvite">Send invitation email</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={showEditPermissions} onOpenChange={setShowEditPermissions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Edit User Permissions
            </DialogTitle>
            <DialogDescription>Change role and permissions for {selectedUser?.name}</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.username}</div>
              </div>

              <div className="space-y-2">
                <Label>Current Role</Label>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>{getRoleName(selectedUser.role)}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>New Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <Button
                      key={role.id}
                      variant={selectedUser.role === role.id ? "default" : "outline"}
                      className={`flex items-center justify-start gap-2 ${
                        selectedUser.role === role.id ? "bg-blue-600 hover:bg-blue-700" : ""
                      }`}
                      onClick={() => handleUpdateUserRole(role.id)}
                    >
                      {role.icon}
                      <span>{role.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPermissions(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="font-medium">{selectedUser.name}</div>
              <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              <div className="text-sm text-muted-foreground">{selectedUser.username}</div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
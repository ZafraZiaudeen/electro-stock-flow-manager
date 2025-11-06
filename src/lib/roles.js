/**
 * Role-based Access Control (RBAC) Utilities
 * 
 * This file defines the role hierarchy and permissions for the application.
 * Roles are stored in Clerk's publicMetadata as { role: "admin" | "warehouse_staff" | "viewer" }
 */

export const ROLES = {
  ADMIN: 'admin',
  WAREHOUSE_STAFF: 'warehouse_staff',
  VIEWER: 'viewer',
}

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.WAREHOUSE_STAFF]: 2,
  [ROLES.VIEWER]: 1,
}

/**
 * Role definitions with their permissions
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    name: 'Admin',
    description: 'Full system access including user management',
    permissions: [
      'view_dashboard',
      'manage_users',
      'manage_inventory',
      'manage_purchases',
      'manage_grn',
      'manage_issues',
      'manage_returns',
      'manage_projects',
      'view_reports',
      'manage_settings',
    ],
  },
  [ROLES.WAREHOUSE_STAFF]: {
    name: 'Warehouse Staff',
    description: 'Access to inventory operations but not user management',
    permissions: [
      'view_dashboard',
      'manage_inventory',
      'manage_purchases',
      'manage_grn',
      'manage_issues',
      'manage_returns',
      'manage_projects',
      'view_reports',
      'view_settings',
    ],
  },
  [ROLES.VIEWER]: {
    name: 'Viewer',
    description: 'Read-only access to dashboard',
    permissions: [
      'view_dashboard',
      
    ],
  },
}

/**
 * Check if a user has a specific permission
 * @param {string} userRole - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
export function hasPermission(userRole, permission) {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  return rolePermissions ? rolePermissions.permissions.includes(permission) : false
}

/**
 * Check if a user's role is higher or equal to a required role
 * @param {string} userRole - The user's role
 * @param {string} requiredRole - The required role
 * @returns {boolean}
 */
export function hasRoleOrHigher(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}

/**
 * Get role display name
 * @param {string} role - The role key
 * @returns {string}
 */
export function getRoleName(role) {
  return ROLE_PERMISSIONS[role]?.name || role
}

/**
 * Check if user can access a route
 * @param {string} userRole - The user's role
 * @param {string} route - The route path
 * @returns {boolean}
 */
export function canAccessRoute(userRole, route) {
  const routePermissions = {
    '/dashboard': ['view_dashboard'],
    '/purchase-entry': ['manage_purchases'],
    '/grn-management': ['manage_grn'],
    '/issue-item': ['manage_issues'],
    '/returns': ['manage_returns'],
    '/projects': ['manage_projects'],
    '/inventory/opening-stock': ['manage_inventory'],
    '/inventory/all-items': ['manage_inventory'],
    '/user-management': ['manage_users'],
    '/settings': ['view_settings'],
  }

  const requiredPermissions = routePermissions[route]
  if (!requiredPermissions) return true

  return requiredPermissions.some(permission => hasPermission(userRole, permission))
}

/**
 * Validate if a role value is valid
 * @param {string} role - The role to validate
 * @returns {boolean}
 */
export function isValidRole(role) {
  return Object.values(ROLES).includes(role)
}
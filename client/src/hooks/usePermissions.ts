import { useAuth } from "./useAuth";

type Permission = "read" | "write" | "delete" | "admin";
type Role = "founder" | "admin" | "staff" | "customer" | "user";

interface PermissionConfig {
  roles: Role[];
  permissions?: Permission[];
}

export function usePermissions() {
  const { user } = useAuth();
  
  const effectiveRole: Role = (user?.role as Role) ?? (user?.isAdmin ? "admin" : "customer");

  // Permission hierarchy for each role
  const rolePermissions: Record<Role, Permission[]> = {
    founder: ["read", "write", "delete", "admin"],
    admin: ["read", "write", "delete", "admin"],
    staff: ["read", "write"],
    customer: ["read"],
    user: ["read"],
  };

  const hasRole = (...roles: Role[]): boolean => {
    if (!user) return false;
    if (effectiveRole === "founder") return true;
    return roles.includes(effectiveRole);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const userPermissions = rolePermissions[effectiveRole] || [];
    return userPermissions.includes(permission);
  };

  const can = {
    viewUsers: () => hasRole("founder", "admin", "staff"),
    createUser: () => hasRole("founder", "admin"),
    editUser: () => hasRole("founder", "admin"),
    deleteUser: () => hasRole("founder", "admin"),

    viewLicenses: () => hasRole("founder", "admin", "staff"),
    createLicense: () => hasRole("founder", "admin", "staff"),
    editLicense: () => hasRole("founder", "admin", "staff"),
    deleteLicense: () => hasRole("founder", "admin"),

    viewBots: () => hasRole("founder", "admin", "staff"),
    manageBots: () => hasRole("founder", "admin", "staff"),

    viewViolations: () => hasRole("founder", "admin", "staff"),

    viewSettings: () => hasRole("founder", "admin"),
    editSettings: () => hasRole("founder", "admin"),

    viewDocs: () => hasRole("founder", "admin"),
  };

  return {
    user,
    role: effectiveRole,
    hasRole,
    hasPermission,
    can,
  };
}

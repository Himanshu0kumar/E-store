import RolePermission, {
  DEFAULT_ROLE_PERMISSIONS,
} from "@/models/RolePermission";

/**
 * Initialize / Seed default permissions if not already present in the database
 */
export const ensureDefaultPermissions = async () => {
  const roles = ["admin", "manager", "support", "user"];
  for (const roleKey of roles) {
    const existing = await RolePermission.findOne({ role: roleKey });
    if (!existing) {
      const defaultData = DEFAULT_ROLE_PERMISSIONS[roleKey];
      await RolePermission.create(defaultData);
    }
  }
};

/**
 * Fetch all role permissions from the database
 */
export const getAllRolePermissions = async () => {
  await ensureDefaultPermissions();
  const permissions = await RolePermission.find().sort({ role: 1 }).lean();
  return permissions;
};

/**
 * Get permissions matrix for a single role
 */
export const getPermissionsByRole = async (role) => {
  await ensureDefaultPermissions();
  let roleDoc = await RolePermission.findOne({ role }).lean();
  if (!roleDoc && DEFAULT_ROLE_PERMISSIONS[role]) {
    roleDoc = await RolePermission.create(DEFAULT_ROLE_PERMISSIONS[role]);
  }
  return roleDoc;
};

/**
 * Update permissions for a specific role
 */
export const updateRolePermissions = async (role, updatedPermissions, metadata = {}) => {
  if (!role || !updatedPermissions) {
    throw new Error("Role and updated permissions data are required");
  }

  await ensureDefaultPermissions();

  const roleDoc = await RolePermission.findOne({ role });
  if (!roleDoc) {
    throw new Error(`Role "${role}" does not exist`);
  }

  // If super admin, enforce mandatory root protections
  if (role === "admin") {
    updatedPermissions.users = {
      ...updatedPermissions.users,
      view: true,
      manageRoles: true,
    };
    updatedPermissions.settings = {
      ...updatedPermissions.settings,
      view: true,
      edit: true,
    };
  }

  roleDoc.permissions = updatedPermissions;
  if (metadata.description) {
    roleDoc.description = metadata.description;
  }
  if (metadata.displayName) {
    roleDoc.displayName = metadata.displayName;
  }

  await roleDoc.save();
  return roleDoc.toObject();
};

/**
 * Reset permissions for a role (or all roles) back to factory presets
 */
export const resetPermissionsToDefault = async (role = null) => {
  if (role) {
    const defaultData = DEFAULT_ROLE_PERMISSIONS[role];
    if (!defaultData) {
      throw new Error(`No default permissions found for role: ${role}`);
    }
    const updated = await RolePermission.findOneAndUpdate(
      { role },
      { $set: { permissions: defaultData.permissions, description: defaultData.description } },
      { new: true, upsert: true }
    ).lean();
    return updated;
  } else {
    // Reset all
    const roles = ["admin", "manager", "support", "user"];
    const results = [];
    for (const r of roles) {
      const defaultData = DEFAULT_ROLE_PERMISSIONS[r];
      const doc = await RolePermission.findOneAndUpdate(
        { role: r },
        { $set: { permissions: defaultData.permissions, description: defaultData.description } },
        { new: true, upsert: true }
      ).lean();
      results.push(doc);
    }
    return results;
  }
};

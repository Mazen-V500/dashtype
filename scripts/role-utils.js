export function hasAdminRoleFromUserNode(node) {
    const safeNode = node && typeof node === "object" ? node : {};
    const profile = safeNode.profile && typeof safeNode.profile === "object" ? safeNode.profile : {};
    const profileRoles = profile.roles && typeof profile.roles === "object" ? profile.roles : {};
    const nodeRoles = safeNode.roles && typeof safeNode.roles === "object" ? safeNode.roles : {};
    const profileRoleText = String(profile.role || "").toLowerCase();
    const nodeRoleText = String(safeNode.role || "").toLowerCase();

    return Boolean(
        profile.isAdmin === true ||
        safeNode.isAdmin === true ||
        profile.admin === true ||
        safeNode.admin === true ||
        profileRoles.admin === true ||
        profileRoles.isAdmin === true ||
        nodeRoles.admin === true ||
        nodeRoles.isAdmin === true ||
        profileRoles.supervisor === true ||
        nodeRoles.supervisor === true ||
        profileRoleText === "admin" ||
        nodeRoleText === "admin" ||
        profileRoleText === "supervisor" ||
        nodeRoleText === "supervisor"
    );
}

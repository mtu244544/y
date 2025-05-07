const allRoles = {
  user: [],
  admin: ["getUsers", "manageUsers"],
  agent: ["deposit"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};

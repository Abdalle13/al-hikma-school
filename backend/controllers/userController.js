import mongoose from "mongoose";
import User from "../models/userModel.js";

// returns true if the user is referenced by records elsewhere. those collections
// arrive in later phases (attendance, invoices, classes), so for now it is
// always false. when it is true the admin must deactivate instead of delete.
async function hasLinkedData(/* userId */) {
  return false;
}

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /api/users  (admin)
// body: { name, role, password, email?, admissionNo?, phone?, status? }
export async function createUser(req, res, next) {
  try {
    const { name, role, password, phone, status } = req.body;
    let { email, admissionNo } = req.body;

    if (!name || !role || !password) {
      res.status(400);
      throw new Error("Name, role and password are required");
    }
    if (!["Admin", "Teacher", "Parent", "Student"].includes(role)) {
      res.status(400);
      throw new Error("Invalid role");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    if (role === "Student") {
      if (!admissionNo) {
        res.status(400);
        throw new Error("A student needs an admission number");
      }
      email = undefined;
    } else {
      if (!email) {
        res.status(400);
        throw new Error(`A ${role.toLowerCase()} needs an email`);
      }
      admissionNo = undefined;
    }

    if (email && (await User.findOne({ email: email.toLowerCase() }))) {
      res.status(409);
      throw new Error("That email is already in use");
    }
    if (admissionNo && (await User.findOne({ admissionNo: admissionNo.toUpperCase() }))) {
      res.status(409);
      throw new Error("That admission number is already in use");
    }

    const user = await User.create({
      name,
      role,
      password,
      email,
      admissionNo,
      phone,
      status: status === "Inactive" ? "Inactive" : "Active",
      mustChangePassword: true,
    });

    res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("A user with that email or admission number already exists"));
    }
    next(err);
  }
}

// GET /api/users  (admin)
// query: role, status, search, page, limit
export async function listUsers(req, res, next) {
  try {
    const { role, status, search } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const filter = {};
    if (role) {
      const roles = role.split(",").map((r) => r.trim()).filter(Boolean);
      filter.role = roles.length > 1 ? { $in: roles } : roles[0];
    }
    if (status) filter.status = status;
    if (search) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { admissionNo: rx }, { phone: rx }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      users: users.map((u) => u.toSafeJSON()),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id  (admin)
export async function getUser(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid user id");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const payload = { user: user.toSafeJSON() };

    if (user.role === "Parent") {
      const children = await User.find({ role: "Student", "guardians.user": user._id });
      payload.children = children.map((c) => c.toSafeJSON());
    }
    if (user.role === "Student" && user.guardians?.length) {
      const ids = user.guardians.map((g) => g.user);
      const parents = await User.find({ _id: { $in: ids } });
      payload.user.guardians = user.guardians.map((g) => ({
        relation: g.relation,
        user: parents.find((p) => p._id.equals(g.user))?.toSafeJSON() || g.user,
      }));
    }

    res.json(payload);
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/:id  (admin)
// body: any of { name, email, admissionNo, phone, photo, status, password }
export async function updateUser(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid user id");
    }

    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isSelf = user._id.equals(req.user._id);
    const { name, email, admissionNo, phone, photo, status, password } = req.body;

    if (typeof name === "string") user.name = name;
    if (typeof phone === "string") user.phone = phone;
    if (typeof photo === "string") user.photo = photo;

    if (email !== undefined) {
      if (user.role === "Student") {
        res.status(400);
        throw new Error("A student does not use an email");
      }
      const taken = await User.findOne({ email: String(email).toLowerCase(), _id: { $ne: user._id } });
      if (taken) {
        res.status(409);
        throw new Error("That email is already in use");
      }
      user.email = email;
    }

    if (admissionNo !== undefined) {
      if (user.role !== "Student") {
        res.status(400);
        throw new Error("Only a student has an admission number");
      }
      const taken = await User.findOne({
        admissionNo: String(admissionNo).toUpperCase(),
        _id: { $ne: user._id },
      });
      if (taken) {
        res.status(409);
        throw new Error("That admission number is already in use");
      }
      user.admissionNo = admissionNo;
    }

    if (status && status !== user.status) {
      if (isSelf) {
        res.status(400);
        throw new Error("You cannot change the status of your own account");
      }
      user.status = status === "Inactive" ? "Inactive" : "Active";
    }

    // admin resets the password, the user must then change it again
    if (password) {
      if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
      }
      user.password = password;
      user.mustChangePassword = true;
    }

    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409);
      return next(new Error("A user with that email or admission number already exists"));
    }
    next(err);
  }
}

// DELETE /api/users/:id  (admin)
export async function deleteUser(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid user id");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user._id.equals(req.user._id)) {
      res.status(400);
      throw new Error("You cannot delete your own account");
    }

    if (user.role === "Admin") {
      const activeAdmins = await User.countDocuments({ role: "Admin", status: "Active" });
      if (activeAdmins <= 1) {
        res.status(400);
        throw new Error("You cannot delete the last active admin");
      }
    }

    if (await hasLinkedData(user._id)) {
      res.status(409);
      throw new Error("This user has records in the system. Deactivate the account instead of deleting it.");
    }

    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/:id/guardians  (admin)   body: { parentId, relation }
// links a parent account to a student. the link lives only on the student.
export async function addGuardian(req, res, next) {
  try {
    const { parentId, relation } = req.body;
    if (!isValidId(req.params.id) || !isValidId(parentId || "")) {
      res.status(400);
      throw new Error("Invalid student or parent id");
    }

    const [student, parentUser] = await Promise.all([
      User.findById(req.params.id),
      User.findById(parentId),
    ]);

    if (!student || student.role !== "Student") {
      res.status(404);
      throw new Error("Student not found");
    }
    if (!parentUser || parentUser.role !== "Parent") {
      res.status(404);
      throw new Error("Parent not found");
    }

    student.guardians = student.guardians || [];
    if (student.guardians.some((g) => g.user.equals(parentUser._id))) {
      res.status(409);
      throw new Error("That parent is already linked to this student");
    }

    student.guardians.push({ user: parentUser._id, relation: relation || "Guardian" });
    await student.save();

    res.status(201).json({ user: student.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id/guardians/:parentId  (admin)
export async function removeGuardian(req, res, next) {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.params.parentId)) {
      res.status(400);
      throw new Error("Invalid student or parent id");
    }

    const student = await User.findById(req.params.id);
    if (!student || student.role !== "Student") {
      res.status(404);
      throw new Error("Student not found");
    }

    const before = student.guardians?.length || 0;
    student.guardians = (student.guardians || []).filter(
      (g) => !g.user.equals(req.params.parentId)
    );

    if (student.guardians.length === before) {
      res.status(404);
      throw new Error("That parent is not linked to this student");
    }

    await student.save();
    res.json({ user: student.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id/children  (admin, or the parent themselves)
export async function listChildren(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      res.status(400);
      throw new Error("Invalid parent id");
    }

    const isSelf = req.user._id.equals(req.params.id);
    if (req.user.role !== "Admin" && !isSelf) {
      res.status(403);
      throw new Error("You do not have access to this resource");
    }

    const children = await User.find({ role: "Student", "guardians.user": req.params.id });
    res.json({ children: children.map((c) => c.toSafeJSON()) });
  } catch (err) {
    next(err);
  }
}

const { User, Organization } = require('../models');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new user (Employer or Employee)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'EMPLOYEE', organizationName, organizationId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    let finalOrgId = organizationId || null;

    // If Employer registering, create organization
    if (role === 'EMPLOYER') {
      const orgName = (organizationName && organizationName.trim()) || `${name.trim()}'s Workspace`;
      
      // Temporary user placeholder id to be linked
      const newOrg = await Organization.create({
        name: orgName,
        ownerId: new (require('mongoose').Types.ObjectId)(), // updated right after user creation
      });

      finalOrgId = newOrg._id;

      const newUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'EMPLOYER',
        organizationId: finalOrgId,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      });

      // Update organization ownerId
      newOrg.ownerId = newUser._id;
      await newOrg.save();

      const token = generateToken({ id: newUser._id, role: newUser.role });

      return res.status(201).json({
        success: true,
        message: 'Employer account and Organization created successfully.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          organization: {
            id: newOrg._id,
            name: newOrg.name,
          },
        },
      });
    } else {
      // Employee registration
      let org = null;
      if (finalOrgId) {
        org = await Organization.findById(finalOrgId);
      } else {
        // If no organizationId provided, link to the first active organization if available
        org = await Organization.findOne().sort({ createdAt: 1 });
        if (org) finalOrgId = org._id;
      }

      const newUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'EMPLOYEE',
        organizationId: finalOrgId,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      });

      const token = generateToken({ id: newUser._id, role: newUser.role });

      return res.status(201).json({
        success: true,
        message: 'Employee account created successfully.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          organization: org ? { id: org._id, name: org.name } : null,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Select password since select: false in schema
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('organizationId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        organization: user.organizationId
          ? {
              id: user.organizationId._id,
              name: user.organizationId.name,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user session
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('organizationId');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        organization: user.organizationId
          ? {
              id: user.organizationId._id,
              name: user.organizationId.name,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};

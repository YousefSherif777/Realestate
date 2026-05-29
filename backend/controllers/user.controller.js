import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

const isSelf = (req, next, action) => {
  if (req.user.id !== req.params.id) {
    next(errorHandler(401, `You can only ${action} your own account!`));
    return false;
  }
  return true;
};

const sanitizeUser = (user) => {
  const { password, ...rest } = user._doc;
  return rest;
};

export const test = (req, res) => {
  res.json({ message: 'Api route is working!' });
};

export const updateUser = async (req, res, next) => {
  if (!isSelf(req, next, 'update')) return;
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const { username, email, password, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { username, email, password, avatar } },
      { new: true }
    );

    res.status(200).json(sanitizeUser(updatedUser));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!isSelf(req, next, 'delete')) return;
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json({ message: 'User has been deleted!' });
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (!isSelf(req, next, 'view listings for')) return;
  try {
    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found!'));
    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
};
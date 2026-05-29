import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendTokenResponse = (res, user) => {
  const token = generateToken(user._id);
  const { password, ...rest } = user._doc;
  return res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .status(200)
    .json(rest);
};

const generateGoogleUsername = (name) =>
  name.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-4);

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, 'User not found!'));

    const isValidPassword = bcryptjs.compareSync(password, user.password);
    if (!isValidPassword) return next(errorHandler(401, 'Wrong credentials!'));

    return sendTokenResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const { email, name, photo } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendTokenResponse(res, existingUser);

    const generatedPassword =
      Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

    const newUser = new User({
      username: generateGoogleUsername(name),
      email,
      password: hashedPassword,
      avatar: photo,
    });

    await newUser.save();
    return sendTokenResponse(res, newUser);
  } catch (error) {
    next(error);
  }
};

export const signOut = (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json({ message: 'User has been signed out!' });
  } catch (error) {
    next(error);
  }
};
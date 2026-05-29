import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

const findListingById = async (id, next) => {
  const listing = await Listing.findById(id);
  if (!listing) {
    next(errorHandler(404, 'Listing not found!'));
    return null;
  }
  return listing;
};

const isOwner = (req, listing, next, action) => {
  if (req.user.id !== listing.userRef) {
    next(errorHandler(401, `You can only ${action} your own listings!`));
    return false;
  }
  return true;
};

const resolveFlag = (value) =>
  value === undefined || value === 'false' ? { $in: [false, true] } : value;

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await findListingById(req.params.id, next);
    if (!listing) return;
    if (!isOwner(req, listing, next, 'delete')) return;

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Listing has been deleted!' });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await findListingById(req.params.id, next);
    if (!listing) return;
    if (!isOwner(req, listing, next, 'update')) return;

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await findListingById(req.params.id, next);
    if (!listing) return;
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const type =
      req.query.type === undefined || req.query.type === 'all'
        ? { $in: ['sale', 'rent'] }
        : req.query.type;

    const filters = {
      name: { $regex: searchTerm, $options: 'i' },
      offer: resolveFlag(req.query.offer),
      furnished: resolveFlag(req.query.furnished),
      parking: resolveFlag(req.query.parking),
      type,
    };

    const listings = await Listing.find(filters)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
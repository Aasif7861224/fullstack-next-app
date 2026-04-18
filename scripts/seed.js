import bcrypt from "bcryptjs";
import connectDB from "../lib/db.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import { ROLE, PROPERTY_STATUS } from "../lib/constants.js";

async function run() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Property.deleteMany({})]);

  const passwordHash = await bcrypt.hash("password123", 10);

  const [admin, owner, user] = await User.create([
    {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      role: ROLE.ADMIN,
    },
    {
      name: "Owner User",
      email: "owner@example.com",
      passwordHash,
      role: ROLE.OWNER,
    },
    {
      name: "Normal User",
      email: "user@example.com",
      passwordHash,
      role: ROLE.USER,
    },
  ]);

  await Property.create([
    {
      title: "Modern 2BHK Apartment",
      slug: "modern-2bhk-apartment-mumbai",
      location: "Andheri West",
      city: "Mumbai",
      price: 4500000,
      bhk: 2,
      propertyType: "Flat",
      rentOrSell: "Sell",
      description: "Sample approved listing",
      amenities: ["Lift", "Parking", "Security"],
      images: [{ url: "/window.svg", isPrimary: true, altText: "sample image" }],
      ownerId: owner._id,
      status: PROPERTY_STATUS.ACTIVE,
      views: 14,
      isFeatured: true,
      featuredTill: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Commercial Space",
      slug: "commercial-space-pune",
      location: "Baner",
      city: "Pune",
      price: 85000,
      propertyType: "Other",
      rentOrSell: "Rent",
      description: "Sample pending listing",
      images: [{ url: "/window.svg", isPrimary: true, altText: "sample image" }],
      ownerId: owner._id,
      status: PROPERTY_STATUS.PENDING,
      views: 3,
    },
  ]);

  user.savedProperties = [];
  await user.save();

  console.log("Seed complete");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

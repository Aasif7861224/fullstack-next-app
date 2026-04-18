import connectDB from "@/lib/db";
import Property from "@/models/Property";
import Inquiry from "@/models/Inquiry";
import User from "@/models/User";

export async function getUserDashboardData(userId) {
  await connectDB();

  const [myProperties, myInquiries, user] = await Promise.all([
    Property.find({ ownerId: userId, isDeleted: false }).sort({ createdAt: -1 }).limit(10).lean(),
    Inquiry.find({ senderUserId: userId }).sort({ createdAt: -1 }).limit(10).populate("propertyId").lean(),
    User.findById(userId).populate("savedProperties").lean(),
  ]);

  return {
    myProperties,
    myInquiries,
    savedProperties: user?.savedProperties || [],
  };
}

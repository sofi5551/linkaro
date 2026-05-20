import clientPromise from "@/components/auth/config";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("linkaro");

    const subscriptions = await db
      .collection("subscriptions")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            plan: 1,
            subscriptionType: 1,
            subscriptionDate: 1,
            subscriptionEndDate: 1,
            amountPaid: 1,
            paymentMethod: 1,
            dateSubmitted: 1,
            status: 1,

            priority: 1,
            createdAt: 1,
            "user.name": 1,
            "user.email": 1,
            "user.phone": 1,
            "user.category": 1,
            "user.gender": 1,
            "user.address": 1,
            "user.cnic": 1,
            "user.role": 1,
            "user.totalJobs": 1,
            "user.subscriptionStatus": 1,
            "user.badgeSubscriptionStatus": 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

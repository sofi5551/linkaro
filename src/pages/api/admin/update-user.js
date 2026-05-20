import clientPromise from "@/components/auth/config";
import { ObjectId } from "mongodb";
import { sendEmail, registrationVerifiedEmail, registrationUnverifiedEmail } from "@/lib/mailer";

const BLOCKED = [
  "password", "role", "subscriptionStatus", "badgeSubscriptionStatus",
  "totalJobs", "_id", "emailVerified", "provider", "providerId", "createdAt",
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, ...fields } = req.body;
  if (!id) return res.status(400).json({ message: "id is required" });

  try {
    const client = await clientPromise;
    const db = client.db("linkaro");

    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const update = {};

    if (fields.name)   update.name   = fields.name;
    if (fields.gender) update.gender = fields.gender;
    if (fields.cnic)   update.cnic   = fields.cnic;

    if (fields.phone) {
      update.phone = fields.phone.startsWith("+92") ? fields.phone : `+92${fields.phone}`;
    }

    if (fields.street || fields.city || fields.zip) {
      const existing = user.address || {};
      update.address = {
        street: fields.street ?? existing.street ?? "",
        city:   fields.city   ?? existing.city   ?? "",
        zip:    fields.zip    ?? existing.zip    ?? "",
      };
    }

    if (fields.profileImage) update.profileImage = fields.profileImage;
    if (fields.registrationStatus !== undefined && fields.registrationStatus !== null) update.registrationStatus = fields.registrationStatus;

    if (user.role === "provider") {
      if (fields.category)       update.category       = fields.category;
      if (fields.cnicFrontImage) update.cnicFrontImage = fields.cnicFrontImage;
      if (fields.cnicBackImage)  update.cnicBackImage  = fields.cnicBackImage;
    }

    // Remove any blocked fields that may have slipped through
    BLOCKED.forEach((k) => delete update[k]);

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    update.updatedAt = new Date();

    const prevStatus = user.registrationStatus;
    await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: update });

    // Send email if registrationStatus changed
    if (
      "registrationStatus" in update &&
      update.registrationStatus !== prevStatus &&
      user.email
    ) {
      const name = update.name || user.name || "there";
      const html = update.registrationStatus === true
        ? registrationVerifiedEmail(name)
        : registrationUnverifiedEmail(name);
      const subject = update.registrationStatus === true
        ? "Your Linkaro account has been verified"
        : "Your Linkaro verification has been revoked";
      sendEmail({ to: user.email, subject, html }).catch((err) =>
        console.error("Email send error:", err)
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: "50mb" } },
};

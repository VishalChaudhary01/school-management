import { authOptions } from "@/lib/auth_options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const data = await prisma.school.findMany();
      res.status(200).json({
        success: true,
        message: "All School fetched successfully",
        data,
      });
      res.status(200).json({
        success: true,
        message: "All School fetched successfully",
        data,
      });
    } catch (error) {
      console.error("Failed to fetch ", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch schools" });
    }
  } else if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorize User" });
    }
    try {
      const data = req.body;
      const school = await prisma.school.create({
        data: {
          ...data,
          userId: session.user.id,
        },
      });

      res.status(201).json({
        success: true,
        message: "School added successfully",
        data: school,
      });
    } catch (error) {
      console.error("Failed to add school:", error);
      res.status(500).json({ success: false, message: "Failed to add School" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

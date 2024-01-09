import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

export const getMessageSchedule = async (
  senderId: string,
) => {
  try {
    const scheduledMessages = await prisma.scheduler.findMany({
      where: {
        senderId: senderId,
      },
    });

    return scheduledMessages;
  } catch (error) {
    console.error("Error fetching scheduled messages:", error);
    throw error;
  }
};

export const getMyMessageSchedule = async () => {
  try {
    const user = await getCurrentUser()
    const scheduledMessages = await prisma.scheduler.findMany({
      where: {
        senderId: user?.id,
      },
    });

    return scheduledMessages;
  } catch (error) {
    console.error("Error fetching scheduled messages:", error);
    throw error;
  }
}

import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";
import prisma from "@/app/libs/prismadb";
import agenda from "@/app/libs/agenda";
import getUsers from "@/app/actions/getUsers";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const allUsers = await getUsers();
    const body = await request.json();

    const { datetime, members, message } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const receiverIdArray: string[] = [];
    for (let i = 0; i < members.length; i++) {
      receiverIdArray.push(members[i].value);
    }

    const receiverNameArray: string[] = [];
    for (let i = 0; i < members.length; i++) {
      receiverNameArray.push(members[i].label);
    }

    const schedulerEntry = await prisma.scheduler.create({
      data: {
        senderId: currentUser.id,
        receiverId: receiverIdArray,
        receiverName: receiverNameArray,
        time: datetime,
        message: message,
      },
    });

    // Schedule the job with Agenda
    await agenda.start();
    await agenda.schedule(datetime, "send scheduled message", {
      receiverIdArray,
      message,
      currentUserId: currentUser.id,
      currentUserConversationIds: currentUser.conversationIds,
      allUsers,
    });

    await pusherServer.trigger(currentUser.id, "scheduler:new", schedulerEntry);

    return NextResponse.json(schedulerEntry);
  } catch (error) {
    console.log(error, "ERROR_MESSAGES");
    return new NextResponse("Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const messageSchedules = await prisma.scheduler.findMany({
      where: {
        senderId: currentUser?.id,
      },
    });

    const responseData = {
      userInfo: currentUser,
      messageSchedules: messageSchedules,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.log(error, "ERROR_MESSAGES");
    return new NextResponse("Error", { status: 500 });
  }
}

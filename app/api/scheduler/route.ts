import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from '@/app/libs/pusher';
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();

    const { datetime, members, message } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const receiverIdArray:String[] = []
    for (let i = 0; i < members.length; i++) {
      receiverIdArray.push(members[i].value)
    }

    const receiverNameArray:String[] = []
    for (let i = 0; i < members.length; i++) {
      receiverNameArray.push(members[i].label)
    }

    const schedulerEntry = await prisma.scheduler.create({
      data: {
        senderId: currentUser.id,
        receiverId: receiverIdArray,
        receiverName: receiverNameArray,
        time: datetime,
        message: message
      },
    });

    await pusherServer.trigger(currentUser.id, 'scheduler:new', schedulerEntry);

    return NextResponse.json(schedulerEntry);
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES');
    return new NextResponse('Error', { status: 500 });
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
    }

    return NextResponse.json(responseData);
  }
  catch (error) {
    console.log(error, 'ERROR_MESSAGES');
    return new NextResponse('Error', { status: 500 });
  }
}


    // const updateScheduler = await prisma.scheduler.update({
    //     where: {
    //         id: messageId
    //     },
    //     data: {
    //         message: message,
    //         time: time,
    //         receiverId: receiverId,
    //     }
    // })

    // if(!updateScheduler) {

    //     await pusherServer.trigger(senderId, 'scheduler:new', schedulerEntry);
    // } else {
    //     await pusherServer.trigger(senderId, 'scheduler:update', updateScheduler);
    // }
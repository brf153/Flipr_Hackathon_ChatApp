import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from '@/app/libs/pusher';
import prisma from "@/app/libs/prismadb";
import getUsers from "@/app/actions/getUsers";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const allUsers = await getUsers();
    const body = await request.json();

    const { datetime, members, message } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const receiverIdArray: String[] = []
    for (let i = 0; i < members.length; i++) {
      receiverIdArray.push(members[i].value)
    }

    const receiverNameArray: String[] = []
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

    // Implement your scheduling logic here
    // For simplicity, let's assume the scheduled time is in the future
    const now = new Date();
    const scheduledDate = new Date(datetime);

    // Calculate the delay until the scheduled time
    const delayMillis = scheduledDate.getTime() - now.getTime();

    // Schedule a message to be sent after the specified delay
    setTimeout(async () => {
      for (const receiverId of receiverIdArray) {



        let conversationId: any = [];
        // To get the conversationId
        for (const id of receiverIdArray) {
          for (const user of allUsers) {
            if (user.id === id) {
              for (const receivedUserConversationId of user.conversationIds) {
                for (const currentUserConversationId of currentUser.conversationIds) {
                  if (receivedUserConversationId === currentUserConversationId) {
                    conversationId.push(currentUserConversationId)

                  }
                }
              }
            }
          }
        }

        
        console.log(conversationId, 'CONVERSATION_ID')

        // To create message
        for(const id of conversationId) {
            // Create a new message
        const newMessage = await prisma.message.create({
          include: {
            seen: true,
            sender: true
          },
          data: {
            body: message,
            conversation: {
              connect: { id: conversationId }
            },
            sender: {
              connect: { id: currentUser.id }
            }
          },
        });

        // Notify the conversation about the new message
        await pusherServer.trigger(conversationId, 'messages:new', newMessage);

        // Update user conversations with the latest message
        const updatedConversation = await prisma.conversation.update({
          where: {
            id: conversationId
          },
          data: {
            lastMessageAt: new Date(),
            messages: {
              connect: {
                id: newMessage.id
              }
            }
          },
          include: {
            users: true,
            messages: {
              include: {
                seen: true
              }
            }
          }
        });


        const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

        const conversationUpdatePayload = {
          id: conversationId,
          messages: [lastMessage],
        };

        currentUser.conversationIds.forEach(async (userConversation) => {
          if (userConversation === conversationId) {
            await pusherServer.trigger(userConversation, 'conversation:update', conversationUpdatePayload);
          }
          else {
            console.log("Conversation Id not found!")
          }
        });

        }

      }
    }, delayMillis);

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


        //     const matchingConversationId = receiverIdArray
        //   .flatMap(id =>
        //     allUsers
        //       .filter(user => user.id === id)
        //       .flatMap(user =>
        //         user.conversationIds.filter(conversation =>
        //           currentUser.conversationIds.includes(conversation)
        //         )
        //       )
        //   )[0];

        // // If there's a matching conversationId, use it; otherwise, handle the case where it's not found.
        // const conversationId = matchingConversationId || /* default value or error handling */;
import Agenda from 'agenda';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set in agenda.ts');
}

const agenda = new Agenda({
  db: { address: process.env.DATABASE_URL }
});

export default agenda;

// --- Add job definition for scheduled message sending ---
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

agenda.define('send scheduled message', async (job: import('agenda').Job) => {
  const { receiverIdArray, message, currentUserId, currentUserConversationIds, allUsers } = job.attrs.data;

  let conversationId = [];
  for (const id of receiverIdArray) {
    for (const user of allUsers) {
      if (user.id === id) {
        for (const receivedUserConversationId of user.conversationIds) {
          for (const currentUserConversationId of currentUserConversationIds) {
            if (receivedUserConversationId === currentUserConversationId) {
              conversationId.push(currentUserConversationId);
            }
          }
        }
      }
    }
  }

  for (const id of conversationId) {
    const newMessage = await prisma.message.create({
      include: {
        seen: true,
        sender: true
      },
      data: {
        body: message,
        conversation: {
          connect: { id: id }
        },
        sender: {
          connect: { id: currentUserId }
        }
      },
    });

    await pusherServer.trigger(id, 'messages:new', newMessage);

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: id
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
      id: id,
      messages: [lastMessage],
    };

    currentUserConversationIds.forEach(async (userConversation: string) => {
      if (userConversation === id) {
        await pusherServer.trigger(userConversation, 'conversation:update', conversationUpdatePayload);
      }
    });
  }
});
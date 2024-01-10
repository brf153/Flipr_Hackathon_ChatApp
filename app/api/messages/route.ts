import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from '@/app/libs/pusher'
import prisma from "@/app/libs/prismadb";

import { promisify } from 'util';
import zlib from 'zlib';

export async function POST(
  request: Request,
) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const {
      message,
      image,
      conversationId,
      dataType
    } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if(dataType === 'audio') {

      const inflateAsync = promisify(zlib.inflate);

const CHUNK_SIZE = 1024; // Set your desired chunk size

let receivedChunks: { [index: number]: string } = {};

// Handle incoming chunks from Pusher
const handleIncomingChunks = (data: any) => {
  const { chunk, index, totalChunks } = JSON.parse(data);

  receivedChunks[index] = chunk;

  if (Object.keys(receivedChunks).length === totalChunks) {
    // All chunks received, reconstruct the original blob
    const originalBlob = reconstructOriginalBlob(totalChunks);
    // Further processing or return the original blob as needed
    console.log('Original Blob:', originalBlob);
  }
};

// Reconstruct the original blob from received chunks
const reconstructOriginalBlob = (totalChunks: number): string => {
  let originalString = '';

  for (let i = 0; i < totalChunks; i++) {
    originalString += receivedChunks[i];
  }

  return originalString;
};
    }

    const newMessage = await prisma.message.create({
      include: {
        seen: true,
        sender: true
      },
      data: {
        body: message,
        image: image,
        conversation: {
          connect: { id: conversationId }
        },
        sender: {
          connect: { id: currentUser.id }
        },
        seen: {
          connect: {
            id: currentUser.id
          }
        },
      }
    });

    
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

    await pusherServer.trigger(conversationId, 'messages:new', newMessage);

    const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, 'conversation:update', {
        id: conversationId,
        messages: [lastMessage]
      });
    });

    return NextResponse.json(newMessage)
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES')
    return new NextResponse('Error', { status: 500 });
  }
}
import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";
import prisma from "@/app/libs/prismadb";
import agenda from "@/app/libs/agenda";
import getUsers from "@/app/actions/getUsers";

export async function POST(request: Request) {
  try {
    console.log('[POST] Schedule API called');
    const currentUser = await getCurrentUser();
    if (!currentUser?.id || !currentUser?.email) {
      return new Response('Unauthorized: User not authenticated', { status: 401 });
    }

    let allUsers;
    try {
      allUsers = await getUsers();
    } catch (err) {
      return new Response('Failed to fetch users', { status: 500 });
    }

    let body;
    try {
      body = await request.json();
      console.log('[POST] Request body parsed:', body);
    } catch (err) {
      console.error('[POST] Error parsing request body:', err);
      return new Response('Invalid JSON body', { status: 400 });
    }

    const { datetime, members = [], message } = body;
    console.log('[POST] Extracted fields:', { datetime, members, message });
    if (!datetime || !message || members.length === 0) {
      return new Response('Invalid input: datetime, message, and members are required', { status: 400 });
    }

    type Member = { value: string; label: string };
    const receiverIdArray = (members as Member[]).map((m: Member) => m.value);
    const receiverNameArray = (members as Member[]).map((m: Member) => m.label);
    console.log('[POST] Receiver arrays:', { receiverIdArray, receiverNameArray });

    const backendUrl = process.env.SERVER_URL
      ? `${process.env.SERVER_URL}/schedule`
      : 'http://localhost:4000/schedule';

    console.log('[POST] Backend URL:', backendUrl);

    let res;
    try {
      const payload = {
        receiverIdArray,
        receiverNameArray,
        message,
        currentUserId: currentUser.id,
        currentUserConversationIds: currentUser.conversationIds,
        allUsers,
        datetime,
      };
      console.log('[POST] Sending payload to backend:', payload);
      res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('[POST] Backend response status:', res.status);
    } catch (err) {
      console.error('[POST] Error connecting to backend:', err);
      return new Response('Failed to connect to backend service', { status: 502 });
    }

    if (!res.ok) {
      let errorText = 'Failed to schedule message';
      try {
        errorText = await res.text();
        console.warn('[POST] Backend error response:', errorText);
      } catch (err) {
        console.error('[POST] Error reading backend error response:', err);
      }
      return new Response(errorText, { status: res.status });
    }

    let result;
    try {
      result = await res.json();
      console.log('[POST] Backend response JSON:', result);
    } catch (err) {
      console.error('[POST] Error parsing backend response:', err);
      return new Response('Invalid response from backend', { status: 502 });
    }

    console.log('[POST] Schedule message successfully processed');
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[POST] Unexpected error in schedule POST:', error);
    return new Response('Internal Server Error', { status: 500 });
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

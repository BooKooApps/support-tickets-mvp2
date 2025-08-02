import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToWebsocket } from '@/lib/websocket';
import { verifyUser } from '@/lib/authentication';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    const { username, userId, companyId } = await verifyUser(experienceId);

    const body = await request.json();
    const { isTyping } = body;

    if (typeof isTyping !== 'boolean') {
      return NextResponse.json(
        { error: 'isTyping must be a boolean' },
        { status: 400 }
      );
    }

    const type = isTyping ? 'USER_TYPING' : 'USER_STOP_TYPING';

    await sendMessageToWebsocket({
      message: {
        username: username,
        userId: userId,
      },
      ticketId,
      experienceId,
      companyId: companyId,
      type,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling typing event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

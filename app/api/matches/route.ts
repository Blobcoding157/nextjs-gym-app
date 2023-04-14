import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addMatch } from '../../../database/matches';

const userSchema = z.object({
  userRequestingId: z.number(),
  userPendingId: z.number(),
  isRequested: z.boolean(),
  isAccepted: z.boolean(),
  isBlocked: z.boolean(),
});

export type RegisterResponseBodyPost =
  | {
      errors: { message: string }[];
    }
  | {
      match: {
        userRequestingId: string;
        userPendingId: string;
        isRequested: boolean;
        isAccepted: boolean;
        isBlocked: boolean;
      };
    };

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RegisterResponseBodyPost>> {
  // Validating the data
  const body = await request.json();
  const result = userSchema.safeParse(body);

  if (!result.success) {
    // inside the if statement, result.error.issues there is more information about what is allowing you to create more specific error messages
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  // create the match
  const newMatch = await addMatch(
    result.data.userRequestingId,
    result.data.userPendingId,
    result.data.isRequested,
    result.data.isAccepted,
    result.data.isBlocked,
  );

  if (!newMatch) {
    return NextResponse.json(
      { errors: [{ message: 'event creation failed' }] },
      { status: 500 },
    );
  }
  // return the new username
  return NextResponse.json({
    match: {
      userRequestingId: newMatch.userRequestingId,
      userPendingId: newMatch.userPendingId,
      isRequested: newMatch.isRequested,
      isAccepted: newMatch.isAccepted,
      isBlocked: newMatch.isBlocked,
    },
  });
}

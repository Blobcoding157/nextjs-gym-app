// import { Pool } from 'pg';
import { cache } from 'react';
import { sql } from './connect';

// const pool = new Pool({
//   user: process.env.PGUSERNAME,
//   password: process.env.PGPASSWORD,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
// });
export type PendingRequests = {
  id: number;
  passwordHash: string;
  mail: string;
  age: number;
  mobile: string;
  favouriteGym: string | null;
  isShredding: boolean;
  isBulking: boolean;
  isExperienced: boolean;
  profilePicture: string;
};

export type Blocked = Array<Blocked>;

type Matches = {
  userRequestingId: string;
  userPendingId: string;
  isRequested: boolean;
  isAccepted: boolean;
  isBlocked: boolean;
};

export const addMatch = cache(
  async (
    userRequestingId: number,
    userPendingId: number,
    isRequested: boolean,
    isAccepted: boolean,
    isBlocked: boolean,
  ) => {
    const [result] = await sql<Matches[]>`
    INSERT INTO matches (user_requesting_id, user_pending_id, is_pending, is_accepted, is_blocked)
    VALUES (${userRequestingId}, ${userPendingId}, ${isRequested}, ${isAccepted}, ${isBlocked})
    RETURNING true AS success, 'Match added successfully' AS message;
  `;
    return result;
  },
);
export const getMatchesIdByLoggedInUserId = cache(async (userId: number) => {
  const [matches] = await sql<Matches[]>`
    SELECT *
    FROM matches
    WHERE user_requesting_id = ${userId};
  `;
  return matches;
});

export const getUserMatchesFromDatabase = cache(async (userId: number) => {
  const [matches] = await sql<Matches[]>`
    SELECT m.id, m.user_requesting_id, m.user_pending_id,m.is_pending, m.is_accepted
    FROM matches m
    WHERE m.user_requesting_id = ${userId} OR m.user_pending_id = ${userId};
  `;
  console.log('matches:', matches);
  return matches;
});
export const getMatchRequestById = cache(async (userId: number) => {
  const [pendingRequests] = await sql<PendingRequests[]>`
  SELECT
      matches.id,
      users.*
    FROM
      matches
      JOIN users ON matches.user_requesting_id = users.id
    WHERE
      matches.user_pending_id = ${userId};
  `;
  return pendingRequests;
});
export const getAnsweredMatchRequestById = cache(async (userId: number) => {
  const [pendingRequests] = await sql<PendingRequests[]>`
SELECT
  matches.id,
  users.*
FROM
  matches
  JOIN users ON (
    (matches.user_requesting_id = users.id AND matches.user_pending_id != ${userId})
    OR (matches.user_pending_id = users.id AND matches.user_requesting_id != ${userId})
  )
WHERE
  (matches.user_pending_id = ${userId} OR matches.user_requesting_id = ${userId})
  AND matches.is_pending = FALSE;
    `;
  return pendingRequests;
});
export const getPositivelyAnsweredMatchRequestById = cache(
  async (userId: number) => {
    const [matches] = await sql<Matches[]>`
SELECT
  matches.id,
  users.*
FROM
  matches
  JOIN users ON (
    matches.user_requesting_id = users.id
    OR matches.user_pending_id = users.id
  )
WHERE
  (matches.user_pending_id = ${userId} OR matches.user_requesting_id = ${userId})
  AND matches.is_pending = FALSE
  AND matches.is_accepted = TRUE
  AND users.id != ${userId};
  `;
    return matches;
  },
);
export const getNegativelyAnsweredMatchRequestById = cache(
  async (userId: number) => {
    const [matches] = await sql<Matches[]>`
  SELECT
  matches.id,
  users.*
FROM
  matches
  JOIN users ON (
    matches.user_requesting_id = users.id
    OR matches.user_pending_id = users.id
  )
WHERE
  (matches.user_pending_id = ${userId} OR matches.user_requesting_id = ${userId})
  AND matches.is_pending = FALSE
  AND matches.is_accepted = FALSE;
  `;
    return matches;
  },
);
export const getBlockedUsersById = cache(async (userId: number) => {
  const [blocked] = await sql<Blocked[]>`
  SELECT
  matches.id,
  users.*
FROM
  matches
  JOIN users ON (
    matches.user_requesting_id = users.id
    OR matches.user_pending_id = users.id
  )
WHERE
  (matches.user_pending_id = ${userId} OR matches.user_requesting_id = ${userId})
  AND matches.is_blocked = TRUE;

  `;
  return blocked;
});
export const getUnAnsweredMatchRequestById = cache(async (userId: number) => {
  const [pendingRequests] = await sql<PendingRequests[]>`
  SELECT
      matches.id,
      users.*
    FROM
      matches
      JOIN users ON matches.user_requesting_id = users.id
    WHERE
      matches.user_pending_id = ${userId} AND matches.is_pending = TRUE ;
  `;
  return pendingRequests;
});

export type acceptMatchInDatabases = { success: boolean; message: string };

export const acceptMatchInDatabase = cache(
  async (userRequestingId: number, userPendingId: number) => {
    const [query] = await sql<acceptMatchInDatabases[]>`
    UPDATE matches
    SET is_pending = FALSE, is_accepted = TRUE, is_blocked = FALSE
    WHERE user_requesting_id = ${userRequestingId} AND user_pending_id = ${userPendingId}
  `;
    return query;
  },
);
export type denyMatchInDatabases = { success: boolean; message: string };
export const denyMatchInDatabase = cache(
  async (userRequestingId: number, userPendingingId: number) => {
    const [query] = await sql<denyMatchInDatabases[]>`
    UPDATE matches
    SET is_pending = FALSE, is_accepted = FALSE, is_blocked = FALSE
    WHERE user_requesting_id = ${userRequestingId} AND user_pending_id = ${userPendingingId}
  `;
    return query;
  },
);

export type blockMatchInDatabases = { success: boolean; message: string };

export const blockMatchInDatabase = cache(
  async (userRequestingId: number, userPendingingId: number) => {
    const [query] = await sql<blockMatchInDatabases[]>`
    UPDATE matches
    SET is_pending = FALSE, is_accepted = FALSE, is_blocked = TRUE
    WHERE user_requesting_id = ${userRequestingId} AND user_pending_id = ${userPendingingId}
  `;
    return query;
  },
);

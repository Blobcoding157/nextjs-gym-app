export async function up(sql) {
  await sql`
    CREATE TABLE matches (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      user_requesting_id integer REFERENCES users(id) ON DELETE CASCADE,
      user_pending_id integer REFERENCES users(id),
      is_requested BOOLEAN , --NOT NULL DEFAULT true after denied or accepted, it would turn to false, thus the row still exists and the requester cannot send another request.
      is_accepted BOOLEAN
    )
  `;
}

export async function down(sql) {
  await sql`
    DROP TABLE matches
  `;
}

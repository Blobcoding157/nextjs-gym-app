export async function up(sql) {
  await sql`
    CREATE TABLE comments (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      user_id integer REFERENCES users(id) ON DELETE CASCADE,
      match_id integer REFERENCES users(id),
      comment varchar(500) NOT NULL
    )
  `;
}

export async function down(sql) {
  await sql`
    DROP TABLE comments
  `;
}
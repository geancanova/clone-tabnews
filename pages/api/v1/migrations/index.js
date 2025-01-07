import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function status(request, response) {
  const { method } = request;
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient,
    dir: join("infra", "migrations"), // infra/migrations or infra\migrations depending on the OS
    migrationsTable: "pgmigrations",
    direction: "up",
    verbose: true,
    dryRun: true,
  };

  if (method !== "GET" && method !== "POST") {
    response.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  if (method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);
    dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (method === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });

    dbClient.end();

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  }
}

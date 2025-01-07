import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function status(request, response) {
  const { method } = request;
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(method)) {
    return response
      .status(405)
      .json({ message: `Method ${method} not allowed` });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient,
      dir: join("infra", "migrations"), // infra/migrations or infra\migrations depending on the OS
      migrationsTable: "pgmigrations",
      direction: "up",
      verbose: true,
      dryRun: true,
    };

    if (method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}

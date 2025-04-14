const requiredEnvVars = ["PORT", "MONGO_DB_URL"];

/**
 * Function to check and validate environment variables.
 * Logs missing variables and stops execution if any are missing.
 */
function checkEnv() {
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (!missingEnvVars.length) return;

  console.error(
    `[Error]: Missing required environment variables: [${missingEnvVars.join(
      ", "
    )}]`
  );
  process.exit(1);
}

module.exports = checkEnv;

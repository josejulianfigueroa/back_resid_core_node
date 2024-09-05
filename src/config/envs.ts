import 'dotenv/config';
import { get } from 'env-var';

export const envs = {

  PORT: get('PORT').required().asPortNumber(),
  MONGO_URL: get('MONGO_URL').required().asString(),
  MONGO_DB_NAME: get('MONGO_DB_NAME').required().asString(),
  JWT_SEED: get('JWT_SEED').required().asString(),
  MAILER_SERVICE: get('MAILER_SERVICE').required().asString(),
  MAILER_EMAIL: get('MAILER_EMAIL').required().asString(),
  MAILER_SECRET_KEY: get('MAILER_SECRET_KEY').required().asString(),
  WEBSERVICE_URL: get('WEBSERVICE_URL').required().asString(),
  MAILER_SOPORTE: get('MAILER_SOPORTE').required().asString(),
  MAILER_ADMIN_SITE: get('MAILER_ADMIN_SITE').required().asString(),
  PROD: get('PROD').required().asBool(),
  SEND_EMAIL: get('SEND_EMAIL').default('false').asBool(),
  SITE_NAME_URL: get('SITE_NAME_URL').required().asString(),
} 



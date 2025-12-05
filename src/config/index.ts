import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
    connection_string: process.env.CONNECTION_STRING,
    port: process.env.PORT,
    secret_key: process.env.SECRET_KEY
}

export default config;
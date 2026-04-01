#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE project_db;
    CREATE DATABASE projetflow_client_portal;
    GRANT ALL PRIVILEGES ON DATABASE auth_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE project_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE projetflow_client_portal TO $POSTGRES_USER;
EOSQL

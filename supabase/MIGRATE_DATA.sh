#!/bin/bash

# ==================================================
# MIGRATE DATA: Supabase Cloud → Self-hosted
# ==================================================

# SOURCE: Supabase Cloud
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database
SOURCE_HOST="db.YOUR_PROJECT.supabase.co"
SOURCE_PORT="5432"
SOURCE_USER="postgres"
SOURCE_PASS="YOUR_DATABASE_PASSWORD"
SOURCE_DB="postgres"

# TARGET: Self-hosted (Coolify)
TARGET_HOST="db.itera102.cloud"
TARGET_PORT="5432"
TARGET_USER="postgres"
TARGET_PASS="rUjSje6qNEA69mw90uV6ZTaN4kSWPPo4"
TARGET_DB="postgres"

# Tables to migrate (public schema)
TABLES=(
    "profiles"
    "projects"
    "user_api_keys"
    "gommo_credentials"
    "user_global_stats"
    "generated_images_history"
    "dop_prompt_records"
    "dop_model_learnings"
)

echo "=================================================="
echo "  Supabase Data Migration"
echo "=================================================="

# Export data from Cloud
echo "📤 Exporting data from Supabase Cloud..."
PGPASSWORD="$SOURCE_PASS" pg_dump \
    -h "$SOURCE_HOST" \
    -p "$SOURCE_PORT" \
    -U "$SOURCE_USER" \
    -d "$SOURCE_DB" \
    --data-only \
    --no-owner \
    --no-privileges \
    --disable-triggers \
    -t $(IFS=, ; echo "${TABLES[*]/#/-t }") \
    -f supabase_data_backup.sql

if [ $? -ne 0 ]; then
    echo "❌ Export failed!"
    exit 1
fi

echo "✅ Export complete: supabase_data_backup.sql"

# Import to self-hosted
echo "📥 Importing data to Self-hosted Supabase..."
PGPASSWORD="$TARGET_PASS" psql \
    -h "$TARGET_HOST" \
    -p "$TARGET_PORT" \
    -U "$TARGET_USER" \
    -d "$TARGET_DB" \
    -f supabase_data_backup.sql

if [ $? -ne 0 ]; then
    echo "❌ Import failed!"
    exit 1
fi

echo "✅ Import complete!"
echo "=================================================="
echo "  Migration Complete!"
echo "=================================================="


-- Add admin to faculty_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'faculty_role') THEN
        CREATE TYPE public.faculty_role AS ENUM ('admin', 'chairman', 'director', 'hod', 'class_coordinator');
    ELSE
        -- Check if 'admin' already exists in the enum
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'faculty_role')
            AND enumlabel = 'admin'
        ) THEN
            -- Alter the existing enum to add 'admin'
            ALTER TYPE public.faculty_role ADD VALUE IF NOT EXISTS 'admin';
        END IF;
    END IF;
END$$;

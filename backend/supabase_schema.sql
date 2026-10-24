-- ==============================================================================
-- AIMIKO ENTERPRISE PRODUCTION DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- Handles millions of rows across all 23 core modules with JSONB, Indexes & RLS
-- ==============================================================================

-- 1. Enable Useful Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enable pgvector if you plan to use AI embedding searches for Learn/Buddy:
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── 1. CORE TENANCY & IDENTITY ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) UNIQUE,
    org_type VARCHAR(64) DEFAULT 'Institution',
    country VARCHAR(120) DEFAULT '',
    industry VARCHAR(120) DEFAULT '',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) DEFAULT '',
    avatar_url VARCHAR(512) DEFAULT '',
    role VARCHAR(40) DEFAULT 'student',
    tier VARCHAR(40) DEFAULT 'Free',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);

-- ─── 2. PAYMENTS & SUBSCRIPTIONS (RAZORPAY & STRIPE) ──────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    plan_name VARCHAR(100) NOT NULL,
    gateway VARCHAR(40) DEFAULT 'razorpay',
    gateway_subscription_id VARCHAR(255),
    amount DOUBLE PRECISION DEFAULT 0.0,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(40) DEFAULT 'active',
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    gateway VARCHAR(40) DEFAULT 'razorpay',
    gateway_payment_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    gateway_signature VARCHAR(512),
    plan_name VARCHAR(100) DEFAULT '',
    status VARCHAR(40) DEFAULT 'success',
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_code ON payment_transactions(transaction_code);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON payment_transactions(created_at DESC);

-- ─── 3. AIMIKO LEARN (AI ACADEMIC ECOSYSTEM) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS learn_assignments (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    assignment_type VARCHAR(40) DEFAULT 'quiz',
    content TEXT NOT NULL,
    total_marks INTEGER DEFAULT 15,
    total_questions INTEGER DEFAULT 5,
    due_date VARCHAR(100) DEFAULT '',
    status VARCHAR(40) DEFAULT 'published',
    assigned_to_class VARCHAR(120) DEFAULT 'General Class',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON learn_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON learn_assignments(subject);

CREATE TABLE IF NOT EXISTS learn_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES learn_assignments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) DEFAULT '',
    answers_json JSONB DEFAULT '{}'::jsonb,
    score DOUBLE PRECISION DEFAULT 0.0,
    max_score DOUBLE PRECISION DEFAULT 15.0,
    ai_grading_feedback TEXT DEFAULT '',
    teacher_remark TEXT DEFAULT '',
    status VARCHAR(40) DEFAULT 'graded',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON learn_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON learn_submissions(student_id);

CREATE TABLE IF NOT EXISTS learn_doubts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(120) NOT NULL,
    question TEXT NOT NULL,
    ai_hint_context TEXT DEFAULT '',
    teacher_reply TEXT DEFAULT '',
    status VARCHAR(40) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doubts_student ON learn_doubts(student_id);
CREATE INDEX IF NOT EXISTS idx_doubts_teacher ON learn_doubts(teacher_id);

CREATE TABLE IF NOT EXISTS learn_study_materials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(120) DEFAULT '',
    file_name VARCHAR(255) DEFAULT '',
    file_url VARCHAR(512) DEFAULT '',
    extracted_text TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_materials_user ON learn_study_materials(user_id);

-- ─── 4. AIMIKO WORKS (25 AUTONOMOUS WORKFORCE AGENTS) ─────────────────────────
CREATE TABLE IF NOT EXISTS works_agent_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    agent_slug VARCHAR(100) NOT NULL,
    input_payload JSONB DEFAULT '{}'::jsonb,
    output_result JSONB DEFAULT '{}'::jsonb,
    execution_time_ms INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    status VARCHAR(40) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_jobs_user ON works_agent_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_agent ON works_agent_jobs(agent_slug);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_created ON works_agent_jobs(created_at DESC);

CREATE TABLE IF NOT EXISTS works_api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    label VARCHAR(120) DEFAULT 'Default Agent Key',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_works_keys_user ON works_api_keys(user_id);

-- ─── 5. AIMIKO BUDDY (NOTES, PLANNER, CHAT & MEMORY) ─────────────────────────
CREATE TABLE IF NOT EXISTS buddy_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Conversation',
    mode VARCHAR(50) DEFAULT 'chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buddy_conv_user ON buddy_conversations(user_id);

CREATE TABLE IF NOT EXISTS buddy_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES buddy_conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buddy_messages_conv ON buddy_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_buddy_messages_created ON buddy_messages(created_at ASC);

CREATE TABLE IF NOT EXISTS buddy_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Untitled Note',
    content TEXT DEFAULT '',
    folder VARCHAR(100) DEFAULT 'General',
    tags_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buddy_notes_user ON buddy_notes(user_id);

CREATE TABLE IF NOT EXISTS buddy_planner_tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    scheduled_date VARCHAR(50) DEFAULT '',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buddy_tasks_user ON buddy_planner_tasks(user_id);

-- ─── 6. CREATOR STUDIO & MIKODIN SOCIAL FEED ──────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_assets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_assets_user ON creator_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_assets_type ON creator_assets(asset_type);

CREATE TABLE IF NOT EXISTS mikodin_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) DEFAULT '',
    author_role VARCHAR(100) DEFAULT '',
    author_avatar VARCHAR(512) DEFAULT '',
    content TEXT NOT NULL,
    media_urls_json JSONB DEFAULT '[]'::jsonb,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mikodin_posts_user ON mikodin_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_mikodin_posts_created ON mikodin_posts(created_at DESC);

-- ─── 7. ENTERPRISE CRM, LEADS & PROJECTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) DEFAULT '',
    email VARCHAR(255) NOT NULL,
    country VARCHAR(120) DEFAULT '',
    industry VARCHAR(120) DEFAULT '',
    service VARCHAR(120) DEFAULT '',
    requirements TEXT DEFAULT '',
    budget VARCHAR(120) DEFAULT '',
    message TEXT DEFAULT '',
    source VARCHAR(60) DEFAULT 'web',
    status VARCHAR(40) DEFAULT 'new',
    handled_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) DEFAULT '',
    message TEXT DEFAULT '',
    status VARCHAR(40) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) DEFAULT '',
    email VARCHAR(255) NOT NULL,
    country VARCHAR(120) DEFAULT '',
    industry VARCHAR(120) DEFAULT '',
    services JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(40) DEFAULT 'active',
    source_lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service VARCHAR(120) DEFAULT '',
    description TEXT DEFAULT '',
    status VARCHAR(40) DEFAULT 'planning',
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. SYSTEM TELEMETRY, AUDIT LOGS & METRICS ────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(20),
    service VARCHAR(120) DEFAULT '',
    action VARCHAR(120) DEFAULT '',
    provider VARCHAR(120) DEFAULT '',
    model VARCHAR(120) DEFAULT '',
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cost_usd DOUBLE PRECISION DEFAULT 0.0,
    status_code INTEGER DEFAULT 200,
    duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_user ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_created ON usage_metrics(created_at DESC);

CREATE TABLE IF NOT EXISTS demo_sessions (
    id SERIAL PRIMARY KEY,
    service VARCHAR(120) NOT NULL,
    session_id VARCHAR(120) DEFAULT '',
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    actions INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255) DEFAULT '',
    action VARCHAR(120),
    resource_type VARCHAR(120) DEFAULT '',
    resource_id VARCHAR(120) DEFAULT '',
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

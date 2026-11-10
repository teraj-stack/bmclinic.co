-- =============================================================================
-- BMCLINIC.CO — BAZA DANYCH STRONY INTERNETOWEJ I TRENERA AGENTA AI
-- Uwzględnia parametry:
--   1. NavBoost / Craps (goodClicks, badClicks, lastLongestClicks, dwellTime)
--   2. QualityBoost & PageRank_NS (siteAuthority, siteFocusScore, siteRadius, clickDepth)
--   3. E-E-A-T / YMYL (authorEntity, PWZ, originalContentScore, effortScore, clinicalRefs)
--   4. Core Web Vitals (LCP <= 2500ms, INP <= 200ms, CLS <= 0.10)
--   5. AI Overviews / GEO (passageWordCount 130-170 słów, Schema.org JSON-LD, entityDensity)
--   6. Efektywność sprzedaży usług medycznych (Conversion Rate %, CTA Type, Przychód PLN)
-- =============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS medical_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    url_path TEXT NOT NULL UNIQUE,
    service_pillar TEXT NOT NULL,            -- np. 'Proktologia Laserowa', 'Medycyna Estetyczna Hi-Tech', 'Komfort i Nawigacja 3D'
    procedure_title TEXT NOT NULL,
    content_archetype TEXT NOT NULL,         -- np. 'INTERACTIVE_3D_PROCEDURE_MODEL', 'TRANSPARENT_PRICING_CALCULATOR', 'DOCTOR_QA_CASE_STUDY_BEFORE_AFTER', 'SPATIAL_3D_CLINIC_TOUR'
    h1_headline TEXT NOT NULL,
    h2_aio_question TEXT NOT NULL,           -- Pytanie H2 zoptymalizowane pod AI Overviews (GEO)
    aio_direct_answer_passage TEXT NOT NULL, -- Samodzielny blok semantyczny 130-170 słów
    aio_word_count INTEGER NOT NULL,
    
    -- E-E-A-T / YMYL
    lead_physician_name TEXT NOT NULL,       -- np. 'dr n. med. Jan Bujok'
    physician_specialty TEXT NOT NULL,       -- np. 'Chirurg Ogólny, Proktolog'
    pwz_verified INTEGER DEFAULT 1,
    clinical_studies_cited INTEGER DEFAULT 5,
    original_assets_count INTEGER DEFAULT 8, -- Autorskie zdjęcia, modele 3D, wideo z kliniki
    effort_score REAL DEFAULT 92.0,
    
    -- Dane strukturalne i semantyka
    schema_types_json TEXT NOT NULL,         -- JSON array np. ["MedicalClinic","Physician","MedicalProcedure","FAQPage"]
    entity_density_score REAL DEFAULT 90.0,
    
    -- Architektura domeny (PageRank_NS & siteFocusScore)
    click_depth INTEGER DEFAULT 1,           -- Liczba kliknięć od strony głównej bmclinic.co (optymalnie 1)
    site_focus_score REAL DEFAULT 0.96,
    site_radius_delta REAL DEFAULT 0.04,
    
    base_price_pln INTEGER DEFAULT 2800,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_telemetry_and_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL REFERENCES medical_pages(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    good_clicks INTEGER DEFAULT 0,
    bad_clicks INTEGER DEFAULT 0,
    last_longest_clicks INTEGER DEFAULT 0,
    avg_dwell_time_sec REAL DEFAULT 0.0,
    avg_scroll_depth_pct REAL DEFAULT 0.0,
    interactive_3d_or_calc_uses INTEGER DEFAULT 0,
    
    -- Konwersje sprzedaży usług medycznych
    online_bookings INTEGER DEFAULT 0,
    phone_calls INTEGER DEFAULT 0,
    calculator_leads INTEGER DEFAULT 0,
    revenue_pln REAL DEFAULT 0.0,
    
    -- Core Web Vitals
    lcp_ms INTEGER DEFAULT 1380,
    inp_ms INTEGER DEFAULT 64,
    cls_score REAL DEFAULT 0.02,
    ttfb_ms INTEGER DEFAULT 175,
    
    -- Wyliczone wskaźniki dla Agenta AI
    conversion_rate_pct REAL DEFAULT 0.0,
    navboost_good_ratio_pct REAL DEFAULT 0.0,
    composite_google_seo_score REAL DEFAULT 0.0,
    sales_effectiveness_score REAL DEFAULT 0.0,
    agent_rl_reward REAL DEFAULT 0.0,
    agent_learned_insight TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS realtime_patient_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_slug TEXT NOT NULL,
    event_type TEXT NOT NULL,                -- 'GOOD_CLICK', 'BAD_CLICK', '3D_MODEL_INTERACT', 'CALC_SUBMIT', 'BOOKING_CONFIRMED', 'PHONE_CLICK'
    dwell_seconds INTEGER DEFAULT 0,
    revenue_attributed_pln REAL DEFAULT 0.0,
    user_device TEXT DEFAULT 'mobile',
    created_at TEXT DEFAULT (datetime('now'))
);

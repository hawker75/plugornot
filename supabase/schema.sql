-- ============================================================
--  PlugOrNot — Vehicle Database Schema
--  Run this entire file in the Supabase SQL Editor ONLY for
--  a fresh/empty database. For an existing database, jump to
--  the MIGRATION section at the bottom of this file.
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id             BIGSERIAL PRIMARY KEY,
  year           INTEGER      NOT NULL,
  make           VARCHAR(100) NOT NULL,
  model          VARCHAR(100) NOT NULL,
  trim           VARCHAR(200) NOT NULL,
  market         VARCHAR(10)  NOT NULL DEFAULT 'CA',  -- 'CA' | 'US' | 'GLOBAL'
  drivetrain     VARCHAR(10),           -- 'FWD' | 'AWD' | 'RWD' | '4x4'
  fuel_type      VARCHAR(20)  NOT NULL
                   CHECK (fuel_type IN ('gasoline','diesel','hybrid','phev','electric')),

  -- Imperial fuel economy
  city_mpg            NUMERIC(6,2),
  highway_mpg         NUMERIC(6,2),

  -- Metric fuel economy
  city_l100km         NUMERIC(6,2),
  highway_l100km      NUMERIC(6,2),

  -- Electric energy use — imperial (kWh per 100 miles)
  city_kwh_per_100mi      NUMERIC(6,2),
  highway_kwh_per_100mi   NUMERIC(6,2),

  -- Electric energy use — metric (kWh per 100 km)
  -- For PHEVs: stores EV-mode efficiency (used for electric portion of driving)
  city_kwh_per_100km      NUMERIC(6,2),
  highway_kwh_per_100km   NUMERIC(6,2),

  -- PHEV battery-only range in km (compared with commute to split EV vs gas)
  electric_range_km       NUMERIC(6,1),

  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- Prevent duplicate trims per market
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_unique_idx
  ON vehicles (year, make, model, trim, market);

-- Speed up the cascading dropdowns
CREATE INDEX IF NOT EXISTS idx_vehicles_year   ON vehicles (year DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_make   ON vehicles (year, make);
CREATE INDEX IF NOT EXISTS idx_vehicles_model  ON vehicles (year, make, model);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON vehicles;
CREATE POLICY "Public read"
  ON vehicles FOR SELECT
  USING (true);

-- ============================================================
--  Seed data — canonical trim names (no drivetrain in trim)
--  drivetrain stored separately in the drivetrain column
-- ============================================================

INSERT INTO vehicles
  (year, make, model, trim, drivetrain, fuel_type,
   city_mpg, highway_mpg, city_l100km, highway_l100km,
   city_kwh_per_100mi, highway_kwh_per_100mi,
   city_kwh_per_100km, highway_kwh_per_100km,
   electric_range_km)
VALUES

-- ── Toyota RAV4 2025 (gasoline) ────────────────────────────
-- LE/XLE/XLE Premium: FWD base (AWD is a separate option not modelled here)
-- TRD Off-Road, Adventure, Limited: AWD-only
(2025,'Toyota','RAV4','LE',          'FWD','gasoline', 27,35, 8.7,6.7, NULL,NULL,NULL,NULL, NULL),
(2025,'Toyota','RAV4','XLE',         'FWD','gasoline', 27,35, 8.7,6.7, NULL,NULL,NULL,NULL, NULL),
(2025,'Toyota','RAV4','XLE Premium', 'FWD','gasoline', 27,35, 8.7,6.7, NULL,NULL,NULL,NULL, NULL),
(2025,'Toyota','RAV4','TRD Off-Road','AWD','gasoline', 25,32, 9.4,7.4, NULL,NULL,NULL,NULL, NULL),
(2025,'Toyota','RAV4','Adventure',   'AWD','gasoline', 25,32, 9.4,7.4, NULL,NULL,NULL,NULL, NULL),
(2025,'Toyota','RAV4','Limited',     'AWD','gasoline', 27,35, 8.7,6.7, NULL,NULL,NULL,NULL, NULL),

-- ── Toyota RAV4 Prime 2025 (PHEV) — all AWD ────────────────
-- Gas-only L/100km from NRCan. EV range ~68 km (EPA 42 mi).
(2025,'Toyota','RAV4 Prime','SE',          'AWD','phev', 38,35, 6.2,6.7, NULL,NULL,23,NULL, 68),
(2025,'Toyota','RAV4 Prime','XSE',         'AWD','phev', 38,35, 6.2,6.7, NULL,NULL,23,NULL, 68),
(2025,'Toyota','RAV4 Prime','XSE Premium', 'AWD','phev', 38,35, 6.2,6.7, NULL,NULL,23,NULL, 68),

-- ── Honda CR-V 2025 ─────────────────────────────────────────
-- Gasoline: FWD base. Hybrid: Sport=FWD, Sport-L/Touring=AWD
(2025,'Honda','CR-V','LX',            'FWD','gasoline', 28,34, 8.4,6.9, NULL,NULL,NULL,NULL, NULL),
(2025,'Honda','CR-V','EX',            'FWD','gasoline', 28,34, 8.4,6.9, NULL,NULL,NULL,NULL, NULL),
(2025,'Honda','CR-V','EX-L',          'FWD','gasoline', 28,34, 8.4,6.9, NULL,NULL,NULL,NULL, NULL),
(2025,'Honda','CR-V','Sport',         'FWD','gasoline', 28,34, 8.4,6.9, NULL,NULL,NULL,NULL, NULL),
(2025,'Honda','CR-V','Sport Hybrid',  'FWD','hybrid',   42,38, 5.6,6.2, NULL,NULL,NULL,NULL, NULL),
(2025,'Honda','CR-V','Sport-L Hybrid','AWD','hybrid',   42,38, 5.6,6.2, NULL,NULL,NULL,NULL, NULL),
(2025,'Honda','CR-V','Touring Hybrid','AWD','hybrid',   42,38, 5.6,6.2, NULL,NULL,NULL,NULL, NULL),

-- ── Toyota Camry 2025 (hybrid only) — FWD base ─────────────
(2025,'Toyota','Camry','LE',  'FWD','hybrid', 51,53, 4.6,4.4, NULL,NULL,NULL,NULL, NULL),
(2025,'Toyota','Camry','SE',  'FWD','hybrid', 48,52, 4.9,4.5, NULL,NULL,NULL,NULL, NULL),
(2025,'Toyota','Camry','XLE', 'FWD','hybrid', 48,52, 4.9,4.5, NULL,NULL,NULL,NULL, NULL),
(2025,'Toyota','Camry','XSE', 'FWD','hybrid', 48,52, 4.9,4.5, NULL,NULL,NULL,NULL, NULL),

-- ── Tesla Model Y 2025 ──────────────────────────────────────
-- Trim names cleaned: drivetrain stored in drivetrain column
(2025,'Tesla','Model Y','Standard Range','RWD','electric', NULL,NULL,NULL,NULL, 26.5,31.2, 16.5,19.4, NULL),
(2025,'Tesla','Model Y','Long Range',    'AWD','electric', NULL,NULL,NULL,NULL, 24.8,28.6, 15.4,17.8, NULL),
(2025,'Tesla','Model Y','Performance',   'AWD','electric', NULL,NULL,NULL,NULL, 26.0,30.5, 16.2,18.9, NULL),

-- ── Chevrolet Equinox EV 2025 ───────────────────────────────
(2025,'Chevrolet','Equinox EV','1LT','RWD','electric', NULL,NULL,NULL,NULL, 26.0,30.5, 16.2,18.9, NULL),
(2025,'Chevrolet','Equinox EV','2LT','RWD','electric', NULL,NULL,NULL,NULL, 26.0,30.5, 16.2,18.9, NULL),
(2025,'Chevrolet','Equinox EV','3LT','AWD','electric', NULL,NULL,NULL,NULL, 27.5,32.0, 17.1,19.9, NULL),

-- ── Ford Mustang Mach-E 2025 ────────────────────────────────
(2025,'Ford','Mustang Mach-E','Select', 'RWD','electric', NULL,NULL,NULL,NULL, 28.0,32.5, 17.4,20.2, NULL),
(2025,'Ford','Mustang Mach-E','Premium','AWD','electric', NULL,NULL,NULL,NULL, 30.0,34.0, 18.6,21.1, NULL),
(2025,'Ford','Mustang Mach-E','GT',     'AWD','electric', NULL,NULL,NULL,NULL, 31.5,35.5, 19.6,22.1, NULL),

-- ── Hyundai Ioniq 6 2025 ────────────────────────────────────
-- Trim names cleaned (RWD/AWD removed, stored in drivetrain column)
(2025,'Hyundai','Ioniq 6','SE Standard Range', 'RWD','electric', NULL,NULL,NULL,NULL, 25.0,28.0, 15.5,17.4, NULL),
(2025,'Hyundai','Ioniq 6','SEL Long Range',    'RWD','electric', NULL,NULL,NULL,NULL, 22.5,26.0, 14.0,16.2, NULL),
(2025,'Hyundai','Ioniq 6','Limited Long Range','AWD','electric', NULL,NULL,NULL,NULL, 24.5,28.5, 15.2,17.7, NULL),

-- ── Hyundai Tucson 2025 ─────────────────────────────────────
-- Gasoline: FWD base. PHEV: AWD-only. EV range ~53 km (EPA 33 mi).
(2025,'Hyundai','Tucson','SE',                   'FWD','gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL, NULL),
(2025,'Hyundai','Tucson','SEL',                  'FWD','gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL, NULL),
(2025,'Hyundai','Tucson','N Line',               'FWD','gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL, NULL),
(2025,'Hyundai','Tucson','XRT',                  'FWD','gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL, NULL),
(2025,'Hyundai','Tucson','Limited',              'FWD','gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL, NULL),
(2025,'Hyundai','Tucson','Plug-in Hybrid SE',    'AWD','phev',     35,33, 6.7,7.1, NULL,NULL,22,NULL, 53),
(2025,'Hyundai','Tucson','Plug-in Hybrid SEL',   'AWD','phev',     35,33, 6.7,7.1, NULL,NULL,22,NULL, 53),
(2025,'Hyundai','Tucson','Plug-in Hybrid Limited','AWD','phev',    35,33, 6.7,7.1, NULL,NULL,22,NULL, 53)

ON CONFLICT (year, make, model, trim) DO NOTHING;

-- ============================================================
--  MIGRATION — run this block if your table already exists
--  (i.e. it was created before drivetrain was added)
--  Safe to re-run — uses IF NOT EXISTS / explicit WHERE clauses
-- ============================================================

-- 1. Add new columns (no-ops if they already exist)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS market            VARCHAR(10) NOT NULL DEFAULT 'CA';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS drivetrain        VARCHAR(10);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS electric_range_km NUMERIC(6,1);

-- Rebuild unique index to include market
--   (existing rows all get market='CA' via the DEFAULT above)
DROP INDEX IF EXISTS vehicles_unique_idx;
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_unique_idx
  ON vehicles (year, make, model, trim, market);

-- ─────────────────────────────────────────────────────────────
-- 2. Upsert 2026 RAV4 Hybrid (all AWD, confirmed from Toyota
--    Canada 2026 ordering guide page 23)
--    2026 RAV4 is 100% hybrid — no gasoline-only trims.
-- ─────────────────────────────────────────────────────────────
INSERT INTO vehicles
  (year, make, model, trim, drivetrain, fuel_type,
   city_mpg, highway_mpg, city_l100km, highway_l100km,
   city_kwh_per_100mi, highway_kwh_per_100mi,
   city_kwh_per_100km, highway_kwh_per_100km,
   electric_range_km)
VALUES
  (2026,'Toyota','RAV4 Hybrid','LE',                    'AWD','hybrid', 55,47, 5.1,6.0, NULL,NULL,NULL,NULL, NULL),
  (2026,'Toyota','RAV4 Hybrid','XLE',                   'AWD','hybrid', 54,46, 5.2,6.1, NULL,NULL,NULL,NULL, NULL),
  (2026,'Toyota','RAV4 Hybrid','XLE Premium',           'AWD','hybrid', 54,46, 5.2,6.1, NULL,NULL,NULL,NULL, NULL),
  (2026,'Toyota','RAV4 Hybrid','Woodland',              'AWD','hybrid', 50,42, 5.7,6.7, NULL,NULL,NULL,NULL, NULL),
  (2026,'Toyota','RAV4 Hybrid','XSE',                   'AWD','hybrid', 52,45, 5.4,6.3, NULL,NULL,NULL,NULL, NULL),
  (2026,'Toyota','RAV4 Hybrid','XSE Technology Package','AWD','hybrid', 52,45, 5.4,6.3, NULL,NULL,NULL,NULL, NULL),
  (2026,'Toyota','RAV4 Hybrid','Limited',               'AWD','hybrid', 52,45, 5.4,6.3, NULL,NULL,NULL,NULL, NULL)
ON CONFLICT (year, make, model, trim, market) DO UPDATE SET
  drivetrain      = EXCLUDED.drivetrain,
  fuel_type       = EXCLUDED.fuel_type,
  city_mpg        = EXCLUDED.city_mpg,
  highway_mpg     = EXCLUDED.highway_mpg,
  city_l100km     = EXCLUDED.city_l100km,
  highway_l100km  = EXCLUDED.highway_l100km;

-- ─────────────────────────────────────────────────────────────
-- 3. Set electric_range_km and EV efficiency for PHEVs
--    (do this BEFORE cleaning trim names in case old names exist)
-- ─────────────────────────────────────────────────────────────

-- 2026 RAV4 PHEV (confirmed from Toyota Canada PHEV ordering guide page 18)
UPDATE vehicles SET electric_range_km = 89, city_kwh_per_100km = 22
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid'
    AND trim IN ('SE','SE FWD','SE AWD');
UPDATE vehicles SET electric_range_km = 79, city_kwh_per_100km = 22
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid'
    AND trim IN ('GR Sport','GR Sport AWD');
UPDATE vehicles SET electric_range_km = 85, city_kwh_per_100km = 22
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid'
    AND trim IN ('XSE','XSE AWD');
UPDATE vehicles SET electric_range_km = 85, city_kwh_per_100km = 22
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid'
    AND trim IN ('XSE Technology Package','XSE Premium AWD','XSE Technology Package AWD');

-- 2026 RAV4 PHEV gas-only L/100km — estimated (NRCan 2026 not yet published)
UPDATE vehicles SET city_l100km = 7.5, highway_l100km = 7.0
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid'
    AND city_l100km IS NULL;

-- 2025 RAV4 Prime
UPDATE vehicles SET electric_range_km = 68, city_kwh_per_100km = 23
  WHERE make = 'Toyota' AND model = 'RAV4 Prime' AND electric_range_km IS NULL;

-- 2025 Hyundai Tucson PHEV
UPDATE vehicles SET electric_range_km = 53, city_kwh_per_100km = 22
  WHERE make = 'Hyundai' AND model = 'Tucson' AND fuel_type = 'phev'
    AND electric_range_km IS NULL;

-- 3. Set drivetrain BEFORE cleaning trim names (some use old names as identifiers)
-- Tesla Model Y
UPDATE vehicles SET drivetrain = 'RWD'
  WHERE make = 'Tesla' AND model = 'Model Y' AND trim IN ('RWD','Standard Range');
UPDATE vehicles SET drivetrain = 'AWD'
  WHERE make = 'Tesla' AND model = 'Model Y'
    AND trim IN ('Long Range AWD','Long Range','Performance AWD','Performance');

-- Chevrolet Equinox EV
UPDATE vehicles SET drivetrain = 'RWD'
  WHERE make = 'Chevrolet' AND model = 'Equinox EV' AND trim IN ('1LT RWD','2LT RWD','1LT','2LT');
UPDATE vehicles SET drivetrain = 'AWD'
  WHERE make = 'Chevrolet' AND model = 'Equinox EV' AND trim IN ('3LT AWD','3LT');

-- Ford Mustang Mach-E
UPDATE vehicles SET drivetrain = 'RWD'
  WHERE make = 'Ford' AND model = 'Mustang Mach-E' AND trim IN ('Select RWD','Select');
UPDATE vehicles SET drivetrain = 'AWD'
  WHERE make = 'Ford' AND model = 'Mustang Mach-E'
    AND trim IN ('Premium AWD','GT AWD','Premium','GT');

-- Hyundai Ioniq 6
UPDATE vehicles SET drivetrain = 'RWD'
  WHERE make = 'Hyundai' AND model = 'Ioniq 6'
    AND trim IN ('SE RWD Standard Range','SEL RWD Long Range',
                 'SE Standard Range','SEL Long Range');
UPDATE vehicles SET drivetrain = 'AWD'
  WHERE make = 'Hyundai' AND model = 'Ioniq 6'
    AND trim IN ('Limited AWD Long Range','Limited Long Range');

-- 2026 RAV4 PHEV (all AWD per Toyota ordering guide)
UPDATE vehicles SET drivetrain = 'AWD'
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid';

-- 2025 RAV4 Prime (all AWD)
UPDATE vehicles SET drivetrain = 'AWD'
  WHERE make = 'Toyota' AND model = 'RAV4 Prime';

-- Hyundai Tucson PHEV (AWD-only)
UPDATE vehicles SET drivetrain = 'AWD'
  WHERE make = 'Hyundai' AND model = 'Tucson' AND fuel_type = 'phev';

-- Toyota RAV4 gasoline
UPDATE vehicles SET drivetrain = 'FWD'
  WHERE make = 'Toyota' AND model = 'RAV4' AND fuel_type = 'gasoline'
    AND drivetrain IS NULL;
UPDATE vehicles SET drivetrain = 'AWD'
  WHERE make = 'Toyota' AND model = 'RAV4'
    AND trim IN ('TRD Off-Road','Adventure','Limited');

-- Honda CR-V
UPDATE vehicles SET drivetrain = 'FWD'
  WHERE make = 'Honda' AND model = 'CR-V' AND fuel_type = 'gasoline' AND drivetrain IS NULL;
UPDATE vehicles SET drivetrain = 'FWD'
  WHERE make = 'Honda' AND model = 'CR-V' AND trim = 'Sport Hybrid';
UPDATE vehicles SET drivetrain = 'AWD'
  WHERE make = 'Honda' AND model = 'CR-V'
    AND trim IN ('Sport-L Hybrid','Touring Hybrid');

-- Toyota Camry (FWD base)
UPDATE vehicles SET drivetrain = 'FWD'
  WHERE make = 'Toyota' AND model = 'Camry' AND drivetrain IS NULL;

-- Hyundai Tucson gasoline (FWD base)
UPDATE vehicles SET drivetrain = 'FWD'
  WHERE make = 'Hyundai' AND model = 'Tucson' AND fuel_type = 'gasoline'
    AND drivetrain IS NULL;

-- 4. Clean trim names — remove embedded drivetrain text (do this LAST)
-- Tesla Model Y
UPDATE vehicles SET trim = 'Standard Range'
  WHERE make = 'Tesla' AND model = 'Model Y' AND trim = 'RWD';
UPDATE vehicles SET trim = 'Long Range'
  WHERE make = 'Tesla' AND model = 'Model Y' AND trim = 'Long Range AWD';
UPDATE vehicles SET trim = 'Performance'
  WHERE make = 'Tesla' AND model = 'Model Y' AND trim = 'Performance AWD';

-- Chevrolet Equinox EV
UPDATE vehicles SET trim = '1LT' WHERE make = 'Chevrolet' AND model = 'Equinox EV' AND trim = '1LT RWD';
UPDATE vehicles SET trim = '2LT' WHERE make = 'Chevrolet' AND model = 'Equinox EV' AND trim = '2LT RWD';
UPDATE vehicles SET trim = '3LT' WHERE make = 'Chevrolet' AND model = 'Equinox EV' AND trim = '3LT AWD';

-- Ford Mustang Mach-E
UPDATE vehicles SET trim = 'Select'  WHERE make = 'Ford' AND model = 'Mustang Mach-E' AND trim = 'Select RWD';
UPDATE vehicles SET trim = 'Premium' WHERE make = 'Ford' AND model = 'Mustang Mach-E' AND trim = 'Premium AWD';
UPDATE vehicles SET trim = 'GT'      WHERE make = 'Ford' AND model = 'Mustang Mach-E' AND trim = 'GT AWD';

-- Hyundai Ioniq 6
UPDATE vehicles SET trim = 'SE Standard Range'
  WHERE make = 'Hyundai' AND model = 'Ioniq 6' AND trim = 'SE RWD Standard Range';
UPDATE vehicles SET trim = 'SEL Long Range'
  WHERE make = 'Hyundai' AND model = 'Ioniq 6' AND trim = 'SEL RWD Long Range';
UPDATE vehicles SET trim = 'Limited Long Range'
  WHERE make = 'Hyundai' AND model = 'Ioniq 6' AND trim = 'Limited AWD Long Range';

-- 2026 RAV4 PHEV trim cleanup (fix SE FWD→SE and remove AWD from all trims)
UPDATE vehicles SET trim = 'SE'
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid'
    AND trim IN ('SE FWD','SE AWD');
UPDATE vehicles SET trim = 'GR Sport'
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid'
    AND trim = 'GR Sport AWD';
UPDATE vehicles SET trim = 'XSE'
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid'
    AND trim = 'XSE AWD';
UPDATE vehicles SET trim = 'XSE Technology Package'
  WHERE year = 2026 AND make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid'
    AND trim IN ('XSE Premium AWD','XSE Technology Package AWD');

-- ============================================================
--  How to add more vehicles (use the canonical format above):
--
--  INSERT INTO vehicles
--    (year, make, model, trim, drivetrain, fuel_type,
--     city_mpg, highway_mpg, city_l100km, highway_l100km,
--     city_kwh_per_100mi, highway_kwh_per_100mi,
--     city_kwh_per_100km, highway_kwh_per_100km,
--     electric_range_km)
--  VALUES
--    (2026,'Make','Model','Trim','AWD','gasoline', 30,38, 7.8,6.2,
--     NULL,NULL,NULL,NULL, NULL);
--
--  fuel_type options: 'gasoline' | 'diesel' | 'hybrid' | 'phev' | 'electric'
--  For EVs: set MPG/L columns to NULL, fill kWh columns.
--  For PHEVs: fill gas-only MPG/L, set city_kwh_per_100km for EV mode,
--             set electric_range_km.
-- ============================================================

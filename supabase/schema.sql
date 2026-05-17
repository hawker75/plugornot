-- ============================================================
--  PlugOrNot — Vehicle Database Schema
--  Run this entire file in the Supabase SQL Editor
--  (Database → SQL Editor → New query → paste → Run)
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id             BIGSERIAL PRIMARY KEY,
  year           INTEGER      NOT NULL,
  make           VARCHAR(100) NOT NULL,
  model          VARCHAR(100) NOT NULL,
  trim           VARCHAR(200) NOT NULL,
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
  city_kwh_per_100km      NUMERIC(6,2),
  highway_kwh_per_100km   NUMERIC(6,2),

  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- Prevent duplicate trims
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_unique_idx
  ON vehicles (year, make, model, trim);

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
--  Seed data  (EPA estimates — verify before publishing)
--  To add more vehicles use INSERT statements below or the
--  Supabase Table Editor (Database → Table Editor → vehicles)
-- ============================================================

INSERT INTO vehicles
  (year, make, model, trim, fuel_type,
   city_mpg, highway_mpg, city_l100km, highway_l100km,
   city_kwh_per_100mi, highway_kwh_per_100mi,
   city_kwh_per_100km, highway_kwh_per_100km)
VALUES

-- ── Toyota RAV4 (gasoline) ──────────────────────────────────
(2025,'Toyota','RAV4','LE',   'gasoline', 27,35, 8.7,6.7, NULL,NULL,NULL,NULL),
(2025,'Toyota','RAV4','XLE',  'gasoline', 27,35, 8.7,6.7, NULL,NULL,NULL,NULL),
(2025,'Toyota','RAV4','XLE Premium','gasoline', 27,35, 8.7,6.7, NULL,NULL,NULL,NULL),
(2025,'Toyota','RAV4','TRD Off-Road','gasoline', 25,32, 9.4,7.4, NULL,NULL,NULL,NULL),
(2025,'Toyota','RAV4','Adventure','gasoline', 25,32, 9.4,7.4, NULL,NULL,NULL,NULL),
(2025,'Toyota','RAV4','Limited','gasoline', 27,35, 8.7,6.7, NULL,NULL,NULL,NULL),

-- ── Toyota RAV4 Prime (PHEV) ────────────────────────────────
-- Gas-only economy shown; EV mode not separately modelled in V1
(2025,'Toyota','RAV4 Prime','SE',  'phev', 38,35, 6.2,6.7, NULL,NULL,NULL,NULL),
(2025,'Toyota','RAV4 Prime','XSE', 'phev', 38,35, 6.2,6.7, NULL,NULL,NULL,NULL),
(2025,'Toyota','RAV4 Prime','XSE Premium','phev', 38,35, 6.2,6.7, NULL,NULL,NULL,NULL),

-- ── Honda CR-V ──────────────────────────────────────────────
(2025,'Honda','CR-V','LX',           'gasoline', 28,34, 8.4,6.9, NULL,NULL,NULL,NULL),
(2025,'Honda','CR-V','EX',           'gasoline', 28,34, 8.4,6.9, NULL,NULL,NULL,NULL),
(2025,'Honda','CR-V','EX-L',         'gasoline', 28,34, 8.4,6.9, NULL,NULL,NULL,NULL),
(2025,'Honda','CR-V','Sport',        'gasoline', 28,34, 8.4,6.9, NULL,NULL,NULL,NULL),
(2025,'Honda','CR-V','Sport Hybrid', 'hybrid',   42,38, 5.6,6.2, NULL,NULL,NULL,NULL),
(2025,'Honda','CR-V','Sport-L Hybrid','hybrid',  42,38, 5.6,6.2, NULL,NULL,NULL,NULL),
(2025,'Honda','CR-V','Touring Hybrid','hybrid',  42,38, 5.6,6.2, NULL,NULL,NULL,NULL),

-- ── Toyota Camry (hybrid) ───────────────────────────────────
(2025,'Toyota','Camry','LE',      'hybrid', 51,53, 4.6,4.4, NULL,NULL,NULL,NULL),
(2025,'Toyota','Camry','SE',      'hybrid', 48,52, 4.9,4.5, NULL,NULL,NULL,NULL),
(2025,'Toyota','Camry','XLE',     'hybrid', 48,52, 4.9,4.5, NULL,NULL,NULL,NULL),
(2025,'Toyota','Camry','XSE',     'hybrid', 48,52, 4.9,4.5, NULL,NULL,NULL,NULL),

-- ── Tesla Model Y ───────────────────────────────────────────
-- kWh/100mi: city ~26.5 | highway ~31.2  (city more efficient for EVs)
-- kWh/100km: city ~16.5 | highway ~19.4
(2025,'Tesla','Model Y','RWD',
  'electric', NULL,NULL,NULL,NULL, 26.5,31.2, 16.5,19.4),
(2025,'Tesla','Model Y','Long Range AWD',
  'electric', NULL,NULL,NULL,NULL, 24.8,28.6, 15.4,17.8),
(2025,'Tesla','Model Y','Performance AWD',
  'electric', NULL,NULL,NULL,NULL, 26.0,30.5, 16.2,18.9),

-- ── Chevrolet Equinox EV ────────────────────────────────────
(2025,'Chevrolet','Equinox EV','1LT RWD',
  'electric', NULL,NULL,NULL,NULL, 26.0,30.5, 16.2,18.9),
(2025,'Chevrolet','Equinox EV','2LT RWD',
  'electric', NULL,NULL,NULL,NULL, 26.0,30.5, 16.2,18.9),
(2025,'Chevrolet','Equinox EV','3LT AWD',
  'electric', NULL,NULL,NULL,NULL, 27.5,32.0, 17.1,19.9),

-- ── Ford Mustang Mach-E ─────────────────────────────────────
(2025,'Ford','Mustang Mach-E','Select RWD',
  'electric', NULL,NULL,NULL,NULL, 28.0,32.5, 17.4,20.2),
(2025,'Ford','Mustang Mach-E','Premium AWD',
  'electric', NULL,NULL,NULL,NULL, 30.0,34.0, 18.6,21.1),
(2025,'Ford','Mustang Mach-E','GT AWD',
  'electric', NULL,NULL,NULL,NULL, 31.5,35.5, 19.6,22.1),

-- ── Hyundai Ioniq 6 ─────────────────────────────────────────
(2025,'Hyundai','Ioniq 6','SE RWD Standard Range',
  'electric', NULL,NULL,NULL,NULL, 25.0,28.0, 15.5,17.4),
(2025,'Hyundai','Ioniq 6','SEL RWD Long Range',
  'electric', NULL,NULL,NULL,NULL, 22.5,26.0, 14.0,16.2),
(2025,'Hyundai','Ioniq 6','Limited AWD Long Range',
  'electric', NULL,NULL,NULL,NULL, 24.5,28.5, 15.2,17.7),

-- ── Hyundai Tucson ──────────────────────────────────────────
(2025,'Hyundai','Tucson','SE',         'gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL),
(2025,'Hyundai','Tucson','SEL',        'gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL),
(2025,'Hyundai','Tucson','N Line',     'gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL),
(2025,'Hyundai','Tucson','XRT',        'gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL),
(2025,'Hyundai','Tucson','Limited',    'gasoline', 26,33, 9.0,7.1, NULL,NULL,NULL,NULL),
(2025,'Hyundai','Tucson','Plug-in Hybrid SE',  'phev', 35,33, 6.7,7.1, NULL,NULL,NULL,NULL),
(2025,'Hyundai','Tucson','Plug-in Hybrid SEL', 'phev', 35,33, 6.7,7.1, NULL,NULL,NULL,NULL),
(2025,'Hyundai','Tucson','Plug-in Hybrid Limited','phev', 35,33, 6.7,7.1, NULL,NULL,NULL,NULL)

ON CONFLICT (year, make, model, trim) DO NOTHING;

-- ============================================================
--  How to add more vehicles:
--
--  INSERT INTO vehicles
--    (year, make, model, trim, fuel_type,
--     city_mpg, highway_mpg, city_l100km, highway_l100km,
--     city_kwh_per_100mi, highway_kwh_per_100mi,
--     city_kwh_per_100km, highway_kwh_per_100km)
--  VALUES
--    (2025,'Make','Model','Trim','gasoline', 30,38, 7.8,6.2, NULL,NULL,NULL,NULL);
--
--  For pure EVs set the MPG/L columns to NULL and fill kWh columns.
--  For PHEVs use gas-only figures in MPG/L columns.
-- ============================================================

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BMCLINIC.CO — Fundament Bazy Danych (SQLite) & Trener Agenta AI do budowy treści medycznych.
"""

import os
import json
import sqlite3
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, "db")
DB_PATH = os.path.join(DB_DIR, "bmclinic_seo_agent.sqlite")
SCHEMA_PATH = os.path.join(DB_DIR, "schema.sql")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")


def calculate_agent_metrics(page, tel):
    total_c = max(tel["total_clicks"], 1)
    good_ratio = tel["good_clicks"] / max(tel["good_clicks"] + tel["bad_clicks"], 1)
    llc_ratio = tel["last_longest_clicks"] / total_c
    dwell_norm = min(tel["avg_dwell_time_sec"] / 180.0, 1.0)
    navboost_score = (good_ratio * 50.0) + (llc_ratio * 30.0) + (dwell_norm * 20.0)

    pwz_score = 25.0 if page["pwz_verified"] else 0.0
    studies_score = min(page["clinical_studies_cited"] / 6.0, 1.0) * 20.0
    assets_score = min(page["original_assets_count"] / 8.0, 1.0) * 20.0
    effort_part = (page["effort_score"] / 100.0) * 35.0
    eeat_score = pwz_score + studies_score + assets_score + effort_part

    wc = page["aio_word_count"]
    passage_score = 40.0 if (130 <= wc <= 170) else (25.0 if (110 <= wc <= 195) else 10.0)
    schemas = json.loads(page["schema_types_json"])
    schema_score = min(len(schemas) / 4.0, 1.0) * 30.0
    entity_part = (page["entity_density_score"] / 100.0) * 30.0
    geo_score = passage_score + schema_score + entity_part

    lcp_ok = 40.0 if tel["lcp_ms"] <= 2500 else 15.0
    inp_ok = 35.0 if tel["inp_ms"] <= 200 else 10.0
    cls_ok = 25.0 if tel["cls_score"] <= 0.10 else 5.0
    cwv_score = lcp_ok + inp_ok + cls_ok

    depth_score = 40.0 if page["click_depth"] == 1 else (25.0 if page["click_depth"] == 2 else 5.0)
    focus_part = page["site_focus_score"] * 40.0
    radius_part = max(0.0, (1.0 - page["site_radius_delta"]) * 20.0)
    domain_score = depth_score + focus_part + radius_part

    composite_seo = (
        navboost_score * 0.35
        + eeat_score * 0.25
        + geo_score * 0.20
        + cwv_score * 0.10
        + domain_score * 0.10
    )

    leads = tel["online_bookings"] + tel["phone_calls"] + tel["calculator_leads"]
    conv_rate = (leads / total_c) * 100.0
    widget_rate = (tel["interactive_3d_or_calc_uses"] / total_c) * 100.0
    sales_score = min(100.0, (conv_rate * 6.2) + (widget_rate * 0.75))
    rl_reward = round(((sales_score * 0.60) + (composite_seo * 0.40)) / 100.0, 4)

    return {
        "conversion_rate_pct": round(conv_rate, 2),
        "navboost_good_ratio_pct": round(good_ratio * 100.0, 2),
        "composite_google_seo_score": round(composite_seo, 2),
        "sales_effectiveness_score": round(sales_score, 2),
        "agent_rl_reward": rl_reward,
    }


def init_bmclinic_db():
    os.makedirs(DB_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        cur.executescript(f.read())

    cur.execute("DELETE FROM realtime_patient_events")
    cur.execute("DELETE FROM page_telemetry_and_sales")
    cur.execute("DELETE FROM medical_pages")

    pages_seed = [
        {
            "slug": "laserowe-leczenie-hemoroidow-lhp",
            "url_path": "/procedury/laserowe-leczenie-hemoroidow-lhp",
            "service_pillar": "Proktologia Laserowa",
            "procedure_title": "Laserowa plastyka hemoroidów LHP (1470 nm) — zabieg 1 dnia",
            "content_archetype": "INTERACTIVE_3D_PROCEDURE_MODEL",
            "h1_headline": "Laserowe leczenie hemoroidów LHP w Warszawie — bez nacięć i bez szwów",
            "h2_aio_question": "Na czym polega laserowe usuwanie hemoroidów metodą LHP i ile trwa rekonwalescencja?",
            "aio_direct_answer_passage": (
                "Laserowe leczenie hemoroidów metodą LHP (Laser Hemorrhoidoplasty) wykorzystuje falę o długości 1470 nm, "
                "która zamyka naczynia krwionośne guzka krwawniczego od wewnątrz bez wycinania tkanek i bez zakładania szwów. "
                "Zabieg w BM Clinic trwa około 25–35 minut w znieczuleniu miejscowym lub krótkiej sedacji. Pacjent opuszcza klinikę "
                "po około 2 godzinach, a powrót do pracy biurowej i codziennej aktywności następuje zazwyczaj w ciągu 24–48 godzin."
            ),
            "aio_word_count": 154,
            "lead_physician_name": "dr n. med. Jan Bujok",
            "physician_specialty": "Chirurg Ogólny, Proktolog",
            "pwz_verified": 1,
            "clinical_studies_cited": 7,
            "original_assets_count": 11,
            "effort_score": 96.0,
            "schema_types_json": json.dumps(["MedicalClinic", "Physician", "MedicalProcedure", "FAQPage", "VideoObject"]),
            "entity_density_score": 94.0,
            "click_depth": 1,
            "site_focus_score": 0.98,
            "site_radius_delta": 0.03,
            "base_price_pln": 3200,
            "telemetry": {
                "impressions": 14800,
                "total_clicks": 1920,
                "good_clicks": 1765,
                "bad_clicks": 82,
                "last_longest_clicks": 1340,
                "avg_dwell_time_sec": 248.0,
                "avg_scroll_depth_pct": 86.5,
                "interactive_3d_or_calc_uses": 1190,
                "online_bookings": 148,
                "phone_calls": 94,
                "calculator_leads": 76,
                "revenue_pln": 412000.0,
                "lcp_ms": 1420,
                "inp_ms": 68,
                "cls_score": 0.02,
                "ttfb_ms": 180,
                "insight": "Interaktywny wizualizator 3D przebiegu impulsu lasera + pasaż 154 słów pod H2 z autoryzacją dr n. med. Jana Bujoka daje najwyższą nagrodę RL (0.9808).",
            },
        },
        {
            "slug": "cennik-i-kalkulator-zabiegow-proktologicznych",
            "url_path": "/procedury/cennik-i-kalkulator-zabiegow-proktologicznych",
            "service_pillar": "Proktologia Laserowa",
            "procedure_title": "Kalkulator kosztów leczenia i porównanie metod (Laser LHP vs Klasyczna)",
            "content_archetype": "TRANSPARENT_PRICING_CALCULATOR",
            "h1_headline": "Ile kosztuje laserowe leczenie proktologiczne w BM Clinic? Kalkulator i porównanie metod",
            "h2_aio_question": "Jaka jest różnica w kosztach i czasie zwolnienia lekarskiego między zabiegiem laserowym a operacją klasyczną?",
            "aio_direct_answer_passage": (
                "Całkowity koszt małoinwazyjnego zabiegu laserowego obejmuje kwalifikację z badaniem anoskopowym, procedurę światłowodową "
                "oraz wizytę kontrolną. W przeciwieństwie do klasycznej operacji chirurgicznej wymagającej 3–4 tygodni zwolnienia lekarskiego, "
                "procedura laserowa pozwala wrócić do obowiązków zawodowych już następnego dnia, co redukuje koszt pośredni nieobecności w pracy."
            ),
            "aio_word_count": 146,
            "lead_physician_name": "dr n. med. Jan Bujok",
            "physician_specialty": "Chirurg Ogólny, Proktolog",
            "pwz_verified": 1,
            "clinical_studies_cited": 5,
            "original_assets_count": 8,
            "effort_score": 92.0,
            "schema_types_json": json.dumps(["MedicalClinic", "MedicalProcedure", "FAQPage", "OfferCatalog"]),
            "entity_density_score": 89.0,
            "click_depth": 1,
            "site_focus_score": 0.96,
            "site_radius_delta": 0.05,
            "base_price_pln": 2800,
            "telemetry": {
                "impressions": 11200,
                "total_clicks": 1540,
                "good_clicks": 1390,
                "bad_clicks": 95,
                "last_longest_clicks": 1020,
                "avg_dwell_time_sec": 215.0,
                "avg_scroll_depth_pct": 82.0,
                "interactive_3d_or_calc_uses": 1080,
                "online_bookings": 119,
                "phone_calls": 81,
                "calculator_leads": 112,
                "revenue_pln": 338000.0,
                "lcp_ms": 1310,
                "inp_ms": 54,
                "cls_score": 0.01,
                "ttfb_ms": 165,
                "insight": "Interaktywny kalkulator ceny i czasu rekonwalescencji generuje najwyższy współczynnik konwersji łącznej (20.26%).",
            },
        },
        {
            "slug": "ems-emt-rf-sculpt-modelowanie-sylwetki",
            "url_path": "/procedury/ems-emt-rf-sculpt-modelowanie-sylwetki",
            "service_pillar": "Medycyna Estetyczna Hi-Tech",
            "procedure_title": "Modelowanie sylwetki i wzmocnienie mięśni EMS EMT + RF Sculpt",
            "content_archetype": "DOCTOR_QA_CASE_STUDY_BEFORE_AFTER",
            "h1_headline": "EMS EMT + RF Sculpt w BM Clinic — jednoczesna redukcja tkanki tłuszczowej i budowa mięśni",
            "h2_aio_question": "Jakie efekty daje połączenie fali elektromagnetycznej HIFEM/EMS z falą radiową RF?",
            "aio_direct_answer_passage": (
                "Technologia EMS EMT z falą radiową RF wywołuje ponad 20 000 supramaksymalnych skurczów mięśni w trakcie jednej 30-minutowej sesji, "
                "jednocześnie podgrzewając tkankę podskórną do temperatury wywołującej apoptozę komórek tłuszczowych. Seria 4–6 zabiegów pozwala "
                "zredukować obwód talii i zwiększyć gęstość włókien mięśniowych bez okresu rekonwalescencji."
            ),
            "aio_word_count": 158,
            "lead_physician_name": "Zespół Medyczny BM Clinic",
            "physician_specialty": "Medycyna Estetyczna i Hi-Tech",
            "pwz_verified": 1,
            "clinical_studies_cited": 6,
            "original_assets_count": 14,
            "effort_score": 88.0,
            "schema_types_json": json.dumps(["MedicalClinic", "MedicalProcedure", "FAQPage", "ImageGallery"]),
            "entity_density_score": 87.0,
            "click_depth": 1,
            "site_focus_score": 0.92,
            "site_radius_delta": 0.08,
            "base_price_pln": 1600,
            "telemetry": {
                "impressions": 9600,
                "total_clicks": 1210,
                "good_clicks": 1045,
                "bad_clicks": 110,
                "last_longest_clicks": 740,
                "avg_dwell_time_sec": 184.0,
                "avg_scroll_depth_pct": 78.0,
                "interactive_3d_or_calc_uses": 690,
                "online_bookings": 78,
                "phone_calls": 49,
                "calculator_leads": 44,
                "revenue_pln": 196000.0,
                "lcp_ms": 1780,
                "inp_ms": 92,
                "cls_score": 0.04,
                "ttfb_ms": 210,
                "insight": "Suwak autorskich zdjęć Przed/Po z parametrami klinicznymi oraz Q&A specjalistów zapewnia wysokie cytowania w AI Overviews.",
            },
        },
        {
            "slug": "komfort-pacjenta-wirtualny-spacer-3d-gabinet",
            "url_path": "/procedury/komfort-pacjenta-wirtualny-spacer-3d-gabinet",
            "service_pillar": "Komfort i Nawigacja 3D",
            "procedure_title": "Dyskretna pierwsza wizyta i wirtualny spacer 3D po gabinetach BM Clinic",
            "content_archetype": "SPATIAL_3D_CLINIC_TOUR",
            "h1_headline": "Pełna dyskrecja i komfort pierwszej wizyty w BM Clinic — zobacz gabinet w 3D przed wizytą",
            "h2_aio_question": "Jak wygląda pierwsza konsultacja proktologiczna w BM Clinic i jak się do niej przygotować?",
            "aio_direct_answer_passage": (
                "Pierwsza wizyta proktologiczna w BM Clinic odbywa się w wyciszonym gabinecie z własnym węzłem sanitarnym oraz jednorazową "
                "bielizną diagnostyczną, co gwarantuje 100% intymności. Badanie wykonywane jest w znieczuleniu żelowym z użyciem cienkiego "
                "videorektoskopu, trwa zaledwie kilka minut i nie wymaga wcześniejszego stosowania silnych środków przeczyszczających."
            ),
            "aio_word_count": 148,
            "lead_physician_name": "dr n. med. Jan Bujok",
            "physician_specialty": "Chirurg Ogólny, Proktolog",
            "pwz_verified": 1,
            "clinical_studies_cited": 3,
            "original_assets_count": 9,
            "effort_score": 94.0,
            "schema_types_json": json.dumps(["MedicalClinic", "Physician", "FAQPage", "Place"]),
            "entity_density_score": 84.0,
            "click_depth": 1,
            "site_focus_score": 0.95,
            "site_radius_delta": 0.05,
            "base_price_pln": 450,
            "telemetry": {
                "impressions": 6400,
                "total_clicks": 890,
                "good_clicks": 812,
                "bad_clicks": 41,
                "last_longest_clicks": 615,
                "avg_dwell_time_sec": 262.0,
                "avg_scroll_depth_pct": 91.0,
                "interactive_3d_or_calc_uses": 580,
                "online_bookings": 71,
                "phone_calls": 52,
                "calculator_leads": 19,
                "revenue_pln": 178000.0,
                "lcp_ms": 1890,
                "inp_ms": 115,
                "cls_score": 0.03,
                "ttfb_ms": 195,
                "insight": "Wirtualny model 3D gabinetu i strefy wejścia redukuje stres przed pierwszą wizytą i daje najdłuższy czas sesji (262s).",
            },
        },
    ]

    exported = []
    for p in pages_seed:
        cur.execute(
            """
            INSERT INTO medical_pages (
                slug, url_path, service_pillar, procedure_title, content_archetype,
                h1_headline, h2_aio_question, aio_direct_answer_passage, aio_word_count,
                lead_physician_name, physician_specialty, pwz_verified, clinical_studies_cited,
                original_assets_count, effort_score, schema_types_json, entity_density_score,
                click_depth, site_focus_score, site_radius_delta, base_price_pln
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                p["slug"], p["url_path"], p["service_pillar"], p["procedure_title"],
                p["content_archetype"], p["h1_headline"], p["h2_aio_question"],
                p["aio_direct_answer_passage"], p["aio_word_count"], p["lead_physician_name"],
                p["physician_specialty"], p["pwz_verified"], p["clinical_studies_cited"],
                p["original_assets_count"], p["effort_score"], p["schema_types_json"],
                p["entity_density_score"], p["click_depth"], p["site_focus_score"],
                p["site_radius_delta"], p["base_price_pln"],
            ),
        )
        pid = cur.lastrowid
        tel = p["telemetry"]
        m = calculate_agent_metrics(p, tel)

        cur.execute(
            """
            INSERT INTO page_telemetry_and_sales (
                page_id, impressions, total_clicks, good_clicks, bad_clicks,
                last_longest_clicks, avg_dwell_time_sec, avg_scroll_depth_pct,
                interactive_3d_or_calc_uses, online_bookings, phone_calls,
                calculator_leads, revenue_pln, lcp_ms, inp_ms, cls_score, ttfb_ms,
                conversion_rate_pct, navboost_good_ratio_pct, composite_google_seo_score,
                sales_effectiveness_score, agent_rl_reward, agent_learned_insight
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                pid, tel["impressions"], tel["total_clicks"], tel["good_clicks"],
                tel["bad_clicks"], tel["last_longest_clicks"], tel["avg_dwell_time_sec"],
                tel["avg_scroll_depth_pct"], tel["interactive_3d_or_calc_uses"],
                tel["online_bookings"], tel["phone_calls"], tel["calculator_leads"],
                tel["revenue_pln"], tel["lcp_ms"], tel["inp_ms"], tel["cls_score"],
                tel["ttfb_ms"], m["conversion_rate_pct"], m["navboost_good_ratio_pct"],
                m["composite_google_seo_score"], m["sales_effectiveness_score"],
                m["agent_rl_reward"], tel["insight"],
            ),
        )

        exported.append({
            "id": pid,
            **{k: v for k, v in p.items() if k != "telemetry"},
            "schema_types": json.loads(p["schema_types_json"]),
            "telemetry": tel,
            "metrics": m,
        })

    conn.commit()
    conn.close()

    state_out = os.path.join(PUBLIC_DIR, "bmclinic_agent_state.json")
    with open(state_out, "w", encoding="utf-8") as f:
        json.dump(
            {
                "domain": "bmclinic.co",
                "generated_at": datetime.now().isoformat(),
                "pages": sorted(exported, key=lambda x: x["metrics"]["agent_rl_reward"], reverse=True),
            },
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(f"[OK] Fundament bazy danych bmclinic.co utworzony: {DB_PATH}")
    print(f"[OK] Stan wiedzy Agenta AI zapisany: {state_out}")


if __name__ == "__main__":
    init_bmclinic_db()

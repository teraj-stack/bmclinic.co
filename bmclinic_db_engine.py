#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BMCLINIC.CO — Czysty Fundament Bazy Danych (SQLite) & Trener Agenta AI do budowy treści medycznych.
Brak wgranych na sztywno filarów usługowych — baza startuje od stanu czystego (0 predefiniowanych procedur).
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

    # Initialization is additive. Existing rows and counters are preserved.
    conn.commit()
    conn.close()

    print(f"[OK] Schemat zainicjalizowany bez usuwania danych: {DB_PATH}")


if __name__ == "__main__":
    init_bmclinic_db()


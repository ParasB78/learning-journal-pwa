from flask import Flask, request, jsonify, render_template, send_from_directory
import os, json
from datetime import datetime

app = Flask(__name__, template_folder="templates", static_folder="static")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
DATA_FILE = os.path.join(BACKEND_DIR, "reflections.json")

def ensure_file():
    os.makedirs(BACKEND_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump({"reflections": []}, f, indent=2)

def load_data():
    ensure_file()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Ensure correct structure
        if "reflections" not in data or not isinstance(data["reflections"], list):
            data = {"reflections": []}
            save_data(data)
        return data
    except json.JSONDecodeError:
        # If JSON gets corrupted, reset safely
        data = {"reflections": []}
        save_data(data)
        return data

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# ---------- Page routes ----------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/journal")
def journal():
    return render_template("journal.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/projects")
def projects():
    return render_template("projects.html")

# Serve PWA files from root scope (important for SW + manifest)
@app.route("/manifest.json")
def manifest():
    response = send_from_directory(app.static_folder, "manifest.json")
    response.headers["Cache-Control"] = "no-cache"
    return response

@app.route("/sw.js")
def sw():
    response = send_from_directory(app.static_folder, "sw.js")
    response.headers["Cache-Control"] = "no-cache"
    return response

@app.route("/offline")
def offline():
    return render_template("offline.html")


# ---------- API routes (Lab 6 required) ----------
@app.route("/reflections", methods=["GET"])
def get_reflections():
    data = load_data()
    return jsonify(data)

@app.route("/add_reflection", methods=["POST"])
def add_reflection():
    data = load_data()
    reflections = data.get("reflections", [])

    incoming = request.get_json(force=True)  # expects {"content": "..."}
    content = (incoming.get("content") or "").strip()

    if len(content) < 10:
        return jsonify({"error": "Reflection must be at least 10 characters."}), 400

    next_id = (max([r.get("id", 0) for r in reflections]) + 1) if reflections else 1

    new_reflection = {
        "id": next_id,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "content": content
    }

    reflections.append(new_reflection)
    data["reflections"] = reflections
    save_data(data)

    return jsonify(new_reflection), 201

# ---------- Extra feature (backend) ----------
@app.route("/reflections/<int:rid>", methods=["DELETE"])
def delete_reflection(rid):
    data = load_data()
    reflections = data.get("reflections", [])

    new_list = [r for r in reflections if r.get("id") != rid]
    if len(new_list) == len(reflections):
        return jsonify({"error": "Reflection not found"}), 404

    data["reflections"] = new_list
    save_data(data)
    return jsonify({"deleted": rid}), 200

from flask import Flask, render_template, request, redirect, session
from flask_session import Session
from cs50 import SQL
from datetime import datetime

app = Flask(__name__)

app.config["SECRET_KEY"] = "bibintosik_secret_key"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

db = SQL("sqlite:///bibintosik.db")

def init_db():
    db.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            remind_at TEXT,
            is_done INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS family (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            relation TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

init_db()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["GET", "POST"])
def chat():
    if "chat_history" not in session:
        session["chat_history"] = [
            {"role": "assistant", "content": "Привет! Я Бибинтосик. Я рядом. Расскажи, что у тебя на душе?"}
        ]

    if request.method == "POST":
        user_message = request.form.get("message")
        if user_message:
            session["chat_history"].append({"role": "user", "content": user_message})

            # Пока простые ответы. Потом подключим нормальный ИИ
            reply = "Я тебя услышал. Расскажи чуть подробнее, хорошо?"
            if "привет" in user_message.lower():
                reply = "Привет-привет! Рад тебя видеть!"
            elif "как дела" in user_message.lower():
                reply = "У меня всё хорошо, особенно когда мы общаемся. А у тебя как?"
            
            session["chat_history"].append({"role": "assistant", "content": reply})
            session.modified = True

    return render_template("chat.html", messages=session["chat_history"])

@app.route("/reminders")
def reminders():
    return "Раздел Напоминания (скоро)"

@app.route("/notes")
def notes():
    return "Раздел Заметки (скоро)"

@app.route("/family")
def family():
    return "Раздел Семья (скоро)"

@app.route("/tasks")
def tasks():
    return "Раздел Задачи (скоро)"
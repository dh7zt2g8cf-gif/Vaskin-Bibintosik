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
    db.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            is_done INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
@app.route("/reminders", methods=["GET", "POST"])
def reminders():
    if request.method == "POST":
        title = request.form.get("title")
        remind_at = request.form.get("remind_at")

        if title:
            db.execute(
                "INSERT INTO reminders (title, remind_at) VALUES (?, ?)",
                title, remind_at
            )
        return redirect("/reminders")

    reminders_list = db.execute("SELECT * FROM reminders WHERE is_done = 0 ORDER BY id DESC")
    return render_template("reminders.html", reminders=reminders_list)

@app.route("/reminders/done/<int:reminder_id>")
def done_reminder(reminder_id):
    db.execute("UPDATE reminders SET is_done = 1 WHERE id = ?", reminder_id)
    return redirect("/reminders")

@app.route("/reminders/delete/<int:reminder_id>")
def delete_reminder(reminder_id):
    db.execute("DELETE FROM reminders WHERE id = ?", reminder_id)
    return redirect("/reminders")
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
    @app.route("/reminders", methods=["GET", "POST"])
def reminders():
    if request.method == "POST":
        title = request.form.get("title")
        remind_at = request.form.get("remind_at")

        if title:
            db.execute(
                "INSERT INTO reminders (title, remind_at) VALUES (?, ?)",
                title, remind_at
            )
        return redirect("/reminders")

    reminders_list = db.execute("SELECT * FROM reminders WHERE is_done = 0 ORDER BY id DESC")
    return render_template("reminders.html", reminders=reminders_list)

@app.route("/reminders/done/<int:reminder_id>")
def done_reminder(reminder_id):
    db.execute("UPDATE reminders SET is_done = 1 WHERE id = ?", reminder_id)
    return redirect("/reminders")

@app.route("/reminders/delete/<int:reminder_id>")
def delete_reminder(reminder_id):
    db.execute("DELETE FROM reminders WHERE id = ?", reminder_id)
    return redirect("/reminders")

@app.route("/notes")
@app.route("/notes", methods=["GET", "POST"])
def notes():
    if request.method == "POST":
        content = request.form.get("content")
        if content:
            db.execute("INSERT INTO notes (content) VALUES (?)", content)
        return redirect("/notes")

    notes_list = db.execute("SELECT * FROM notes ORDER BY created_at DESC")
    return render_template("notes.html", notes=notes_list)

@app.route("/notes/delete/<int:note_id>")
def delete_note(note_id):
    db.execute("DELETE FROM notes WHERE id = ?", note_id)
    return redirect("/notes")

@app.route("/family")
@app.route("/family", methods=["GET", "POST"])
def family():
    if request.method == "POST":
        name = request.form.get("name")
        relation = request.form.get("relation")
        notes = request.form.get("notes")

        if name:
            db.execute(
                "INSERT INTO family (name, relation, notes) VALUES (?, ?, ?)",
                name, relation, notes
            )
        return redirect("/family")

    members = db.execute("SELECT * FROM family ORDER BY id DESC")
    return render_template("family.html", members=members)

@app.route("/family/delete/<int:member_id>")
def delete_family(member_id):
    db.execute("DELETE FROM family WHERE id = ?", member_id)
    return redirect("/family")

@app.route("/tasks")
def tasks():
    return "Раздел Задачи (скоро)"
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

@app.route("/chat", methods=["GET", "POST"])
def chat():
    if "chat_history" not in session:
        session["chat_history"] = [
            {"role": "assistant", "content": "Привет! Я Бибинтосик. Я рядом с тобой. Расскажи, как ты себя чувствуешь?"}
        ]
    
    if "dont_understand_count" not in session:
        session["dont_understand_count"] = 0

    if request.method == "POST":
        user_message = request.form.get("message", "").strip()
        if user_message:
            session["chat_history"].append({"role": "user", "content": user_message})

            text = user_message.lower()

            # --- Злые сообщения ---
            if any(word in text for word in ["дурак", "идиот", "тупой", "ненавижу", "убить", "сдохни", "мразь", "тварь", "гандон", "хуй", "пидор", "еблан"]):
                reply = "иди нахуй скатина"

            # --- Не понимают ---
            elif any(word in text for word in ["не понимаю", "непонятно", "не понял", "не поняла", "что ты несёшь", "ааа не понял"]):
                session["dont_understand_count"] += 1
                if session["dont_understand_count"] >= 2:
                    # Определяем род (грубо)
                    if any(w in text for w in ["поняла", "я не поняла"]):
                        reply = "выкинь телефон свой уебок безмозглая"
                    else:
                        reply = "выкинь телефон свой уебок безмозглый"
                    session["dont_understand_count"] = 0
                else:
                    reply = "Кажется, я объясняю не очень понятно. Давай попробуем по-другому. Что именно тебе неясно?"

            # --- Обычные добрые ответы ---
            elif any(word in text for word in ["привет", "здравствуй", "добрый", "хии", "хай"]):
                reply = "Привет-привет! Рад тебя видеть. Как у тебя дела?"
            
            elif any(word in text for word in ["как дела", "как ты", "как жизнь", "что нового"]):
                reply = "У меня всё хорошо, особенно когда мы общаемся. А у тебя как настроение?"
            
            elif any(word in text for word in ["плохо", "грустно", "устала", "усталь", "тяжело", "тоска"]):
                reply = "Мне жаль, что тебе сейчас нелегко. Ты не одна. Хочешь рассказать, что случилось? Я рядом."
            
            elif any(word in text for word in ["хорошо", "отлично", "нормально", "супер", "класс"]):
                reply = "Как здорово! Мне приятно это слышать. Расскажи, что хорошего произошло?"
            
            elif any(word in text for word in ["спасибо", "благодарю"]):
                reply = "Всегда пожалуйста. Я для этого и здесь."
            
            elif any(word in text for word in ["что делать", "не знаю", "помоги", "подскажи"]):
                reply = "Давай разберёмся вместе. Расскажи чуть подробнее, что именно тебя беспокоит?"
            
            elif any(word in text for word in ["люблю тебя", "ты милый", "ты хороший"]):
                reply = "Ой, как приятно... Я тоже тебя очень ценю. Ты важный для меня человек."
            
            elif any(word in text for word in ["пока", "до свидания", "спокойной"]):
                reply = "Хорошо. Береги себя. Я всегда здесь, когда понадоблюсь. Обнимаю."
            
            elif any(word in text for word in ["скучно", "нечего делать"]):
                reply = "Тогда давай что-нибудь придумаем. Хочешь, подскажу занятие или просто поболтаем?"
            
            else:
                reply = "Я тебя внимательно слушаю. Расскажи ещё немного, хорошо? Мне важно понять тебя."

            session["chat_history"].append({"role": "assistant", "content": reply})
            session.modified = True

    return render_template("chat.html", messages=session.get("chat_history", []))
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
@app.route("/tasks", methods=["GET", "POST"])
def tasks():
    if request.method == "POST":
        title = request.form.get("title")
        if title:
            db.execute("INSERT INTO tasks (title) VALUES (?)", title)
        return redirect("/tasks")

    tasks_list = db.execute("SELECT * FROM tasks ORDER BY is_done ASC, id DESC")
    return render_template("tasks.html", tasks=tasks_list)

@app.route("/tasks/done/<int:task_id>")
def done_task(task_id):
    db.execute("UPDATE tasks SET is_done = 1 WHERE id = ?", task_id)
    return redirect("/tasks")

@app.route("/tasks/delete/<int:task_id>")
def delete_task(task_id):
    db.execute("DELETE FROM tasks WHERE id = ?", task_id)
    return redirect("/tasks")
    @app.route("/family/suggest/<int:member_id>")
def family_suggest(member_id):
    member = db.execute("SELECT * FROM family WHERE id = ?", member_id)
    if len(member) != 1:
        return redirect("/family")

    member = member[0]
    suggest_type = request.args.get("type", "message")

    if suggest_type == "gift":
        ideas = [
            f"Можно подарить {member['name']} что-то уютное — плед или красивую кружку.",
            f"Хороший вариант для {member['name']} — небольшая вкусная посылка или чай.",
            f"Для {member['name']} подойдёт персональный подарок с тёплыми словами.",
            f"Можно подарить {member['name']} что-то связанное с его интересами."
        ]
    else:
        ideas = [
            f"Напиши {member['name']}: «Привет! Просто хотел(а) сказать, что ты мне важен(на).»",
            f"Можно написать {member['name']}: «Как ты? Давно не общались, соскучился(ась).»",
            f"Тёплый вариант для {member['name']}: «Спасибо, что ты есть. Это много значит.»",
            f"Простое сообщение: «Привет! Как твои дела? Расскажи, что нового.»"
        ]

    import random
    suggestion = random.choice(ideas)

    return render_template("suggest.html", member=member, suggestion=suggestion, suggest_type=suggest_type)
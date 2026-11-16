from flask import Flask, render_template, request, redirect, session
from flask_session import Session
from cs50 import SQL

app = Flask(__name__)

app.config["SECRET_KEY"] = "bibintosik_secret_key"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

db = SQL("sqlite:///bibintosik.db")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["GET", "POST"])
def chat():
    if request.method == "POST":
        message = request.form.get("message")
        # Пока просто заглушка, ИИ добавим позже
        return render_template("chat.html")
    return render_template("chat.html")

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
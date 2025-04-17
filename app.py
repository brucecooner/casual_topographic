import os

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

MAPS_API_KEY = os.environ.get('MAPS_API_KEY', "no_env_key")

# -----------------------------------------------------------------------------
@app.route("/")
def index():
	return render_template('index.html', maps_api_key=MAPS_API_KEY)

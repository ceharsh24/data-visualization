import sys
import os
import sqlite3

import pandas as pd

from flask import Flask, jsonify
from flask import render_template

app = Flask(__name__)
app.static_folder = 'static'

DATABASE = os.path.join(app.root_path, "recruit.db")


def df_fetch(cursor):
    df = pd.DataFrame(cursor.fetchall())
    if not df.empty:
        df.columns = [col[0] for col in cursor.description]
    return df


def query_db(query):

    result_dict = {}

    try:
        connection = sqlite3.connect(DATABASE)

        cursor = connection.cursor()
        cursor.execute(query)
        result_dict = df_fetch(cursor)

    except sqlite3.OperationalError as e:
        print("Db operation error", e)
        result_dict["error"] = str(e)
    except:
        e = sys.exc_info()[0]
        print("An error occurred with the database", e)
        result_dict["error"] = str(e)
    else:
        cursor.close()
        connection.close()

    return result_dict


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/social_media')
def social_media():
    return render_template('social-media.html')


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html', title='404'), 404


@app.route('/api/avg_income', methods=['GET'])
def api_test():

    result_df = query_db(
        "select state, avg(income) as avg_income from customer group by state")
    result_dict = result_df.to_dict('records')
    return jsonify({'data': result_dict})


@app.route('/api/social_media_ad', methods=['POST', 'GET'])
def api_social_media_ad_youtube():
    result_income = query_db(
        "select count(id) as count, avg(income) as income, economic_stability, youtube_user_rank from customer group by economic_stability, youtube_user_rank")
    result_income_dict = result_income.to_dict('records')
    result_youtube_rank = query_db(
        "select DISTINCT(youtube_user_rank) from customer order by youtube_user_rank")
    result_youtube_rank_dict = result_youtube_rank.to_dict('records')
    result_economy_stability = query_db(
        "select DISTINCT(economic_stability) from customer order by economic_stability")
    result_economy_stability_dict = result_economy_stability.to_dict('records')

    result_highest_available = query_db(
        'select max(cnt) as max, min (cnt) as min from (select avg(income) as income, count(id) as cnt, economic_stability, youtube_user_rank from customer group by economic_stability, youtube_user_rank)')
    result_highest_available_dict = result_highest_available.to_dict('records')

    return jsonify({'income': result_income_dict, 'youtubeRank': result_youtube_rank_dict, 'economyStability': result_economy_stability_dict, 'minAndMaxCount': result_highest_available_dict[0]})


if __name__ == '__main__':
    app.run()

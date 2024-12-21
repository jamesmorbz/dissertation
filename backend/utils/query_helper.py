from influxdb_client import InfluxDBClient
from influxdb_client.client.flux_table import TableList
from typing import List
import json
from sqlite3 import Connection


class InfluxHelper:
    def query_influx(influx_client: InfluxDBClient, query: str):
        query_api = influx_client.query_api()
        response: TableList = query_api.query(query)
        return response

    def convert_resp_to_dict(response: TableList, fields: List[str]):
        return json.loads(response.to_json(fields))


class SQLHelper:
    def query_sqlite(sql_client: Connection, query: str):
        cur = sql_client.cursor()
        cur.execute(query)
        return cur.fetchall()

    def update_sqlite(sql_client: Connection, query: str, data):
        cur = sql_client.cursor()
        cur.execute(query, data)
        sql_client.commit()

import requests
from sys import getsizeof
from google.cloud import datastore

client = datastore.Client()

def update_datastore_beauty_facts(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    content = get_updated_csv()

    data = make_entries(content.strip().split("\n"))

    # update_datastore(data)
    batch_update_datastore(data)
    
    request_json = request.get_json()
    if request.args and 'message' in request.args:
        return request.args.get('message')
    elif request_json and 'message' in request_json:
        return request_json['message']
    else:
        return f'Update Successful'


def get_updated_csv():
    URL = "https://world.openbeautyfacts.org/data/en.openbeautyfacts.org.products.csv"
    response = requests.get(URL)
    return response.content.decode("utf-8")


def make_entries(content):
    keys = content[0].strip().replace('"',"").replace(",","").split("\t")

    rows = []
    for row in content[1:]:
        vals = row.strip().replace('"',"").split("\t")
        rows.append(vals)

    entries = []
    for vals in rows:
        entry = {}
        for i in range(0,len(vals)):
            if getsizeof(vals[i]) >= 1500:
                if type(vals[i]) == list:
                    trimmed_vals = []
                    j = 0
                    while getsizeof(trimmed_vals) < 1500:
                        trimmed_vals.append(vals[i][j])
                        j += 1
                    vals[i] = trimmed_vals[:-1]
                else:
                    vals[i] = vals[i][:750]

            if keys[0] != "-":
                if keys[i] == "states":
                    entry[keys[i]] = vals[i]
                elif "," in vals[i] or "_tags" in keys[i]:
                    values = vals[i].split(",")
                    entry[keys[i]] = values if values != [''] else []
                else:
                    entry[keys[i]] = vals[i]
        entries.append(entry)

    return entries


def update_datastore(data):
    inexistent_entities = []
    for item in data:
        updated = False
        with client.transaction():
            query = client.query(kind="BeautyFact")
            query.add_filter("code", "=", item["code"])
            fact = list(query.fetch())
            if fact != []:
                beauty_fact = fact[0]
                keys = list(set(beauty_fact.keys()).intersection(set(item.keys())))
                for key in keys:
                    if str(item[key]) != str(beauty_fact[key]) and not (item[key] == "" and beauty_fact[key] == []):
                        beauty_fact[key] = item[key]
                        updated = True
                if updated:
                    client.put(beauty_fact)
            else:
                inexistent_entities.append(item)

    key = client.key('BeautyFact')
    for item in inexistent_entities:
        fact_entity = datastore.Entity(key)
        fact_entity.update(item)
        with client.transaction():
            client.put(fact_entity)


def batch_update_datastore(data):
    with client.transaction():
        query = client.query(kind="BeautyFact")
        beauty_facts = list(query.fetch())
    updated_entities = []
    inexistent_entities = []
    for item in data:
        found= False
        for fact in beauty_facts:
            updated = False
            if fact['code'] == item["code"]:
                found = True
                keys = list(set(fact.keys()).intersection(set(item.keys())))
                for key in keys:
                    if str(item[key]) != str(fact[key]) and not (item[key] == "" and fact[key] == []):
                        fact[key] = item[key]
                        updated = True
                if updated:
                    updated_entities.append(fact)
                break
        if not found:
            inexistent_entities.append(item)
            
    for i in range(0, len(updated_entities), 500):
        updated_entities_chunk = updated_entities[i:i+500]        
        with client.transaction():
            client.put_multi(updated_entities_chunk)

    key = client.key('BeautyFact')
    to_be_added = []
    for item in inexistent_entities:
        fact_entity = datastore.Entity(key)
        fact_entity.update(item)
        to_be_added.append(fact_entity)

    for i in range(0, len(to_be_added), 500):
        to_be_added_chunk = to_be_added[i:i+500]
        with client.transaction():
            client.put_multi(to_be_added_chunk)

from typing import Union

from google.cloud import datastore
from pymongo import MongoClient


def create_client():
    return datastore.Client.from_service_account_json('cogent-point-345409-616d12d6d695.json')


def add_beauty_fact(client: datastore.Client, beauty_fact_data):
    for attr, value in beauty_fact_data.items():
        if len(str(value)) >= 1500:
            return
    key = client.key('BeautyFact')
    beauty_fact_entity = datastore.Entity(key)

    beauty_fact_entity.update(beauty_fact_data)
    client.put(beauty_fact_entity)
    return beauty_fact_entity.key


def mark_done(client: datastore.Client, beauty_fact_id: Union[str, int]):
    with client.transaction():
        key = client.key("BeautyFact", beauty_fact_id)
        beauty_fact = client.get(key)

        if not beauty_fact:
            raise ValueError(f"Beauty fact {beauty_fact_id} does not exist.")

        beauty_fact["done"] = True

        client.put(beauty_fact)


def list_beauty_facts(client: datastore.Client):
    query = client.query(kind="BeautyFact")

    return list(query.fetch())


def filter_beauty_facts(client: datastore.Client, property_name: str, op: str, value: Union[str, int, bool]):
    query = client.query(kind="BeautyFact")
    query.add_filter(property_name, op, value)

    return list(query.fetch())


def sort_beauty_facts_by_property(client: datastore.Client, property_name: str, is_sorting_ascending: bool):
    query = client.query(kind="BeautyFact")
    if is_sorting_ascending:
        query.order = [property_name]
    else:
        query.order = ["-" + property_name]

    return list(query.fetch())


def delete_beauty_fact(client: datastore.Client, beauty_fact_id: Union[str, int]):
    key = client.key("BeautyFact", beauty_fact_id)
    client.delete(key)


def update_datastore_from_mongodb():
    google_client = create_client()
    mongo_client = MongoClient("localhost", 27017, maxPoolSize=50)
    db = mongo_client.beauty
    collection = db['beauty_facts']
    cursor = list(collection.find({}))
    nr_of_documents = 0
    for document in cursor:
        if nr_of_documents == 20000:
            break
        add_beauty_fact(google_client, document)
        nr_of_documents += 1


# update_datastore_from_mongodb()
client = create_client()
print(sort_beauty_facts_by_property(client, "brands", False))
# beauty_fact_key = add_beauty_fact(client)
# print(beauty_fact_key)
# mark_done(client, 5700433016258560)
# print(list_beauty_facts(client))
# delete_beauty_fact(client, 5700433016258560)

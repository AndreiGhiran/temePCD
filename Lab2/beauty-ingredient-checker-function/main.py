from google.cloud import storage

storage_client = storage.Client()


def check_if_ingredient_list_contains_allergens(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    request_json = request.get_json()
    if not request_json or (request_json and not 'ingredients' in request_json): 
        return f'Please provide the checked ingredient list!' 

    ingredients = remove_spaces_and_make_lowercase(request_json['ingredients'])
    allergens = get_cleaned_up_allergen_names()

    print(ingredients)
    print(allergens)

    allergens_in_ingredients = get_list_intersection(ingredients, allergens)
    if not allergens_in_ingredients:
        return f'No common allergen found here!'
    return 'Allergen(s) found here: ' + str(allergens_in_ingredients) 

def get_cleaned_up_allergen_names():
    allergen_names = get_allergen_names_from_bucket()
    return remove_spaces_and_make_lowercase(allergen_names)

def remove_spaces_and_make_lowercase(list_of_strings): 
    cleaned_up_strings = [] 
    for current_string in list_of_strings:
        cleaned_up_strings.append(current_string.strip().lower())
    return cleaned_up_strings

def get_allergen_names_from_bucket():
    bucket = storage_client.get_bucket('beauty-product-allergens')
    blob = bucket.blob('allergen_names.txt')
    contents = blob.download_as_string()
    decoded_contents = contents.decode('utf-8')
    return decoded_contents.splitlines()

def get_list_intersection(first_list, second_list):
    return list(set(first_list).intersection(set(second_list)))


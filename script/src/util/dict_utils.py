
def is_path(obj: dict, dict_path: str):
    keys = dict_path.split('.')
    for key in keys:
        if key in obj:
            obj = obj[key]
        else:
            return False
    return True
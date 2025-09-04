from src.util.dict_utils import is_path


class TestDictUtils:
    def test_is_path(self):
        dict = {
            "a": {
                "b": {
                    "c": 1
                }
            }
        }
        assert is_path(dict, "a.b.c")
        assert not is_path(dict, "a.b.d")
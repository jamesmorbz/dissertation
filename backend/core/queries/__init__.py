def read_query(file_name: str) -> str:
    with open(f"core/queries/{file_name}", "r") as file:
        return file.read()

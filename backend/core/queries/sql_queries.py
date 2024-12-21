class SQLQueries:
    @staticmethod
    def get_all_hardware_names_query():
        return "SELECT hardware_name FROM device_mappings GROUP BY hardware_name"

    @staticmethod
    def get_device_friendly_name_query(device_name: str):
        return f"SELECT friendly_name FROM device_mappings WHERE hardware_name = '{device_name}' ORDER BY last_updated DESC"

    @staticmethod
    def get_update_device_mapping_query():
        return """
            UPDATE device_mappings 
            SET friendly_name = :friendly_name, 
                tag = :tag, 
                last_updated = :last_updated
            WHERE hardware_name = :hardware_name
        """

    @staticmethod
    def get_insert_device_mapping_query():
        return """
            INSERT INTO device_mappings (hardware_name, friendly_name, tag, last_updated)
            VALUES (:hardware_name, :friendly_name, :tag, :last_updated)
        """

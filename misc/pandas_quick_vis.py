import pandas as pd
import json
import matplotlib.pyplot as plt
import seaborn as sns

def read_data_from_file(filename):
    state_data = []
    sensor_data = []

    with open(filename, 'r') as file:
        for line in file:
            message = json.loads(line.strip())
            topic = message['topic']
            payload = message['payload']
            
            if 'STATE' in topic:
                state_data.append(payload)
            elif 'SENSOR' in topic:
                sensor_data.append(payload)

    state_df = pd.DataFrame(state_data)
    sensor_df = pd.DataFrame(sensor_data)

    return state_df, sensor_df

def plot_data(state_df, sensor_df):
    # Plot Uptime vs Time for state messages
    plt.figure(figsize=(10, 6))
    state_df['Time'] = pd.to_datetime(state_df['Time'])
    plt.plot(state_df['Time'], state_df['UptimeSec'], marker='o', linestyle='-')
    plt.xlabel('Time')
    plt.ylabel('Uptime (seconds)')
    plt.title('Uptime Over Time')
    plt.xticks(rotation=45)
    plt.grid(True)
    plt.show()
    
    # Plot Voltage vs Time for sensor messages
    plt.figure(figsize=(10, 6))
    sensor_df['Time'] = pd.to_datetime(sensor_df['Time'])
    plt.plot(sensor_df['Time'], sensor_df['ENERGY'].apply(lambda x: x['Voltage']), marker='o', linestyle='-', color='r')
    plt.xlabel('Time')
    plt.ylabel('Voltage (V)')
    plt.title('Voltage Over Time')
    plt.xticks(rotation=45)
    plt.grid(True)
    plt.show()

    # Plot Current vs Time for sensor messages
    plt.figure(figsize=(10, 6))
    plt.plot(sensor_df['Time'], sensor_df['ENERGY'].apply(lambda x: x['Power']), marker='o', linestyle='-', color='b')
    plt.xlabel('Time')
    plt.ylabel('Current (A)')
    plt.title('Current Over Time')
    plt.xticks(rotation=45)
    plt.grid(True)
    plt.show()
    
    # Distribution of RSSI values
    plt.figure(figsize=(10, 6))
    sns.histplot(state_df['Wifi'].apply(lambda x: x['RSSI']), kde=True, bins=30)
    plt.xlabel('RSSI')
    plt.ylabel('Frequency')
    plt.title('Distribution of RSSI Values')
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    # Read data from the JSON file
    state_df, sensor_df = read_data_from_file('mqtt_messages.json')
    
    # Plot the data
    plot_data(state_df, sensor_df)

import time
import datetime
import yaml
import random
import logging
from datetime import datetime, timedelta
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

INTERVAL_SECONDS = 10
PROCESS_START_TIME = time.time()

END_DATE = datetime.strptime("21-01-2025", "%d-%m-%Y")
START_DATE = datetime.strptime("01-01-2025", "%d-%m-%Y")

logging.basicConfig(
    format="%(asctime)s %(message)s",
    level=logging.INFO
)

def gen_rand_bool(usage_spike_frequency):
    return random.choices([True, False], weights=[usage_spike_frequency, 100 - usage_spike_frequency], k=1)[0]

def gen_rand_float(low, high):
    return round(random.uniform(low, high), 2)

def write_to_influx(write_api, hardware_name, power, voltage, current, timestamp: datetime):
    point = Point("power") \
        .tag("hardware_name", hardware_name) \
        .tag("source_topic", f"tele/{hardware_name}/SENSOR") \
        .field("power", float(power)) \
        .field("voltage", float(voltage)) \
        .field("current", float(current)) \
        .time(timestamp)
    write_api.write(bucket="usage", record=point)

def write_status_to_influx(write_api, hardware_name, network_name, timestamp, uptime):
    status_point = Point("status") \
        .tag("hardware_name", hardware_name) \
        .tag("source_topic", f"tele/{hardware_name}/STATE") \
        .tag("wifi_name", network_name) \
        .field("uptime", int(uptime)) \
        .field("rssi", random.randint(0, 100)) \
        .field("signal", random.randint(-100, 0)) \
        .field("power", True) \
        .time(timestamp)
    write_api.write(bucket="usage", record=status_point)

def get_usage(mock_plug, usage_config):
    configured_usage = mock_plug["usage"]
    voltage = random.randint(240, 260)
    
    if "usage_spikes" in mock_plug and gen_rand_bool(mock_plug["usage_spikes"]):
        possible_levels = ["HIGH", "MEDIUM", "LOW", "IDLE"]
        possible_levels.remove(configured_usage)
        usage_level = random.choice(possible_levels)
    else:
        usage_level = configured_usage

    match usage_level:
        case "HIGH":
            return (
                random.randint(usage_config["HIGH"]["WATTAGE_MIN"], usage_config["HIGH"]["WATTAGE_MAX"]),
                voltage,
                gen_rand_float(usage_config["HIGH"]["CURRENT_MIN"], usage_config["HIGH"]["CURRENT_MAX"]))
        case "MEDIUM":
            return (
                random.randint(usage_config["MEDIUM"]["WATTAGE_MIN"], usage_config["MEDIUM"]["WATTAGE_MAX"]),
                voltage,
                gen_rand_float(usage_config["MEDIUM"]["CURRENT_MIN"], usage_config["MEDIUM"]["CURRENT_MAX"]))
        case "LOW":
            return (
                random.randint(usage_config["LOW"]["WATTAGE_MIN"], usage_config["LOW"]["WATTAGE_MAX"]),
                voltage,
                gen_rand_float(usage_config["LOW"]["CURRENT_MIN"], usage_config["LOW"]["CURRENT_MAX"]))
        case "IDLE":
            return 0, voltage, gen_rand_float(0, 0.04)
        case _:
            raise Exception("Unknown usage type in plug")

def generate_time_windows(interval='1h', start_date=None, end_date=None):
    """Generate start and end times for each interval between start_date and end_date"""
    if interval == '1h':
        # Align to hours
        start_time = start_date.replace(minute=0, second=0, microsecond=0)
        end_time = end_date.replace(minute=0, second=0, microsecond=0)
        
        windows = []
        current_time = end_time
        while current_time > start_time:
            window_end = current_time
            window_start = window_end - timedelta(hours=1)
            windows.append((window_start, window_end))
            current_time = window_start
    else:  # '1d'
        # Align to days
        start_time = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_time = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        windows = []
        current_time = end_time
        while current_time > start_time:
            window_end = current_time
            window_start = window_end - timedelta(days=1)
            windows.append((window_start, window_end))
            current_time = window_start
    
    return windows

def process_hourly_window(query_api, start_time, end_time):
    """Process a single hourly window"""
    query = f'''
        from(bucket: "metrics")
            |> range(start: {start_time.strftime("%Y-%m-%dT%H:%M:%SZ")}, stop: {end_time.strftime("%Y-%m-%dT%H:%M:%SZ")})
            |> filter(fn: (r) => r["_measurement"] == "power" and r["_field"] == "power")
            |> elapsed()
            |> map(fn: (r) => ({{r with *value: r.*value * (float(v: r.elapsed) / 3600.0)}}))
            |> sum()
            |> to(bucket: "1h-aggregated", timeColumn: "_stop")
    '''
    logging.info(f"Processing hourly window: {start_time} to {end_time}")
    query_api.query(query)

def process_daily_window(query_api, start_time, end_time):
    """Process a single daily window"""
    query = f'''
        from(bucket: "1h-aggregated")
            |> range(start: {start_time.strftime("%Y-%m-%dT%H:%M:%SZ")}, stop: {end_time.strftime("%Y-%m-%dT%H:%M:%SZ")})
            |> sum()
            |> to(bucket: "1d-aggregated", timeColumn: "_stop")
    '''
    logging.info(f"Processing daily window: {start_time} to {end_time}")
    query_api.query(query)

def push_historical_data(client, config, start_date, end_date):
    write_api = client.write_api(write_options=SYNCHRONOUS)
    plugs = config["plugs"]
    usage_config = config["usage"]
    
    total_points = int((end_date - start_date).total_seconds() / INTERVAL_SECONDS)
    points_processed = 0
    
    logging.info(f"Will generate {total_points} data points for {len(plugs)} plugs - Total: {total_points*len(plugs)}")
    
    current_time = start_date

    logging.info(f"Starting data generation from {start_date} to {end_date}...")
    
    while current_time <= end_date:
        for mock_plug in plugs:
            plug_name = mock_plug["name"]
            reliability = mock_plug.get("reliability", 100)
            
            if gen_rand_bool(reliability):
                uptime = int((current_time - start_date).total_seconds())
                
                write_status_to_influx(
                    write_api,
                    plug_name,
                    mock_plug["network_name"],
                    current_time,
                    uptime
                )

                power, voltage, current = get_usage(mock_plug, usage_config)
                write_to_influx(write_api, plug_name, power, voltage, current, current_time)
            else:
                logging.debug(f"{plug_name} didn't write data at {current_time}")

        points_processed += 1
        if points_processed % 100 == 0:
            progress = (points_processed / total_points) * 100
            logging.info(f"Data generation progress: {progress:.2f}% complete")

        current_time += timedelta(seconds=INTERVAL_SECONDS)

def process_aggregations(client, start_date, end_date):
    query_api = client.query_api()
    
    # Process hourly windows
    hourly_windows = generate_time_windows(interval='1h', start_date=start_date, end_date=end_date)
    total_hourly = len(hourly_windows)
    logging.info(f"Starting processing of {total_hourly} hourly windows")
    
    for i, (start, end) in enumerate(hourly_windows, 1):
        try:
            process_hourly_window(query_api, start, end)
            if i % 24 == 0:  # Log progress every 24 hours
                logging.info(f"Completed {i}/{total_hourly} hourly windows ({(i/total_hourly)*100:.1f}%)")
        except Exception as e:
            logging.error(f"Error processing hourly window {start} to {end}: {str(e)}")

    # Process daily windows
    daily_windows = generate_time_windows(interval='1d', start_date=start_date, end_date=end_date)
    total_daily = len(daily_windows)
    logging.info(f"Starting processing of {total_daily} daily windows")
    
    for i, (start, end) in enumerate(daily_windows, 1):
        try:
            process_daily_window(query_api, start, end)
            logging.info(f"Completed {i}/{total_daily} daily windows ({(i/total_daily)*100:.1f}%)")
        except Exception as e:
            logging.error(f"Error processing daily window {start} to {end}: {str(e)}")

def main():
    try:
        # Validate dates
        if END_DATE <= START_DATE:
            logging.error("End date must be after start date")
            return

        # Load configuration
        config = yaml.safe_load(open("config.yaml"))
        
        # Initialize InfluxDB client
        client = InfluxDBClient(
            url="http://influx:8086",
            token="my-secret-token",
            org="diss",
            debug=False
        )
        
        # Generate historical data
        push_historical_data(client, config, START_DATE, END_DATE)
        logging.info("Historical data generation complete!")
        
        # Process aggregations
        process_aggregations(client, START_DATE, END_DATE)
        logging.info("Data aggregation complete!")
        
    except Exception as e:
        logging.error(f"Error in main execution: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
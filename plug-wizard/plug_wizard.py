import pywifi
import time
import requests
import logging

from pywifi import const
from pywifi.iface import Interface


def set_logging(log_filename: str):
    pywifi.set_loglevel(logging.ERROR)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(), logging.FileHandler(log_filename)],
    )


def get_connected_interface():
    wifi = pywifi.PyWiFi()
    interfaces = wifi.interfaces()

    for iface in interfaces:
        if iface.status() == const.IFACE_CONNECTED:
            logging.info(f"Connected to Wi-Fi on interface: {iface.name()}")
            return iface

    logging.error("No connected Wi-Fi interface found!")
    return None


def scan_wifi() -> list[Interface]:
    iface = get_connected_interface()
    iface.scan()
    time.sleep(3)  # iface.scan() is not blocking, sadly.

    available_networks = iface.scan_results()
    matching_networks: list[Interface] = []
    processed_ssid = set()

    for network in available_networks:
        network_name: str = network.ssid
        if network_name in processed_ssid:
            logging.info(
                f"Already processed SSID - {network_name} - Network has MAPs / Multi Band (5/2.4GHz) - Skipping..."
            )
            continue
        if network_name.startswith(TASMOTA_REGEX):
            matching_networks.append(network)
            logging.info(
                f"Adding Network - {network_name} as it matches pattern: {TASMOTA_REGEX}*"
            )
        else:
            logging.info(
                f"Ignoring Network - {network_name} as it doesn't match pattern: {TASMOTA_REGEX}*"
            )
        processed_ssid.add(network_name)

    return matching_networks


def connect_to_network(network_name: str, password: str = "") -> bool:
    iface = get_connected_interface()

    profile = pywifi.Profile()
    profile.ssid = network_name
    profile.auth = const.AUTH_ALG_OPEN

    if password:
        profile.akm.append(const.AKM_TYPE_WPA2PSK)  # WPA2/Personal
        profile.cipher = const.CIPHER_TYPE_CCMP  # Encryption method
        profile.key = password  # Set the password
    else:
        profile.akm.append(const.AKM_TYPE_NONE)

    iface.add_network_profile(profile)
    iface.connect(profile)

    retry_count = 0
    while iface.status() != const.IFACE_CONNECTED:
        logging.info(
            f"Not Connected to {profile.ssid} - Current status: {iface.status()}"
        )
        if retry_count >= CONNECTION_RETRY_COUNT:
            logging.info(
                f"Still not Connected to {profile.ssid} after {retry_count}. Current status: {iface.status()}. Will try again later..."
            )
            return False
        time.sleep(1)
        retry_count += 1
    logging.info(f"Connected to {profile.ssid} - Current status: {iface.status()}")

    return True


def configure_smart_device():
    local_tastmota_ui = requests.get(f"{DEFAULT_TASTMOTA_LOCAL_WEB_UI_ADDRESS}/")
    if local_tastmota_ui.status_code == 200:
        logging.info("Smart Device Local Web UI Runnning")
        configure_wifi = requests.get(
            f"{DEFAULT_TASTMOTA_LOCAL_WEB_UI_ADDRESS}/wi?s1={NETWORK_SSID}&p1={NETWORK_PASSWORD}&save="
        )
        if configure_wifi.status_code == 200:
            logging.info("Smart Device Configured")
        else:
            logging.error(
                f"Smart Device Configuration Failed - Status Code: {configure_wifi.status_code} "
            )
    else:
        logging.info("Smart Device is not Running Yet...")


def reconnect_to_wifi(ssid, password):
    logging.info(f"Reconnecting to original network: {ssid}")
    connected = connect_to_network(ssid, password)
    if connected:
        logging.info(f"Successfully reconnected to original network - {ssid}")
    else:
        logging.info(f"Couldn't successfully reconnect to original network - {ssid}")
    return connected


def post_metrics():
    logging.info(
        "TODO - Implement Metrics Feedback Loop - Confirming Plugs are Configured!"
    )
    return


def main():
    logging.info("START - Configuration Process")
    while True:
        logging.info("START of Config Loop")
        try:
            networks: list[Interface] = scan_wifi()

            if networks:
                for network in networks:
                    network_name: str = network.ssid
                    try:
                        connected = connect_to_network(network_name)
                        if connected:
                            configure_smart_device()
                        else:
                            logging.info(
                                f"Couldn't successfully connect to network - {network_name}"
                            )
                    except Exception as e:
                        logging.exception(
                            f"Error while trying to configure - {network_name} - Error: {e}"
                        )
            else:
                logging.info("No smart devices that require configuring!")

            reconnected = reconnect_to_wifi(NETWORK_SSID, NETWORK_PASSWORD)
            if reconnected:
                post_metrics()
            else:
                logging.error(
                    "Unable to post metrics as not connected back to home network..."
                )

            logging.info(f"END of Config Loop - Sleeping for {INTERVAL_SECONDS}")
            time.sleep(INTERVAL_SECONDS)
        except Exception as e:
            logging.exception(f"Unknown Error - Error: {e}")


if __name__ == "__main__":
    CONNECTION_RETRY_COUNT = 10
    INTERVAL_SECONDS = 20
    TASMOTA_REGEX = "tasmota-"
    DEFAULT_TASTMOTA_LOCAL_WEB_UI_ADDRESS = "http://192.168.4.1"
    NETWORK_SSID = "HUAWEI_H112_1DB0"
    NETWORK_PASSWORD = "rJhHgdmLD8iFTeDL"

    LOG_FILE = "auto_plug_configurer.log"
    set_logging(LOG_FILE)

    main()

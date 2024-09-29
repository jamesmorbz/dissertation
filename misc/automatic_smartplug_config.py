import pywifi
from pywifi import const
from pywifi.iface import Interface
import time
import requests
import logging


def scan_wifi() -> list[Interface]:
    wifi = pywifi.PyWiFi()
    iface = wifi.interfaces()[0]
    iface.scan()
    time.sleep(3)
    
    available_networks = iface.scan_results()
    matching_networks: list[Interface] = []
    
    for network in available_networks:
        network_name: str = network.ssid
        if network_name.startswith(TASMOTA_REGEX):
            matching_networks.append(network)
        else:  
            logging.info(f"Ignoring Network - {network_name} as it doesn't match pattern {TASMOTA_REGEX}*")           
    
    return matching_networks

def connect_to_smart_device(network):
    wifi = pywifi.PyWiFi()
    iface = wifi.interfaces()[0]
    
    profile = pywifi.Profile()
    profile.ssid = network.ssid
    profile.auth = const.AUTH_ALG_OPEN 
    profile.akm.append(const.AKM_TYPE_NONE)
    
    iface.remove_all_network_profiles()
    iface.add_network_profile(profile)
    
    iface.connect(profile)
    
    retry_count = 0
    while iface.status() != const.IFACE_CONNECTED:
        logging.info(f"Not Connected to {profile.ssid} - Current status: {iface.status()}")
        if retry_count >= RETRY_COUNT:
            
            logging.info(f"Still not Connected to {profile.ssid} after {retry_count}. Current status: {iface.status()}. Will try again later...")
            return False
        time.sleep(1)
        
        retry_count += 1
    logging.info(f"Connected to {profile.ssid} - Current status: {iface.status()}")
    
    return True
    
def configure_smart_device():
    url = 'TBC'
    return 

def reconnect_to_wifi(ssid, password):
    print(f"Reconnecting to original network: {ssid}")

def main():
    while True:
        networks: list[Interface] = scan_wifi()
        
        if networks:
            for network in networks:
                connected = connect_to_smart_device(network)
                if connected:
                    configure_smart_device()
                else:
                    logging.info(f"Couldn't successfully connect to network - {network.ssid}")                
        else:
            logging.info("No smart devices that require configuring, Sleeping....")
                
        reconnect_to_wifi(NETWORK_SSID, NETWORK_PASSWORD)

        time.sleep(INTERVAL_SECONDS)
        
    
if __name__ == "__main__":
    CONNECTION_RETRY_COUNT = 10
    INTERVAL_SECONDS = 20
    TASMOTA_REGEX = "tasmota-"
    NETWORK_SSID = ""
    NETWORK_PASSWORD = ""
    main()

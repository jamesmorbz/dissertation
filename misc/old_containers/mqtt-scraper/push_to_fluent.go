package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	// "time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/fluent/fluent-logger-golang/fluent"
)

// Fluent Bit Logger
var fluentLogger *fluent.Fluent

func initFluentLogger() {
	var err error
	fluentLogger, err = fluent.New(fluent.Config{
		FluentHost: "fluentbit",
		FluentPort: 24224,
	})
	if err != nil {
		log.Fatalf("Failed to initialize Fluent Bit logger: %v", err)
	}
}

// Send data to Fluent Bit
func sendToFluentBit(tag string, record map[string]interface{}) {
	err := fluentLogger.Post(tag, record)
	if err != nil {
		log.Printf("Failed to send data to Fluent Bit: %v", err)
	}
}

// Parse power status
func parsePower(status string) (bool, error) {
	switch status {
	case "ON":
		return true, nil
	case "OFF":
		return false, nil
	default:
		return false, fmt.Errorf("unsupported status: %s", status)
	}
}

// Handle incoming MQTT messages
func onMessage(client mqtt.Client, msg mqtt.Message) {
	topic := msg.Topic()

	// Ignore certain topics - TODO: Flip the logic to be if topic == XXX, else Ignore.
	if strings.HasSuffix(topic, "/sensors") || strings.HasSuffix(topic, "/LWT") || strings.Contains(topic, "discovery") {
		log.Printf("Ignoring message - %s", topic)
		return
	}

	var payload map[string]interface{}
	err := json.Unmarshal(msg.Payload(), &payload)
	if err != nil {
		log.Printf("Bad Payload - %s - %s", topic, msg.Payload())
		return
	}

	fluentPayload := make(map[string]interface{})
	var tag string

	// Handle SENSOR topic
	if strings.HasSuffix(topic, "SENSOR") {
		energy, ok := payload["ENERGY"].(map[string]interface{})
		if !ok {
			log.Printf("Missing ENERGY field in payload: %v", payload)
			return
		}
		fluentPayload = map[string]interface{}{
			"hardware_name": topicSplit(topic, 1),
			"source_topic":  topic,
			"power":         energy["Power"],
			"voltage":       energy["Voltage"],
			"current":       energy["Current"],
		}
		tag = "wattage"

		// Handle STATE topic
	} else if strings.HasSuffix(topic, "STATE") {
		wifi, ok := payload["Wifi"].(map[string]interface{})
		if !ok {
			log.Printf("Missing Wifi field in payload: %v", payload)
			return
		}
		powerStatus, err := parsePower(payload["POWER"].(string))
		if err != nil {
			log.Printf("Failed to parse power status: %v", err)
			return
		}
		fluentPayload = map[string]interface{}{
			"hardware_name": topicSplit(topic, 1),
			"source_topic":  topic,
			"wifi_name":     wifi["SSId"],
			"power":         powerStatus,
			"uptime":        payload["UptimeSec"],
			"wifi_rssi":     wifi["RSSI"],
			"wifi_signal":   wifi["Signal"],
		}
		tag = "status"
	}

	if len(fluentPayload) > 0 {
		log.Printf("Sending Payload to Fluent Bit - %v", fluentPayload)
		sendToFluentBit(tag, fluentPayload)
	}
}

// Extract part of topic
func topicSplit(topic string, index int) string {
	parts := strings.Split(topic, "/")
	if len(parts) > index {
		return parts[index]
	}
	return ""
}

// Handle MQTT connection
func onConnect(client mqtt.Client) {
	log.Println("Connected to MQTT broker - Subscribing to all Topics")
	client.Subscribe("#", 0, nil)
}

func main() {
	// Initialize Fluent Bit logger
	initFluentLogger()
	defer fluentLogger.Close()

	// Setup MQTT client
	opts := mqtt.NewClientOptions()
	opts.AddBroker("tcp://mqtt:1883")
	opts.SetClientID("go-mqtt-client")
	opts.OnConnect = onConnect

	client := mqtt.NewClient(opts)

	// Connect to MQTT broker
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatalf("Failed to connect to MQTT broker: %v", token.Error())
	}

	// Subscribe to all topics
	client.Subscribe("#", 0, onMessage)

	// Graceful shutdown handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan

	log.Println("Shutting down...")
	client.Disconnect(250)
}

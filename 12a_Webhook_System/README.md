# Webhook System

This server provides a webhook service, enabling external systems to receive notifications on registered events.

## How it Works

1.  A receiving system runs a server configured to accept incoming webhooks.
2.  The receiving system registers its unique URL and selects the event types they wish to receive via this System's API.
3.  When a relevant Event occurs within this System, an HTTP POST request containing the event data is automatically sent to the subscribed URLs.

## Available Event Types

Receivers can subscribe to these specific events:
* `payment.received`
* `payment.processed`
* `invoice.processing`
* `invoice.completed`

## Receivers

To integrate with this webhook system, the integrator need:
* A running web server that can receive HTTP POST requests.
* A client (a script, a cli tool `curl`, or an API testing application `Postman`) to interact with this System's API for registration and management.

The integrators receiving endpoint must be configured to:
* Listen for `POST` requests.
* Accept and parse JSON request bodies.
* Respond with a `200 OK` status code to acknowledge receipt.

### Interacting with the System's API

All API calls should be made to the base URL of the Webhook System.

**The Webhook System Base URL:** `https://nasty-ways-kneel.loca.lt`

#### 1. Register Webhook

Subscribe your webhook receiver URL to specific event types.

* **Endpoint:** `/register`
* **Method:** `POST`

**Request Details:**
* **Method:** `POST`
* **URL:** `https://nasty-ways-kneel.loca.lt/register`
* **Body (JSON):**
    ```json
    {
      "url": "WEBHOOK_RECEIVER_URL",
      "event_types": ["event.type.1", "event.type.2"]
    }
    ```

* **Success Response (`201 Created`):** 
	```json
	{ 
		"message": "Webhook registered successfully.",
		"url": "WEBHOOK_RECEIVER_URL",
		"event_types": ["event.type.1", "event.type.2"],
		"registeredAt": "date and timestamp"
	}
	```
	
* **Errors:**
    * `400 Bad Request`: Invalid or missing data in the request body (missing URL, invalid URL format, missing or invalid event types).
    * `409 Conflict`: A webhook with the same URL and event types is already registered.
    * `500 Internal Server Error`: An unexpected server error occurred.

#### 2. Unregister Webhook
Remove a registered webhook subscription.
* **Endpoint:** `/unregister`
* **Method:** `DELETE`

**Request Details:**
* **Method:** `DELETE`
* **URL:** `https://nasty-ways-kneel.loca.lt/unregister`
* **Body (JSON):**
    ```json
    {
      "url": "REGISTERED_WEBHOOK_RECEIVER_URL",
      "event_types": ["event.type.1"]
    }
    ```
    * Without `event_types` (or if the array is empty), all registrations for the given URL are removed.
    * With `event_types` provided, the registration is removed if the URL matches and it's subscribed to minimum one of the specified event types.

* **Success Response (`200 OK`):** 
	```json
	{
		"message": "Webhooks unregistered successfully.",
		"url": "REGISTERED_WEBHOOK_URL"
		"removedCount": 1
	}
	```
* **Errors:**
    * `400 Bad Request`: Invalid or missing URL.
    * `404 Not Found`: No matching webhook registration found for the provided URL and event types (if specified).
    * `500 Internal Server Error`: An unexpected server error occurred.

#### 3. Ping Test
Trigger a test webhook call to all currently registered webhooks.

* **Endpoint:** `/ping`
* **Method:** `GET`

**Request Details:**
* **Method:** `GET`
* **URL:** `https://nasty-ways-kneel.loca.lt/ping`

* **Success Response (`200 OK`):** 
	```json
	{ 
		"message": "Ping event triggered for all registered webhooks." 
	}
	```
* **Errors:**
    * `500 Internal Server Error`: An unexpected server error occurred.
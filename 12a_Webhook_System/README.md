# Webhook System

This server provides a webhook service, enabling external systems to receive notifications on registered events.

## How it Works

1.  A **receiving system** runs a server configured to accept incoming webhooks.
2.  The **receiving system** **registers** its unique URL and selects the event types they wish to receive via this System's API.
3.  When a relevant **Event** occurs within this System, an HTTP **POST** request containing the event data is automatically sent to the subscribed URLs.

## Available Event Types

Receivers can subscribe to the following specific events:

* `payment.received`
* `payment.processed`
* `invoice.processing`
* `invoice.completed`
* `ping`

## For Receivers

To integrate with this webhook system, you will need:
* A running web server capable of receiving HTTP POST requests.
* A client (like a script or tool) to interact with this System's API for registration and management.

Your receiving endpoint must be configured to:
* Listen for `POST` requests.
* Accept and parse JSON request bodies.
* Respond with a `200 OK` status code to acknowledge receipt.

### Interacting with the System's API

All API calls should be made to the base URL of the Webhook System.

**Webhook System Base URL:** `https://eager-carpets-unite.loca.lt/`

#### 1. Register Webhook

Subscribe your webhook receiver URL to specific event types.

* **Endpoint:** `/register`
* **Method:** `POST`

**Request Details:**

* **Method:** `POST`
* **URL:** `https://eager-carpets-unite.loca.lt/register`
* **Body (JSON):**
    ```json
    {
      "url": "YOUR_WEBHOOK_RECEIVER_URL", // string, required - The full URL of your receiving endpoint
      "event_types": ["event.type.1", "event.type.2"] // array of strings, required - List of desired event types
    }
    ```

* **Success Response (`201 Created`):** `{ "message": "Webhook registered successfully.", ... }`
* **Errors:**
    * `400 Bad Request`: Invalid or missing data in the request body.
    * `409 Conflict`: A webhook with the same URL and event types is already registered.
    * `500 Internal Server Error`: An unexpected server error occurred.

#### 2. Unregister Webhook

Remove a previously registered webhook subscription.

* **Endpoint:** `/unregister`
* **Method:** `DELETE`

**Request Details:**

* **Method:** `DELETE`
* **URL:** `https://eager-carpets-unite.loca.lt/unregister`
* **Body (JSON):**
    ```json
    {
      "url": "YOUR_REGISTERED_WEBHOOK_RECEIVER_URL", // string, required - The URL to unregister
      "event_types": ["event.type.1"] // array of strings, optional - Specific types to unregister
    }
    ```
    * Without `event_types`, all registrations for the given URL are removed.
    * With `event_types`, the registration is removed if the URL matches AND it's subscribed to at least one of the specified types.

* **Success Response (`200 OK`):** `{ "message": "Webhooks unregistered successfully.", "removedCount": 1, ... }`
* **Errors:**
    * `400 Bad Request`: Invalid or missing URL.
    * `404 Not Found`: No matching webhook registration found.
    * `500 Internal Server Error`: An unexpected server error occurred.

#### 3. Ping Test

Trigger a test webhook call to all currently registered webhooks. Useful for verifying connectivity.

* **Endpoint:** `/ping`
* **Method:** `GET`

**Request Details:**

* **Method:** `GET`
* **URL:** `https://eager-carpets-unite.loca.lt/ping`
* **Body:** None required.

* **Success Response (`200 OK`):** `{ "message": "Ping event triggered for all registered webhooks." }`
* **Errors:**
    * `500 Internal Server Error`: An unexpected server error occurred.

#### Receiving Events (Webhook Data)

When an event you subscribed to occurs, your receiver endpoint will receive an HTTP `POST` request with a JSON body containing the event data.

**Webhook Payload Structure:**

```json
{
  "event_type": "the.name.of.the.event", // string - Type of event
  "timestamp": "ISO 8601 datetime string", // string - When the event occurred
  "data": {
    // object - Data specific to the event type
  }
}
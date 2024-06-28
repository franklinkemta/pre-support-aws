import json
import logging

from boto3.session import Session
from chalice import Chalice, WebsocketDisconnectedError

app = Chalice(app_name="pre-support-aws")
app.websocket_api.session = Session()
app.experimental_feature_flags.update(["WEBSOCKETS"])

# Configure logging
app.log.setLevel(logging.DEBUG)
app.debug = True


@app.route("/")
def index():
    return {"hello": "world"}


@app.on_ws_connect()
def connect(event):
    try:
        print("connect: %s" % event.connection_id)
    except Exception as e:
        app.log.error(
            f"Failed to send message to connection {event.connection_id}: {str(e)}"
        )


@app.on_ws_message()
def message(event):
    try:
        print("message: %s: %s" % (event.connection_id, event.body))

        data = {
            "type": "message",
            "sessionId": event.connection_id,
            "value": {
                "audioBlob": None,
                "transcript": str(event.body),
            },
        }
        app.websocket_api.send(
            connection_id=event.connection_id,
            message=json.dumps(data).encode("utf-8"),
        )

    except WebsocketDisconnectedError or Exception as e:
        app.log.warn(f"Unhandled message error {event.connection_id}: {str(e)}")


@app.on_ws_disconnect()
def disconnect(event):
    print("%s disconnected" % event.connection_id)

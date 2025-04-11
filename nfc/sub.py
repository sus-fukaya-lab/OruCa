import nfc
from nfc.tag import Tag
from nfc.tag.tt3 import BlockCode, ServiceCode
from typing import cast
import websockets
import json
import asyncio

SYSTEM_CODE = 0xFE00  # FeliCaのサービスコード
WS_URL = "ws://api:3000"  # WebSocketサーバーのURL

# WebSocketメッセージ送信関数を非同期関数に変更
async def update_log(student_ID: str, websocket):
    send_data = {
        "type": "log/write",
        "payload": {
            "result": True,
            "content": {"student_ID":student_ID},
            "message": f"ID:{student_ID}のログを更新"
        }
    }
    try:
        # send_dataをJSON形式にシリアライズして送信
        await websocket.send(json.dumps(send_data))
        response = await websocket.recv()
        print(f"Server says: {response}")
    except Exception as e:
        print(f"Error sending log: {e}")

def get_student_ID(tag: Tag):
    sc = ServiceCode(106, 0b001011)
    bc = BlockCode(0)
    student_id_bytearray = cast(bytearray, tag.read_without_encryption([sc], [bc]))
    role_classification = student_id_bytearray.decode("utf-8")[0:2]
    match role_classification:
        case "01" | "02":  # student
            return student_id_bytearray.decode("utf-8")[2:9]
        case _:  # unknown
            raise Exception(f"Unknown role classification: {role_classification}")

def on_connect_wrapper(websocket):
    def callback(tag: Tag):
        print("connected")
        if isinstance(tag, nfc.tag.tt3_sony.FelicaStandard) and SYSTEM_CODE in tag.request_system_code():
            tag.idm, tag.pmm, *_ = tag.polling(SYSTEM_CODE)

            try:
                student_ID = get_student_ID(tag)
                # 非同期関数を asyncio イベントループ上で実行
                asyncio.create_task(update_log(student_ID, websocket))
            except Exception as e:
                print(f"Error: {e}")
        return True

    return callback
    
def on_release(tag):
    print("released")
    return True

async def connect_nfc(websocket):
    on_connect = on_connect_wrapper(websocket)
    with nfc.ContactlessFrontend("usb") as clf: # 通常のwith構文で
        while True:
            # 非同期タスクとして on_connect を呼び出す
            clf.connect(rdwr={"on-connect":on_connect, "on-release": on_release})
    
async def main():
    # WebSocket接続
    async with websockets.connect(WS_URL) as websocket:
        print("WebSocket connected")
        # NFCリーダー接続と待機
        await connect_nfc(websocket)

# メインの非同期処理実行
asyncio.run(main())

import nfc
import requests
import logging
from datetime import datetime

SYSTEM_CODE = 0x809e
API_URL = "http://localhost:3000/log"  # APIサーバーのURL（例）

def on_connect(tag):
    print("connected")
    if isinstance(tag, nfc.tag.tt3_sony.FelicaStandard) and SYSTEM_CODE in tag.request_system_code():
        tag.idm, tag.pmm, *_ = tag.polling(0xffff)
        # 現在の日時をISO 8601形式で取得
        current_time = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        
        # APIにPOSTリクエストを送信
        response = requests.post(API_URL+"/write", json={
            'idm': tag.idm.hex(),
            'pmm': tag.pmm.hex(),
            'timestamp': current_time  # ここは実際の時間を使ってください
        },timeout=5000)
        if response.status_code == 200:
            print("Log saved successfully")
        else:
            print(f"Failed to save log: {response.status_code}")
    return True

def on_release(tag):
    print("released")
    
    # # APIからデータを取得
    # response = requests.get(API_URL + "/fetch")
    
    # # APIが正常にレスポンスを返した場合
    # if response.status_code == 200:
    #     # JSONデータをパース
    #     data = response.json()
        
    #     # データがリストの形式で {idm, pmm, timestamp} の配列で返されることを仮定
    #     if isinstance(data, list):
    #         for entry in data:
    #             # 各エントリが辞書形式 {idm, pmm, timestamp}
    #             idm = entry.get("idm")
    #             pmm = entry.get("pmm")
    #             timestamp = entry.get("timestamp")
                
    #             # 各データを出力
    #             print(f"IDm: {idm}, PMm: {pmm}, Timestamp: {timestamp}")
    #     else:
    #         print("APIのデータ形式が予期したものではありません。")
    # else:
    #     print(f"APIリクエストが失敗しました。ステータスコード: {response.status_code}")
    # exit()
    return True


with nfc.ContactlessFrontend("usb") as clf:
    while True:
        clf.connect(rdwr={"on-connect": on_connect, "on-release": on_release})

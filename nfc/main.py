import nfc
from nfc.tag import Tag
from nfc.tag.tt3 import BlockCode,ServiceCode
from typing import cast
import requests

SYSTEM_CODE = 0xFE00 # FeliCaのサービスコード
API_URL = "http://api:3000/log"  # APIサーバーのURL

def get_student_ID(tag:Tag):
        sc = ServiceCode(106,0b001011)
        bc = BlockCode(0)
        student_id_bytearray = cast(bytearray, tag.read_without_encryption([sc], [bc]))
        role_classification = student_id_bytearray.decode("utf-8")[0:2]
        match role_classification:
            case "01" | "02":  # student
                return student_id_bytearray.decode("utf-8")[2:9]
            # case "11":  # faculty
            #     student_id = f"Type:Faculity , Number:{student_id_bytearray.decode("utf-8")[2:8]}"
            case _:  # unknown
                raise f"Unknown role classification: {role_classification}"


def on_connect(tag:Tag):
    print("connected")
    if isinstance(tag, nfc.tag.tt3_sony.FelicaStandard) and SYSTEM_CODE in tag.request_system_code():
        tag.idm, tag.pmm, *_ = tag.polling(SYSTEM_CODE)
        try:
            student_ID = get_student_ID(tag)
            try:            
                # APIにPOSTリクエストを送信
                response = requests.post(API_URL+"/write", json={
                    "student_ID":student_ID,
                },timeout=5000)
                if response.status_code == 200:
                    print("Log saved successfully")
                else:
                    print(f"Failed to save log: {response.status_code}")
            except Exception as e:
                print(e)
        except Exception as e:
            print(e)
            pass
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

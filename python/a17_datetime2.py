import datetime

def main():
    now = datetime.datetime.now()

    if 9 < now.hour < 12:
        print(f"현재 시간은 {now.hour}시로 오전입니다.")
    elif now.hour < 9:
        print(f"현재 시간은 {now.hour}시로 새벽입니다.")
    else:
        print(f"현재 시간은 {now.hour}시로 오후입니다.")


    now_month = int(input("현재 월을 입력하세요: "))
    print(now_month, type(now_month))

    if now_month == 12 or 1 <= now_month <= 3:
        print("겨울")
    elif 4 <= now_month <= 5:
        print("봄")
    elif 6 <= now_month <= 8:
        print("여름")
    elif 9 <= now_month <= 11:
        print("가을")
    else:
        print("해당 월은 존재하지 않습니다.")

    if now.month in [12, 1, 2, 3]:
        print("겨울")
    elif now.month in [4, 5]:
        print("봄")
    elif now.month in [6, 7, 8]:
        print("여름")
    elif now.month in [9, 10, 11]:
        print("가을")

if __name__ == "__main__":
    main()
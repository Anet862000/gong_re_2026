import math
import sys

class MinusError(Exception):
    def __init__(self):
        message = "음수는 허용되지 않습니다."
        super().__init__(message)

def main():
    user_input = input("양의 정수입력: ")

    try:
        number_input = int(user_input)
        if number_input < 0:
              raise MinusError
    except MinusError as e:
        print(e)
    
    except ValueError as e:
        print(e)
    
    else:
        print(number_input)
        print(number_input * 2 * math.pi)
        print(math.pi * number_input ** 2)

    finally:
        print('프로그램 종료')

if __name__ == "__main__":
    main()
        
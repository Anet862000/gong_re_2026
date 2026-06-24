import math
import sys

def main():
    user_input = input("정수입력: ")

    try:
        number_input = int(user_input)
    
    except ValueError as e:
        print(e)
        sys.exit()
    else:
        print(number_input)
        print(number_input * 2 * math.pi)
        print(math.pi * number_input ** 2)

    finally:
        print('프로그램 종료')

if __name__ == "__main__":
    main()
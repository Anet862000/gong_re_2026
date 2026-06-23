def main():
    print(10 == 100)
    print(10 != 100)
    print(10 < 100)
    print(100 <= 100)
    print(type(True))

    print(not True)
    print(not False)
    print(True and True)
    print(True and False)
    print(False and False)

    a = int(input("100보다 큰 수를 입력하세요: "))

    if a > 100:
        print("100보다 큰 수를 입력하셨습니다.")
    print("프로그램이 종료되었습니다.")

if __name__ == "__main__":
    main()
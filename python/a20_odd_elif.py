def main():
    number = int(input("정수를 입력하세요: "))

    if number % 2:  # number % 2가 0이 아니면 참이므로 홀수입니다.(0 1 -> 0이면 false)
        print(f"{number}는 홀수입니다.")
    else:
        print(f"{number}는 짝수입니다.")
    
    print("홀수" if number % 2 else "짝수", "\b입니다.")  # 삼항 연산자

if __name__ == "__main__":
    main()
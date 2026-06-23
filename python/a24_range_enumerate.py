def main():
    print(range(10)) #0 ~ 9까지
    print(range(0, 10, 1)) #0 ~ 9까지 1씩 증가

    a = range(10)
    print(list(a))

    print(list(range(5, 10, 3))) #5 ~ 9까지 3씩 증가

    a = []
    for i in range(0, 100, 2):
        a.append(i+1)
    print(a)

    list_b = ['a', 'b', 'c', 'd', 'e', 'f']

    a = 0
    for ele in list_b: #c스타일 for문
        print(str(a) + '번째 원소: ' + ele)
        a += 1

    for a, ele in enumerate(list_b): #파이썬 스타일 for문
        print(str(a) + '번째 원소: ' + ele)

    #list comprehension
    a = [i+1 for i in range(100)]
    print(a)

    list_c = ['에이', '비', '씨', '디', '이', '에프']
    for i in range(6):
        print(list_b[i] + ' : ' + list_c[i]) #c스타일 for문

    for b, c in zip(list_b, list_c):
        print(b + ' : ' + c) #파이썬 스타일 for문, zip은 리스트 요소를 하나씩 묶어서 반환하는 함수(pythonic, pydantic)

if __name__ == '__main__':
    main()
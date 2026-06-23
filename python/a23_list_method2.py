import datetime

def main():
    ptime = datetime.datetime.now()
    list_a = [0, 1, 2, 3, 4, 5, 6]
    list_b = ['a', 'b', 'c', 'd', 'e', 'f']

    del list_a[0] #리스트 요소 삭제하기
    del list_b[2]
    del list_b[4]
    del ptime
    print(list_a)
    print(list_b)

    print(list_b.pop())
    print(list_b)


    if 'a' in list_b:
        list_b.remove('a')
    print(list_b)
    

if __name__ == '__main__':
    main()
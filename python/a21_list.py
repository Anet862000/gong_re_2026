import datetime

def main():
    list_a = []
    list_b = list()

    print(type(list_a))
    print(type(list_b))

    ptime = datetime.datetime.now()
    list_c = [1, 2, 3.3, 'Lee', ptime, True]

    print(list_c[3])
    print(list_c[-1])
    list_c[0] = 'youn'
    print(list_c)

    list_d = [[1, 2, 3], [4, 5, 6], [7, 8, 9]] #0 ~ n-1까지
    print(list_d[1][2]) #6
    print(list_d[0][1]) #2

    print(len(list_d)) #개수 확인
    print(list_d.__len__()) #개수 확인



if __name__ == '__main__':
    main()
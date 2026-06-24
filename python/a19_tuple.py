def main():
    tu = tuple()
    print(tu, tuple(tu))

    tu = (1, 2)
    print(tu, tuple(tu))
    print(tu[0])

    for ele in tu:
        print(ele)

    tu_1 = 1, 2
    print(tu_1, type(tu_1))

    a = 10
    b = 20

    tmp = a
    a = b
    b = tmp     #c스타일
    print(a, b)

    a, b = b, a #파이썬 스타일
    print(a, b)

if __name__ == "__main__":
    main()